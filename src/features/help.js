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
                { name: '🏓 /ping', value: 'ตรวจสอบว่าบอทยังทำงานอยู่หรือไม่ (ตอบกลับด้วย Pong!)' },
                { name: '📝 /checkin [name]', value: 'เช็คชื่อประจำวัน บันทึกลงในระบบฐานข้อมูล' },
                { name: '⏰ /remind [message] [hours] [minutes] [seconds]', value: 'ตั้งเวลาเตือนความจำสำหรับเรื่องต่าง ๆ' },
                { name: '🗳️ /poll [question] [option1-5]', value: 'สร้างโพลสำรวจความคิดเห็นพร้อมปุ่มกดโหวต (สูงสุด 5 ตัวเลือก)' },
                { name: '❓ /help', value: 'แสดงเมนูช่วยเหลือและวิธีการใช้งานคำสั่งทั้งหมด' }
            )
            .setFooter({ text: 'Discord Bot Help Menu', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    });
};
