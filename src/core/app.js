require('dotenv/config');
const { Client, Events, GatewayIntentBits } = require('discord.js');

function startBot(callback) {
    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ] 
    });

    client.once(Events.ClientReady, (c) => {
        console.log(`🟢 ระบบแกนหลัก: บอท ${c.user.tag} ออนไลน์แล้ว!`);
        if (callback) callback(client);
    });

    client.login(process.env.TOKEN);
}

module.exports = { startBot };
