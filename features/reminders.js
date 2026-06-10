const { Events } = require('discord.js');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const { commandName, user } = interaction;

        if (commandName === 'remind') {
            const message = interaction.options.getString('message');
            const hours = interaction.options.getInteger('hours') || 0;
            const minutes = interaction.options.getInteger('minutes') || 0;
            const seconds = interaction.options.getInteger('seconds') || 0;

            // คำนวณเวลาทั้งหมดเป็นมิลลิวินาที
            const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

            if (totalMs <= 0) {
                return await interaction.reply({ content: '❌ กรุณาระบุเวลาให้มากกว่า 0 วินาทีครับ', ephemeral: true });
            }

            // สร้างข้อความสรุปเวลาที่ตั้ง
            let timeString = '';
            if (hours > 0) timeString += `${hours} ชั่วโมง `;
            if (minutes > 0) timeString += `${minutes} นาที `;
            if (seconds > 0) timeString += `${seconds} วินาที`;

            await interaction.reply(`⏰ ได้เลย! ผมจะเตือนคุณเรื่อง "${message}" ในอีก ${timeString.trim()} ข้างหน้าครับ`);

            setTimeout(async () => {
                try {
                    await interaction.followUp(`🔔 **แจ้งเตือนคุณ ${user}!**\n> ${message}`);
                } catch (e) {
                    console.error('ส่งแจ้งเตือนไม่สำเร็จ:', e);
                }
            }, totalMs);
        }
    });
};
