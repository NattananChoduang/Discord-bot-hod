# 🤖 BotHod - Modular Discord Bot

บอท Discord อเนกประสงค์ที่ออกแบบมาด้วยโครงสร้าง **Modular Architecture** เพื่อความง่ายในการขยายฟีเจอร์ รองรับระบบเช็คชื่อผ่าน Cloud Database (Supabase), ระบบโพลโต้ตอบด้วยปุ่ม, และระบบแจ้งเตือนความจำ

---

## 🌟 ฟีเจอร์หลัก (Key Features)

*   **📝 ระบบเช็คชื่อ (Attendance System):** เช็คชื่อประจำวันผ่านคำสั่ง `/checkin` บันทึกข้อมูลลง Supabase พร้อมระบบป้องกันการเช็คชื่อซ้ำในวันเดียวกัน
*   **🗳️ ระบบโหวต (Poll System):** สร้างโพลถามตอบได้สูงสุด 5 ตัวเลือก พร้อมปุ่มกดโต้ตอบ (Interactive Buttons) และแสดงผลคะแนนแบบ Real-time
*   **⏰ ระบบแจ้งเตือน (Reminder System):** ตั้งเวลาเตือนความจำล่วงหน้าได้ทั้งหน่วย ชั่วโมง, นาที และวินาที
*   **📍 ระบบค้นหาสถานที่และพยากรณ์อากาศ:** ค้นหาสถานที่ แผนที่ และสภาพอากาศแบบ Real-time (อุณหภูมิ, ความชื้น, ลม) ในคำสั่งเดียวผ่าน `/find`
*   **🚀 ระบบสั่งการงาน (Action Dispatcher):** ส่งงานและประกาศแจ้งเตือนในทีม รองรับการตอบรับงานผ่านปุ่มและระบบตั้งเวลาส่งอัตโนมัติ (Schedule)
*   **📖 ระบบช่วยเหลือ (Help System):** แสดงรายการคำสั่งและวิธีการใช้งานทั้งหมดผ่านคำสั่ง `/help`
*   **🔒 ความปลอดภัย:** รองรับการ Compile เป็นไฟล์ `.exe` เพื่อความสะดวกในการแจกจ่ายและใช้งาน

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้ใช้โครงสร้างแบบแยกส่วน (Modular) และแยกซอร์สโค้ดออกจากสคริปต์อรรถประโยชน์เพื่อความเป็นระเบียบ:

```text
C:\Users\pookz\OneDrive\Desktop\Bot\
├── src/                # ซอร์สโค้ดหลักของแอปพลิเคชัน
│   ├── core/           # ระบบแกนหลัก (Engine) ของบอท
│   │   └── app.js      # จัดการการเชื่อมต่อ Discord API และ SDK
│   ├── features/       # ปลั๊กอินฟีเจอร์ต่างๆ
│   │   ├── action_dispatch.js
│   │   ├── attendance.js
│   │   ├── help.js
│   │   ├── location.js
│   │   ├── ping.js
│   │   ├── poll.js
│   │   └── reminders.js
│   └── index.js        # จุดเริ่มต้นโปรแกรม (Entry Point)
├── scripts/            # สคริปต์อรรถประโยชน์
│   ├── command.js      # สคริปต์สำหรับลงทะเบียน Slash Commands 
│   ├── setup-action-db.js # สคริปต์ตั้งค่าฐานข้อมูล Action
│   └── setup-db.js     # สคริปต์ตั้งค่าฐานข้อมูล Supabase หลัก 
├── database.json       # ฐานข้อมูลท้องถิ่น (สำหรับระบบ Poll)
├── nodemon.json        # ตั้งค่า Nodemon
└── .env                # ไฟล์เก็บความลับ (Token, Keys, API URL)
```

---

## ⚙️ การติดตั้งและเริ่มต้นใช้งาน (Setup & Installation)

### 1. การเตรียมความพร้อม
*   ติดตั้ง [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
*   สมัครบัญชี [Supabase](https://supabase.com/) และสร้างโปรเจกต์ใหม่
*   คัดลอกโปรเจกต์ (Clone)

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
DATABASE_URL=ลิงก์_Connection_String_ของ_SUPABASE 
LOCATIONIQ_API_KEY=รหัส_LOCATIONIQ_API_KEY
```

### 3. การตั้งค่าฐานข้อมูล (อัตโนมัติ)
คุณไม่จำเป็นต้องนำ SQL ไปวางเองบนหน้าเว็บ เพียงแค่รันคำสั่งนี้:
1.  ติดตั้ง Dependencies: `npm install`
2.  รันคำสั่งตั้งค่า: `npm run setup`
    *สคริปต์จะสร้างตาราง `attendance` และ Index ให้คุณเองอัตโนมัติ*

### 4. เริ่มรันระบบ
1.  ลงทะเบียนคำสั่ง Slash Commands (Global): `npm run register`
    *หมายเหตุ: คำสั่งแบบ Global อาจใช้เวลาถึง 1 ชั่วโมงในการปรากฏในทุกเซิร์ฟเวอร์*
2.  เริ่มรันบอท: `npm start`


---

## 🌎 การใช้งานข้ามเซิร์ฟเวอร์ (Global Usage)

บอทตัวนี้รองรับการใช้งานแบบ **Global Commands** ซึ่งหมายความว่า:
*   เมื่อรัน `npm run register` แล้ว คำสั่งจะสามารถใช้งานได้ในทุกเซิร์ฟเวอร์ที่บอทเข้าร่วม
*   ระบบฐานข้อมูล (Supabase) จะแยกข้อมูลตาม Guild ID อัตโนมัติ (ในฟีเจอร์ที่รองรับ)
*   รองรับการเชิญบอทเข้าเซิร์ฟเวอร์ใหม่ด้วยสิทธิ์ `applications.commands`


---

## 🎮 รายการคำสั่ง (Commands)

| คำสั่ง | ประเภท | รายละเอียด |
| :--- | :--- | :--- |
| `/checkin [name]` | Slash | เช็คชื่อประจำวันโดยระบุชื่อ (บันทึกลง Supabase) |
| `/poll [question] [opt1-5]` | Slash | สร้างโพลโหวต (ใส่ได้สูงสุด 5 ตัวเลือก) |
| `/remind [msg] [h/m/s]` | Slash | ตั้งเวลาเตือนความจำ |
| `/find [query]` | Slash | ค้นหาสถานที่ + แผนที่ + พยากรณ์อากาศ |
| `/action-send` | Slash | ส่งข้อความ Action แบบโต้ตอบ (มีปุ่มรับงาน) |
| `/action-notify` | Slash | ส่งประกาศแจ้งเตือน (ไม่มีปุ่ม) |
| `/action-schedule` | Slash | ตั้งเวลาส่ง Action อัตโนมัติ |
| `/action-list` | Slash | ดูรายการ Action อัตโนมัติที่ตั้งไว้ |
| `/help` | Slash | แสดงเมนูช่วยเหลือและวิธีใช้งาน |
| `/ping` | Slash | ทดสอบความหน่วงของบอท |

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Language:** Node.js (CommonJS)
*   **Library:** Discord.js v14
*   **Database:** Supabase (PostgreSQL) & Local JSON
*   **Security:** pkg (Executable Packager)
