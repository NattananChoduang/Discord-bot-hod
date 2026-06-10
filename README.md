# 🤖 BotHod - Modular Discord Bot

บอท Discord อเนกประสงค์ที่ออกแบบมาด้วยโครงสร้าง **Modular Architecture** เพื่อความง่ายในการขยายฟีเจอร์ รองรับระบบเช็คชื่อผ่าน Cloud Database (Supabase), ระบบโพลโต้ตอบด้วยปุ่ม, และระบบแจ้งเตือนความจำ

---

## 🌟 ฟีเจอร์หลัก (Key Features)

*   **📝 ระบบเช็คชื่อ (Attendance System):** เช็คชื่อประจำวันผ่านคำสั่ง `/checkin` บันทึกข้อมูลลง Supabase พร้อมระบบป้องกันการเช็คชื่อซ้ำในวันเดียวกัน
*   **🗳️ ระบบโหวต (Poll System):** สร้างโพลถามตอบได้สูงสุด 5 ตัวเลือก พร้อมปุ่มกดโต้ตอบ (Interactive Buttons) และแสดงผลคะแนนแบบ Real-time
*   **⏰ ระบบแจ้งเตือน (Reminder System):** ตั้งเวลาเตือนความจำล่วงหน้าได้ทั้งหน่วย ชั่วโมง, นาที และวินาที
*   **🔒 ระบบรักษาความปลอดภัย:** ล็อคการเข้าถึงซอร์สโค้ดด้วยระบบ **Access Key** และรองรับการ Compile เป็นไฟล์ `.exe` เพื่อป้องกันการแก้ไขโค้ด

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้ใช้โครงสร้างแบบแยกส่วน (Modular) เพื่อความเป็นระเบียบและง่ายต่อการบำรุงรักษา:

```text
├── core/               # ระบบแกนหลัก (Engine) ของบอท
│   └── app.js          # จัดการการเชื่อมต่อ Discord API และ SDK
├── features/           # ปลั๊กอินฟีเจอร์ต่างๆ
│   ├── attendance.js   # ระบบเช็คชื่อ (Supabase)
│   ├── poll.js         # ระบบโหวต (Local JSON)
│   ├── reminders.js    # ระบบแจ้งเตือน
│   └── ping.js         # ระบบทดสอบการเชื่อมต่อ
├── index.js            # จุดเริ่มต้นโปรแกรม (Entry Point) และด่านตรวจ Access Key
├── command.js          # สคริปต์สำหรับลงทะเบียน Slash Commands
├── database.json       # ฐานข้อมูลท้องถิ่น (สำหรับระบบโพล)
└── .env                # ไฟล์เก็บความลับ (Token, Keys, API URL)
```

---

## ⚙️ การติดตั้งและเริ่มต้นใช้งาน (Setup & Installation)

### 1. การเตรียมความพร้อม
*   ติดตั้ง [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
*   สมัครบัญชี [Supabase](https://supabase.com/) และสร้างโปรเจกต์ใหม่
*   คัดลอกโปรเจกต์ (Clone): `git clone https://github.com/your-username/your-repo-name.git`

### 2. การตั้งค่า Environment (.env)
เนื่องจากไฟล์ `.env` จะไม่ถูกเก็บไว้บน Git เพื่อความปลอดภัย ให้คุณสร้างไฟล์ใหม่ขึ้นมา:
1.  สร้างไฟล์ชื่อ `.env` ที่โฟลเดอร์หลัก
2.  คัดลอกเนื้อหาจากไฟล์ `.env.example` ไปวางใน `.env`
3.  ใส่ข้อมูล Token และ Key ของคุณเอง:
```env
TOKEN=รหัส_DISCORD_BOT_TOKEN
CLIENT_ID=ไอดี_DISCORD_APPLICATION_ID
SUPABASE_URL=ลิงก์_API_URL_ของ_SUPABASE
SUPABASE_KEY=รหัส_ANON_KEY_ของ_SUPABASE
ACCESS_KEY=รหัสผ่านสำหรับเข้าใช้งานบอท 
```

### 3. การตั้งค่าฐานข้อมูล (Supabase SQL)
รันคำสั่ง SQL นี้ใน SQL Editor ของ Supabase เพื่อสร้างตารางสำหรับระบบเช็คชื่อ:
```sql
CREATE TABLE attendance (
  id bigint primary key generated always as identity,
  user_id text not null,
  guild_id text not null, -- ไอดีเซิร์ฟเวอร์
  guild_name text,        -- ชื่อเซิร์ฟเวอร์ (ช่วยให้ดูข้อมูลใน DB ง่ายขึ้น)
  user_name text,
  checkin_date date default current_date,
  created_at timestamptz default now()
);
-- สร้าง Index สำหรับการค้นหาที่รวดเร็ว (เช็คชื่อซ้ำแยกตาม User และ Guild)
CREATE INDEX idx_user_guild_date ON attendance(user_id, guild_id, checkin_date);
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
```

### 4. เริ่มรันระบบ
1.  ติดตั้ง Dependencies: `npm install`
2.  ลงทะเบียนคำสั่ง Slash Commands: `node command.js`
3.  เริ่มรันบอท: `npm start`
4.  กรอก **Access Key** ที่คุณตั้งไว้ใน `.env` เพื่อเริ่มต้นการทำงาน


---

## 🎮 รายการคำสั่ง (Commands)

| คำสั่ง | ประเภท | รายละเอียด |
| :--- | :--- | :--- |
| `/checkin [name]` | Slash | เช็คชื่อประจำวันโดยระบุชื่อ (บันทึกลง Supabase) |
| `/poll [question] [opt1-5]` | Slash | สร้างโพลโหวต (ใส่ได้สูงสุด 5 ตัวเลือก) |
| `/remind [msg] [h/m/s]` | Slash | ตั้งเวลาเตือนความจำ |
| `/ping` | Slash | ทดสอบความหน่วงของบอท |
| `!hello` | Prefix | ข้อความทักทายพื้นฐาน |

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Language:** Node.js (CommonJS)
*   **Library:** Discord.js v14
*   **Database:** Supabase (PostgreSQL) & Local JSON
*   **Security:** pkg (Executable Packager) & Access Key Layer
