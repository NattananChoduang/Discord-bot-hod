const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName !== 'find') return;

        const query = interaction.options.getString('query');
        const apiKey = process.env.LOCATIONIQ_API_KEY;

        console.log(`🔍 [Location] Checking for API Key... (Found: ${!!apiKey})`);

        if (!apiKey) {
            return interaction.reply({ 
                content: '❌ ยังไม่ได้ตั้งค่า `LOCATIONIQ_API_KEY` ในไฟล์ .env กรุณาตั้งค่าก่อนใช้งานฟีเจอร์นี้',
                ephemeral: true 
            });
        }

        await interaction.deferReply();

        try {
            // 1. ค้นหาพิกัด (Forward Geocoding)
            const searchUrl = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json&limit=1`;
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchData || searchData.error || searchData.length === 0) {
                throw new Error('ไม่พบสถานที่ที่ระบุ');
            }

            const result = searchData[0];
            const lat = parseFloat(result.lat).toFixed(6);
            const lon = parseFloat(result.lon).toFixed(6);
            const displayName = result.display_name;

            // 2. ดึงข้อมูลพยากรณ์อากาศด้วยพิกัด (Optional)
            let weatherInfo = null;
            try {
                const weatherResponse = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
                if (weatherResponse.ok) {
                    const weatherData = await weatherResponse.json();
                    const current = weatherData.current_condition[0];
                    weatherInfo = {
                        temp: current.temp_C,
                        feelsLike: current.FeelsLikeC,
                        desc: current.weatherDesc[0].value,
                        humidity: current.humidity,
                        windSpeed: current.windspeedKmph
                    };
                }
            } catch (wError) {
                console.error('Weather Fetch Error (via /find):', wError);
            }

            // 3. สร้าง URL สำหรับ Static Map
            const staticMapUrl = `https://maps.locationiq.com/v3/staticmap?key=${apiKey}&center=${lat},${lon}&zoom=15&size=600x400&markers=icon:large-red-cutout|${lat},${lon}&format=png&maptype=streets`;

            // 4. สร้าง Embed
            const embed = new EmbedBuilder()
                .setTitle(`📍 ผลการค้นหา: ${query}`)
                .setDescription(`**${displayName}**`)
                .addFields(
                    { name: '🌐 พิกัด (Latitude, Longitude)', value: `\`${lat}, ${lon}\``, inline: false }
                )
                .setImage(staticMapUrl)
                .setColor(0x00FF00)
                .setTimestamp()
                .setFooter({ text: 'Powered by LocationIQ & wttr.in' });

            if (weatherInfo) {
                embed.addFields(
                    { name: '🌡️ อุณหภูมิ', value: `**${weatherInfo.temp}°C**\n(รู้สึกเหมือน ${weatherInfo.feelsLike}°C)`, inline: true },
                    { name: '☁️ สภาพอากาศ', value: `**${weatherInfo.desc}**`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // เว้นวรรคเพื่อให้จัดแถวสวยงาม
                    { name: '💧 ความชื้น', value: `**${weatherInfo.humidity}%**`, inline: true },
                    { name: '🌬️ ความเร็วลม', value: `**${weatherInfo.windSpeed}** กม./ชม.`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }
                );
                // ปรับสีตามอุณหภูมิ (ถ้าร้อน > 30 ใช้สีส้ม)
                if (parseInt(weatherInfo.temp) > 30) embed.setColor(0xff4500);
            }

            // 5. สร้างปุ่มลิงก์ไปยัง Google Maps
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('เปิดใน Google Maps')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`),
                    new ButtonBuilder()
                        .setLabel('เปิดใน OpenStreetMap')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('LocationIQ Error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ ไม่พบสถานที่')
                .setDescription(`ไม่สามารถหาข้อมูลของ "${query}" ได้ กรุณาตรวจสอบชื่อสถานที่และลองใหม่อีกครั้ง`);
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    });
};
