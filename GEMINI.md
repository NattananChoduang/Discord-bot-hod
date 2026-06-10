# Discord Bot Project Instructions

## Project Overview
A Discord bot built with Node.js featuring a modular architecture with core system and feature plugins.

## Architecture & Conventions
- **Runtime:** Node.js (CommonJS).
- **Structure:**
  - `index.js`: Main entry point.
  - `core/app.js`: Core SDK and bot initialization.
  - `features/`: Folder for modular feature logic (commands, events).
- **Security:** Use `.env` for all sensitive credentials (TOKEN, CLIENT_ID).
- **Data Persistence:** Local JSON storage (`database.json`) for user data.

## Key Commands
- `/checkin`: เช็คชื่อประจำวันโดยระบุชื่อ (บันทึกลง Supabase).
- `/poll`: สร้างโหวต/โพลถามเพื่อนในทีม (Slash).
- `/remind`: ตั้งเวลาเตือนความจำ (Slash).


- `!hello`: Simple prefix-based greeting.


## Workflow
1. Add new feature files in the `features/` directory.
2. If adding a Slash Command, update `command.js` and run `node command.js`.
3. Import and initialize the feature in `index.js`.
4. Run the bot using `node index.js`.

