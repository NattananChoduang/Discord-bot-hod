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
  {
    name: 'help',
    description: 'แสดงเมนูช่วยเหลือและวิธีใช้งาน 📖',
  },
  {
    name: 'action-send',
    description: 'ยิงข้อความ Action (ต้องมีคนกดรับงาน) 🚀',
    options: [
      {
        name: 'channel',
        description: 'ห้องที่ต้องการส่งข้อความไป',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'message',
        description: 'เนื้อหาข้อความที่ต้องการส่ง',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'action-notify',
    description: 'ยิงประกาศแจ้งเตือน (ไม่ต้องกดตอบรับ) 📢',
    options: [
      {
        name: 'channel',
        description: 'ห้องที่ต้องการส่งประกาศ',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'message',
        description: 'เนื้อหาประกาศ',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'action-schedule',
    description: 'ตั้งเวลาส่ง Action อัตโนมัติ ⏰',
    options: [
      {
        name: 'channel',
        description: 'ห้องที่ต้องการส่ง',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: 'message',
        description: 'ข้อความที่จะส่ง',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'hour',
        description: 'ชั่วโมง (0-23)',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: 'minute',
        description: 'นาที (0-59)',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: 'days',
        description: 'วันที่ต้องการให้ส่ง',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: 'ทุกวัน', value: '*' },
          { name: 'จันทร์-ศุกร์', value: '1-5' },
          { name: 'เสาร์-อาทิตย์', value: '0,6' },
        ],
      },
    ],
  },
  {
    name: 'action-list',
    description: 'ดูรายการ Action อัตโนมัติที่ตั้งไว้ 📋',
  },
  {
    name: 'find',
    description: 'ค้นหาสถานที่และแผนที่ (LocationIQ) 📍',
    options: [
      {
        name: 'query',
        description: 'ชื่อสถานที่หรือที่อยู่ที่ต้องการค้นหา',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

const args = process.argv.slice(2);

(async () => {
  try {
    if (args.includes('--clean')) {
      console.log('🧹 กำลังล้างคำสั่งทั้งหมด...');
      // ล้าง Global Commands
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
      // ล้าง Guild Commands
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
      console.log('✅ ล้างคำสั่งสำเร็จ!');
      return;
    }

    console.log(`📡 กำลังลงทะเบียนคำสั่งในเซิร์ฟเวอร์หลัก (Guild ID: ${GUILD_ID})...`);
    console.log('💡 (วิธีนี้คำสั่งจะขึ้นทันทีเพื่อการทดสอบ)');
    
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    
    console.log('✅ ลงทะเบียนคำสั่งในเซิร์ฟเวอร์สำเร็จ!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
})();
