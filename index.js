const readline = require('readline');
require('dotenv').config();
const { startBot } = require('./core/app.js');

// นำเข้าฟีเจอร์ต่าง ๆ
const pingFeature = require('./features/ping.js');
const attendanceFeature = require('./features/attendance.js');
const remindersFeature = require('./features/reminders.js');
const pollFeature = require('./features/poll.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("🔒 ระบบรักษาความปลอดภัยของซอร์สโค้ด");

const startApp = () => {
    console.log("✅ กำลังเริ่มทำงาน...");
    
    startBot((client) => {
        // โหลดฟีเจอร์ทั้งหมดเข้าสู่ระบบ
        pingFeature(client);
        attendanceFeature(client);
        remindersFeature(client);
        pollFeature(client);

        console.log("✅ ระบบทำงานสมบูรณ์: โหลดฟีเจอร์และปลั๊กอินทั้งหมดเรียบร้อยแล้ว!");
    });
};

// ตรวจสอบว่ามี Key ใน .env หรือไม่เพื่อข้ามการกรอก
if (process.env.ACCESS_KEY) {
    console.log("🔑 ตรวจพบ Access Key จากระบบ (.env) เรียบร้อย");
    startApp();
    rl.close();
} else {
    // ฟังก์ชันถาม Key Access กรณีไม่มีใน .env
    rl.question('🔑 กรุณาใส่ Key Access เพื่อเริ่มต้นใช้งาน: ', (inputKey) => {
        if (inputKey === "mysecretkey123") { // ใส่ fallback หรือตรวจจากแหล่งอื่นถ้าจำเป็น
            console.log("✅ Key ถูกต้อง!");
            startApp();
            rl.close();
        } else {
            console.log("❌ Key ไม่ถูกต้อง! บอทจะหยุดทำงานทันที");
            process.exit(0);
        }
    });
}
