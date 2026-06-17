require('dotenv').config();
const { startBot } = require('./core/app.js');

// นำเข้าฟีเจอร์ต่าง ๆ
const pingFeature = require('./features/ping.js');
const attendanceFeature = require('./features/attendance.js');
const remindersFeature = require('./features/reminders.js');
const pollFeature = require('./features/poll.js');
const helpFeature = require('./features/help.js');
const actionDispatchFeature = require('./features/action_dispatch.js');
const locationFeature = require('./features/location.js');

console.log("✅ กำลังเริ่มทำงาน...");

startBot((client) => {
    // โหลดฟีเจอร์ทั้งหมดเข้าสู่ระบบ
    pingFeature(client);
    attendanceFeature(client);
    remindersFeature(client);
    pollFeature(client);
    helpFeature(client);
    actionDispatchFeature(client);
    locationFeature(client);

    console.log("✅ ระบบทำงานสมบูรณ์: โหลดฟีเจอร์และปลั๊กอินทั้งหมดเรียบร้อยแล้ว!");
});
