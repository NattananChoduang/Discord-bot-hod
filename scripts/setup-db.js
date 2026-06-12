require('dotenv').config();
const { Client } = require('pg');

const sql = `
CREATE TABLE IF NOT EXISTS attendance (
  id bigint primary key generated always as identity,
  user_id text not null,
  guild_id text not null,
  guild_name text,
  user_name text,
  checkin_date date default current_date,
  created_at timestamptz default now()
);

-- สร้าง Index ถ้ายังไม่มี
CREATE INDEX IF NOT EXISTS idx_user_guild_date ON attendance(user_id, guild_id, checkin_date);
`;

async function setup() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ ไม่พบ DATABASE_URL ในไฟล์ .env');
        console.log('กรุณาไปที่ Supabase -> Settings -> Database -> Connection String (Node.js)');
        console.log('แล้วนำมาใส่ใน .env ก่อนรันสคริปต์นี้ครับ');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('⏳ กำลังเชื่อมต่อกับ Supabase...');
        await client.connect();
        console.log('✅ เชื่อมต่อสำเร็จ! กำลังสร้างตาราง...');
        
        await client.query(sql);
        
        console.log('✨ ตั้งค่าฐานข้อมูลเรียบร้อยแล้ว! ตอนนี้คุณสามารถรันบอทได้เลย');
    } catch (err) {
        console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า:', err.message);
    } finally {
        await client.end();
    }
}

setup();
