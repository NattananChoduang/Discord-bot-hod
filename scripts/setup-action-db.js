require('dotenv').config();
const { Client } = require('pg');

const sql = `
CREATE TABLE IF NOT EXISTS actions (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null,
  sender_tag text,
  target_channel_id text not null,
  content text not null,
  status text default 'pending', -- pending, completed
  completed_by_id text,
  completed_by_tag text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS action_schedules (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  target_channel_id text not null,
  content text not null,
  cron_expression text not null,
  created_by text not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
`;

const dropSql = `DROP TABLE IF EXISTS actions, action_schedules;`;

async function setup(mode = 'create') {
    if (!process.env.DATABASE_URL) {
        console.error('❌ ไม่พบ DATABASE_URL ในไฟล์ .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        if (mode === 'drop') {
            console.log('🗑️ กำลังลบตารางที่เกี่ยวข้องกับ Action...');
            await client.query(dropSql);
            console.log('✅ ลบตารางเรียบร้อยแล้ว');
        } else {
            console.log('⏳ กำลังสร้างตารางสำหรับระบบ Action...');
            await client.query(sql);
            console.log('✅ สร้างตารางเรียบร้อยแล้ว');
        }
    } catch (err) {
        console.error('❌ เกิดข้อผิดพลาด:', err.message);
    } finally {
        await client.end();
    }
}

const args = process.argv.slice(2);
if (args.includes('--drop')) {
    setup('drop');
} else {
    setup('create');
}
