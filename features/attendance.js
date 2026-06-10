const { createClient } = require('@supabase/supabase-js');
const { Events, MessageFlags } = require('discord.js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName !== 'checkin') return;

        const userId = interaction.user.id;
        const inputName = interaction.options.getString('name');
        
        const today = new Date().toISOString().split('T')[0];
        
        const internationalTimestamp = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const { data: existing, error: checkError } = await supabase
                .from('attendance')
                .select('*')
                .eq('user_id', userId)
                .eq('checkin_date', today)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking attendance:', checkError);
                return interaction.editReply('❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลครับ');
            }

            if (existing) {
                return interaction.editReply('❌ วันนี้คุณเช็คชื่อไปแล้วครับ! มาใหม่พรุ่งนี้นะ');
            }

            const { error: insertError } = await supabase
                .from('attendance')
                .insert([
                    { 
                        user_id: userId, 
                        user_name: inputName, 
                        checkin_date: today 
                    }
                ]);

            if (insertError) {
                console.error('Error inserting attendance:', insertError);
                return interaction.editReply('❌ บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่ภายหลัง');
            }

            await interaction.editReply(`✅ คุณ **${inputName}** เช็คชื่อสำเร็จแล้ว!\n📅 **เวลาเช็คอิน:** ${internationalTimestamp}`);

        } catch (err) {
            console.error('Unexpected error:', err);
            interaction.editReply('❌ ระบบขัดข้องชั่วคราว กรุณาติดต่อแอดมิน');
        }
    });
};
