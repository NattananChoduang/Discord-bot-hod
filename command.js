require('dotenv/config');
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = '1445128290430877757';

const commands = [
  {
    name: 'ping',
    description: 'ตอบกลับด้วย Pong!',
  },
  {
    name: 'checkin',
    description: 'เช็คชื่อประจำวัน 📝',
    options: [
      {
        name: 'name',
        description: 'ชื่อของคุณที่ต้องการบันทึก',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'remind',
    description: 'ตั้งเวลาเตือนความจำ ⏰',
    options: [
      {
        name: 'message',
        description: 'เรื่องที่ต้องการให้เตือน',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'hours',
        description: 'จำนวนชั่วโมง',
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
      {
        name: 'minutes',
        description: 'จำนวนนาที',
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
      {
        name: 'seconds',
        description: 'จำนวนวินาที',
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },
  {
    name: 'poll',
    description: 'สร้างโหวต/โพลถามเพื่อนในทีม (สูงสุด 5 ตัวเลือก) 🗳️',
    options: [
      {
        name: 'question',
        description: 'หัวข้อที่ต้องการถาม',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'option1',
        description: 'ตัวเลือกที่ 1',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'option2',
        description: 'ตัวเลือกที่ 2',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'option3',
        description: 'ตัวเลือกที่ 3 (ไม่บังคับ)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'option4',
        description: 'ตัวเลือกที่ 4 (ไม่บังคับ)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'option5',
        description: 'ตัวเลือกที่ 5 (ไม่บังคับ)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🧹 กำลังล้างคำสั่งแบบ Global...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });

    console.log(`📡 กำลังลงทะเบียนคำสั่งในเซิร์ฟเวอร์: ${GUILD_ID}...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ อัปเดตคำสั่งสำเร็จ! (เพิ่มตัวเลือกเวลาใน Reminder เรียบร้อย)');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
})();
