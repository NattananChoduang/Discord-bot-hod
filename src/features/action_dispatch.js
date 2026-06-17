const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// เก็บรายการ Cron Jobs ที่กำลังทำงานอยู่ใน Memory
const activeSchedules = new Map();

module.exports = (client) => {

    // --- ฟังก์ชันช่วยเหลือสำหรับตอบกลับ Interaction อย่างปลอดภัย ---
    const safeReply = async (interaction, options) => {
        try {
            if (interaction.replied || interaction.deferred) {
                return await interaction.editReply(options);
            }
            return await interaction.reply(options);
        } catch (err) {
            console.error('Safe Reply Error:', err);
        }
    };

    // --- ฟังก์ชันหลักในการยิง Action (Reusable) ---
    const dispatchAction = async (targetChannelId, content, senderUser = null, isNotify = false) => {
        try {
            const channel = await client.channels.fetch(targetChannelId).catch(() => null);
            if (!channel) {
                console.error(`[Dispatch] Channel ${targetChannelId} not found.`);
                return null;
            }

            let actionId = null;

            // 1. บันทึกลง Supabase (เฉพาะ Action Mode)
            if (!isNotify) {
                const { data, error } = await supabase
                    .from('actions')
                    .insert([{
                        sender_id: senderUser ? senderUser.id : client.user.id,
                        sender_tag: senderUser ? senderUser.tag : client.user.tag,
                        target_channel_id: targetChannelId,
                        content: content,
                        status: 'pending'
                    }])
                    .select().single();

                if (error) throw error;
                actionId = data.id;
            }

            // 2. สร้าง Embed
            const embed = new EmbedBuilder()
                .setColor(isNotify ? 0x9B59B6 : (senderUser ? 0x0099FF : 0xF1C40F))
                .setTitle(isNotify ? '📢 ประกาศแจ้งเตือน' : (senderUser ? '🚀 มี Action ใหม่ถึงคุณ!' : '⏰ Action อัตโนมัติ'))
                .setDescription(`${content}`)
                .addFields(
                    { name: 'ผู้ส่ง', value: senderUser ? `<@${senderUser.id}>` : (isNotify ? `🤖 ระบบประกาศ` : `🤖 ระบบอัตโนมัติ`), inline: true }
                )
                .setTimestamp();

            if (!isNotify) {
                embed.addFields({ name: 'สถานะ', value: '⏳ รอการตอบกลับ', inline: true });
                embed.setFooter({ text: `Action ID: ${actionId}` });
            }

            // 3. สร้างปุ่ม (เฉพาะ Action Mode)
            const components = [];
            if (!isNotify) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`action_complete_${actionId}`)
                        .setLabel('✅ รับทราบและดำเนินการแล้ว')
                        .setStyle(ButtonStyle.Success)
                );
                components.push(row);
            }

            // 4. ยิงข้อความ
            await channel.send({ embeds: [embed], components: components });
            return actionId;
        } catch (err) {
            console.error('Dispatch Action Error:', err);
            return null;
        }
    };

    // --- ฟังก์ชันโหลด Schedule จาก DB ---
    const loadSchedules = async () => {
        console.log('🔄 กำลังโหลดรายการตั้งเวลาทั้งหมด...');
        
        activeSchedules.forEach(job => job.stop());
        activeSchedules.clear();

        try {
            const { data: schedules, error } = await supabase
                .from('action_schedules')
                .select('*')
                .order('created_at', { ascending: true });
                
            if (error) throw error;

            schedules.forEach(s => {
                const job = cron.schedule(s.cron_expression, () => {
                    console.log(`⏰ [Auto] ทำงานตามกำหนดการ: ${s.id}`);
                    dispatchAction(s.target_channel_id, s.content);
                }, { timezone: "Asia/Bangkok" });
                
                activeSchedules.set(s.id, job);
            });
            console.log(`✅ โหลดสำเร็จ: ${schedules.length} รายการ`);
        } catch (err) {
            console.error('Error loading schedules:', err);
        }
    };

    // โหลดครั้งแรกเมื่อบอทเริ่มทำงาน
    client.once(Events.ClientReady, () => {
        loadSchedules();
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            // --- 1. ยิง Action ทันที ---
            if (interaction.isChatInputCommand() && interaction.commandName === 'action-send') {
                const targetChannel = interaction.options.getChannel('channel');
                const content = interaction.options.getString('message');
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const actionId = await dispatchAction(targetChannel.id, content, interaction.user, false);
                
                if (actionId) {
                    await safeReply(interaction, `✅ ยิง Action เรียบร้อยแล้ว! (ID: ${actionId})`);
                } else {
                    await safeReply(interaction, '❌ ไม่สามารถยิง Action ได้ กรุณาตรวจสอบสิทธิ์ของบอทในห้องนั้น');
                }
            }

            // --- 2. ยิงประกาศ ---
            if (interaction.isChatInputCommand() && interaction.commandName === 'action-notify') {
                const targetChannel = interaction.options.getChannel('channel');
                const content = interaction.options.getString('message');
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                await dispatchAction(targetChannel.id, content, interaction.user, true);
                await safeReply(interaction, `✅ ยิงประกาศแจ้งเตือนไปที่ <#${targetChannel.id}> เรียบร้อยแล้ว!`);
            }

            // --- 3. ตั้งเวลาใหม่ ---
            if (interaction.isChatInputCommand() && interaction.commandName === 'action-schedule') {
                const channel = interaction.options.getChannel('channel');
                const message = interaction.options.getString('message');
                const hour = interaction.options.getInteger('hour');
                const minute = interaction.options.getInteger('minute');
                const days = interaction.options.getString('days');

                const cronExp = `${minute} ${hour} * * ${days}`;

                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

                const { data, error } = await supabase
                    .from('action_schedules')
                    .insert([{
                        guild_id: interaction.guildId,
                        target_channel_id: channel.id,
                        content: message,
                        cron_expression: cronExp,
                        created_by: interaction.user.id
                    }])
                    .select().single();

                if (error) throw error;

                // เพิ่มเข้า Memory ทันทีโดยไม่ต้องโหลดใหม่ทั้งหมด
                const job = cron.schedule(cronExp, () => {
                    console.log(`⏰ [Auto] ทำงานตามกำหนดการ (ใหม่): ${data.id}`);
                    dispatchAction(channel.id, message);
                }, { timezone: "Asia/Bangkok" });
                
                activeSchedules.set(data.id, job);

                await safeReply(interaction, `✅ ตั้งเวลาสำเร็จ! บอทจะส่งข้อความนี้ทุกวันตามเวลาที่คุณกำหนด\n📅 **เวลา:** ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} น.\n📅 **Cron:** \`${cronExp}\``);
            }

            // --- 4. ดูรายการที่ตั้งไว้ ---
            if (interaction.isChatInputCommand() && interaction.commandName === 'action-list') {
                const { data: schedules, error } = await supabase
                    .from('action_schedules')
                    .select('*')
                    .eq('guild_id', interaction.guildId)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (schedules.length === 0) {
                    return await safeReply(interaction, { content: '📋 ยังไม่มีการตั้งเวลาอัตโนมัติในเซิร์ฟเวอร์นี้', flags: [MessageFlags.Ephemeral] });
                }

                const list = schedules.map((s, i) => 
                    `${i+1}. **ห้อง:** <#${s.target_channel_id}>\n   **เวลา (Cron):** \`${s.cron_expression}\`\n   **ข้อความ:** ${s.content}\n   **ID:** \`${s.id}\``
                ).join('\n\n');

                const embed = new EmbedBuilder()
                    .setTitle('📋 รายการ Action อัตโนมัติ')
                    .setDescription(list)
                    .setColor(0xF1C40F);

                await safeReply(interaction, { embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            // --- 5. จัดการปุ่มตอบกลับ ---
            if (interaction.isButton() && interaction.customId.startsWith('action_complete_')) {
                const actionId = interaction.customId.replace('action_complete_', '');
                
                const { data: action, error: fetchError } = await supabase.from('actions').select('*').eq('id', actionId).single();
                if (fetchError || !action) return await safeReply(interaction, { content: '❌ ไม่พบข้อมูล Action นี้', flags: [MessageFlags.Ephemeral] });
                if (action.status === 'completed') return await safeReply(interaction, { content: '❌ งานนี้ได้รับการตอบกลับไปแล้ว', flags: [MessageFlags.Ephemeral] });

                await supabase.from('actions').update({
                    status: 'completed',
                    completed_by_id: interaction.user.id,
                    completed_by_tag: interaction.user.tag,
                    updated_at: new Date()
                }).eq('id', actionId);

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0x2ECC71)
                    .addFields({ name: '✅ ดำเนินการแล้วโดย', value: `<@${interaction.user.id}>`, inline: false });
                
                // ใช้ interaction.update สำหรับปุ่ม
                await interaction.update({ embeds: [updatedEmbed], components: [] });

                // ส่ง DM แจ้งผู้สั่งงาน (ถ้าทำได้)
                try {
                    const sender = await client.users.fetch(action.sender_id);
                    if (sender) {
                        await sender.send(`✅ **Action ของคุณเสร็จสิ้นแล้ว!**\n**งาน:** "${action.content}"\n**ดำเนินการโดย:** ${interaction.user.tag}`);
                    }
                } catch (e) {
                    console.log(`[Dispatch] Could not send DM to sender ${action.sender_id}`);
                }
            }
        } catch (err) {
            console.error('Interaction Error (Dispatch):', err);
            await safeReply(interaction, { content: '❌ เกิดข้อผิดพลาดในการประมวลผลคำสั่ง', flags: [MessageFlags.Ephemeral] });
        }
    });
};
