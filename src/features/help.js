const { Events, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName !== 'help') return;

        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📖 คู่มือการใช้งานบอท')
            .setDescription('นี่คือรายการคำสั่งทั้งหมดที่คุณสามารถใช้งานได้:')
            .addFields(
                { name: '🏓 /ping', value: 'ตรวจสอบสถานะบอท' },
                { name: '📝 /checkin [name]', value: 'เช็คชื่อประจำวัน บันทึกลงฐานข้อมูล' },
                { name: '⏰ /remind [msg] [h/m/s]', value: 'ตั้งเวลาเตือนความจำ' },
                { name: '🗳️ /poll [question] [opt1-5]', value: 'สร้างโพลโหวตพร้อมปุ่มกด' },
                { name: '📍 /find [query]', value: 'ค้นหาสถานที่ แผนที่ และพยากรณ์อากาศ' },
                { name: '🚀 /action-send [channel] [msg]', value: 'ส่งงานที่ต้องมีคนกดรับ (Action Dispatch)' },
                { name: '📢 /action-notify [channel] [msg]', value: 'ส่งประกาศแจ้งเตือนแบบด่วน' },
                { name: '📅 /action-schedule [channel] [msg] [time]', value: 'ตั้งเวลาส่งงานอัตโนมัติ' },
                { name: '📋 /action-list', value: 'ดูรายการงานที่ตั้งเวลาไว้' },
                { name: '❓ /help', value: 'แสดงเมนูช่วยเหลือนี้' }
            )
            .setFooter({ text: 'Discord Bot Help Menu', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    });
};
