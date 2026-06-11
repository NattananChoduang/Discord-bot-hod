const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');

const dbPath = './database/database.json';
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const emojiMap = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        const db = readDB();
        if (!db.polls) db.polls = {};

        // --- 1. สร้าง Poll (Slash Command) ---
        if (interaction.isChatInputCommand() && interaction.commandName === 'poll') {
            const question = interaction.options.getString('question');
            const pollId = Date.now().toString();
            
            // รวบรวมตัวเลือกที่มีการกรอกมา (1-5)
            const options = [];
            for (let i = 1; i <= 5; i++) {
                const optText = interaction.options.getString(`option${i}`);
                if (optText) {
                    options.push({ id: `opt${i}`, text: optText, votes: [] });
                }
            }

            db.polls[pollId] = {
                question,
                options: options,
                creator: interaction.user.id
            };
            writeDB(db);

            // สร้าง Embed แสดงผล
            const description = options.map((opt, index) => `${emojiMap[index]} ${opt.text} (0)`).join('\n');
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🗳️ มาโหวตกันเถอะ!')
                .setDescription(`**หัวข้อ:** ${question}\n\n${description}`)
                .setFooter({ text: `สร้างโดย ${interaction.user.username} | ID: ${pollId}` });

            // สร้างปุ่มกดตามจำนวนตัวเลือก
            const row = new ActionRowBuilder();
            options.forEach((opt, index) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`poll_${pollId}_${opt.id}`)
                        .setLabel(opt.text)
                        .setEmoji(emojiMap[index])
                        .setStyle(ButtonStyle.Primary)
                );
            });

            await interaction.reply({ embeds: [embed], components: [row] });
        }

        // --- 2. จัดการการคลิกปุ่มโหวต ---
        if (interaction.isButton() && interaction.customId.startsWith('poll_')) {
            const [, pollId, optionId] = interaction.customId.split('_');
            const poll = db.polls[pollId];

            if (!poll) {
                return await interaction.reply({ content: '❌ ไม่พบข้อมูลโหวตนี้ในระบบ', flags: [MessageFlags.Ephemeral] });
            }

            const userId = interaction.user.id;
            // ตรวจสอบว่าเคยโหวตในตัวเลือกใดตัวเลือกหนึ่งของ poll นี้ไปหรือยัง
            const alreadyVoted = poll.options.some(opt => opt.votes.includes(userId));

            if (alreadyVoted) {
                return await interaction.reply({ content: '❌ คุณเคยโหวตไปแล้วครับ!', flags: [MessageFlags.Ephemeral] });
            }

            // ค้นหาตัวเลือกที่เลือกและเพิ่มคะแนน
            const targetOption = poll.options.find(opt => opt.id === optionId);
            if (targetOption) {
                targetOption.votes.push(userId);
                writeDB(db);
            }

            // อัปเดตข้อความ Embed ใหม่
            const updatedDescription = poll.options.map((opt, index) => 
                `${emojiMap[index]} ${opt.text} (${opt.votes.length})`
            ).join('\n');

            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(`**หัวข้อ:** ${poll.question}\n\n${updatedDescription}`);

            await interaction.update({ embeds: [updatedEmbed] });
        }
    });
};
