# 📄 บันทึกเอกสารส่วนตัว (Personal Document Tracker)

ระบบจัดการเอกสารส่วนตัวบน Google Apps Script เชื่อมต่อกับ Google Sheets และ Google Drive

## ✨ คุณสมบัติหลัก

- **CRUD เต็มรูปแบบ**: สร้าง อ่าน แก้ไข และลบเอกสาร
- **อัปโหลดไฟล์**: แนบไฟล์เอกสารจาก Google Drive (รองรับ Drag & Drop)
- **ค้นหาและกรอง**: ค้นหาด้วย keyword, กรองตามหมวดหมู่และสถานะ
- **แจ้งเตือนหมดอายุ**: ส่งอีเมลอัตโนมัติเมื่อเอกสารใกล้หมดอายุ
- **สำรองข้อมูล**: สำรองข้อมูลอัตโนมัติรายสัปดาห์
- **Export ข้อมูล**: ส่งออกข้อมูลเป็น CSV หรือ JSON
- **Dark Mode**: รองรับธีมมืด
- **Responsive Design**: ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ

## 📋 ข้อกำหนดเบื้องต้น

- บัญชี Google Account
- Google Sheets
- Google Drive
- Google Apps Script

## 🚀 วิธีติดตั้ง

มีวิธีติดตั้ง 2 แบบ: **Auto Setup (แนะนำ)** และ **Manual Setup**

---

## 🌟 วิธีที่ 1: Auto Setup (แนะนำ - ง่ายที่สุด!)

### ขั้นตอนเดียว - ใช้เวลาแค่ 2 นาที!

1. **สร้าง Apps Script Project**
   - ไปที่ [Google Apps Script](https://script.google.com)
   - คลิก **"New project"**
   - ลบโค้ดเริ่มต้นทั้งหมด

2. **เพิ่มไฟล์โค้ด**
   - เพิ่มไฟล์ `Code.gs`, `Api.gs`, `Triggers.gs` (คัดลอกโค้ดจากที่ให้ไว้)
   - เพิ่มไฟล์ `index.html` และ `Setup.html` (คัดลอกโค้ดจากที่ให้ไว้)

3. **Deploy Web App**
   - คลิก **"Deploy"** → **"New deployment"**
   - เลือก type: **"Web app"**
   - ตั้งค่า:
     - Execute as: **Me**
     - Who has access: **Anyone** หรือ **Only myself**
   - คลิก **"Deploy"**
   - **อนุญาตสิทธิ์** (Advanced → Go to [Project] → Allow)

4. **เปิด Web App URL และทำตาม Setup Wizard**
   - ระบบจะแสดงหน้า Setup Wizard อัตโนมัติ
   - กรอกข้อมูล:
     - ชื่อ Spreadsheet (ค่าเริ่มต้น: "บันทึกเอกสารส่วนตัว")
     - ชื่อโฟลเดอร์ (ค่าเริ่มต้น: "เอกสารส่วนตัว")
     - รหัสผ่านแอดมิน (อย่างน้อย 6 ตัวอักษร)
   - เลือกว่าจะสร้างข้อมูลตัวอย่างหรือไม่
   - คลิก **"เริ่มติดตั้ง"**

5. **รอสักครู่... ระบบจะสร้างให้อัตโนมัติ:**
   - ✅ สร้าง Google Spreadsheet
   - ✅ ตั้งค่าหัวตาราง 17 คอลัมน์
   - ✅ สร้าง Google Drive Folder
   - ✅ ย้าย Spreadsheet เข้าโฟลเดอร์
   - ✅ บันทึก Configuration
   - ✅ สร้างข้อมูลตัวอย่าง (ถ้าเลือก)

6. **เสร็จแล้ว!**
   - ระบบจะแสดงลิงก์ Spreadsheet และ Folder
   - คลิก **"เข้าสู่ระบบ"** เพื่อเริ่มใช้งาน

**🎉 เท่านี้ก็พร้อมใช้งานแล้ว! ไม่ต้องทำอะไรเพิ่ม!**

---

## 📝 วิธีที่ 2: Manual Setup (สำหรับผู้ที่ต้องการควบคุมเอง)

### ขั้นตอนที่ 1: สร้าง Google Spreadsheet

1. เปิด [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่ ตั้งชื่อว่า **"บันทึกเอกสารส่วนตัว"**
3. เปลี่ยนชื่อแท็บจาก "Sheet1" เป็น **"documents"**
4. เพิ่มหัวตารางในแถวแรก (แถว 1) ตามลำดับ:

```
id | title | category | tags | owner | issueDate | expiryDate | remindDays | driveFileId | driveFileUrl | version | location | source | status | notes | createdAt | updatedAt
```

5. คัดลอก **Sheet ID** จาก URL (ส่วนที่อยู่ระหว่าง `/d/` และ `/edit`)
   - ตัวอย่าง: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`

### ขั้นตอนที่ 2: สร้างโฟลเดอร์ใน Google Drive

1. เปิด [Google Drive](https://drive.google.com)
2. สร้างโฟลเดอร์ใหม่ ตั้งชื่อว่า **"เอกสารส่วนตัว"**
3. คลิกขวาที่โฟลเดอร์ → เลือก **"แชร์"** → **"คัดลอกลิงก์"**
4. คัดลอก **Folder ID** จาก URL (ส่วนหลัง `/folders/`)
   - ตัวอย่าง: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`

### ขั้นตอนที่ 3: สร้าง Apps Script Project

1. กลับไปที่ Spreadsheet ที่สร้างไว้
2. เมนู **Extensions** → **Apps Script**
3. ลบโค้ดเริ่มต้นทั้งหมด

### ขั้นตอนที่ 4: เพิ่มไฟล์โค้ด

สร้างไฟล์ต่อไปนี้ใน Apps Script Editor:

#### 4.1 ไฟล์ Code.gs
1. คลิก **+** ข้างๆ "Files" → เลือก **"Script"**
2. ตั้งชื่อไฟล์ว่า `Code`
3. คัดลอกโค้ดจากไฟล์ `Code.gs` ที่ให้ไว้ วางลงไป

#### 4.2 ไฟล์ Api.gs
1. คลิก **+** ข้างๆ "Files" → เลือก **"Script"**
2. ตั้งชื่อไฟล์ว่า `Api`
3. คัดลอกโค้ดจากไฟล์ `Api.gs` ที่ให้ไว้ วางลงไป

#### 4.3 ไฟล์ Triggers.gs
1. คลิก **+** ข้างๆ "Files" → เลือก **"Script"**
2. ตั้งชื่อไฟล์ว่า `Triggers`
3. คัดลอกโค้ดจากไฟล์ `Triggers.gs` ที่ให้ไว้ วางลงไป

#### 4.4 ไฟล์ index.html
1. คลิก **+** ข้างๆ "Files" → เลือก **"HTML"**
2. ตั้งชื่อไฟล์ว่า `index`
3. คัดลอกโค้ดจากไฟล์ `index.html` ที่ให้ไว้ วางลงไป

### ขั้นตอนที่ 5: ตั้งค่า Script Properties

1. ในหน้า Apps Script Editor คลิกไอคอน **⚙️ (Project Settings)** ที่แถบด้านซ้าย
2. เลื่อนลงมาที่ส่วน **"Script Properties"**
3. คลิก **"Add script property"** และเพิ่มค่าต่อไปนี้:

| Property | Value |
|----------|-------|
| `SHEET_ID` | ใส่ Sheet ID ที่คัดลอกมาจากขั้นตอนที่ 1 |
| `SHEET_NAME` | `documents` |
| `DRIVE_FOLDER_ID` | ใส่ Folder ID ที่คัดลอกมาจากขั้นตอนที่ 2 |
| `ADMIN_PASS` | ตั้งรหัสผ่านสำหรับโหมดแอดมิน (เช่น `admin123`) |

4. คลิก **"Save script properties"**

### ขั้นตอนที่ 6: Deploy Web App

1. คลิกปุ่ม **"Deploy"** (มุมขวาบน) → เลือก **"New deployment"**
2. คลิกไอคอน **⚙️** ข้าง "Select type" → เลือก **"Web app"**
3. กรอกข้อมูล:
   - **Description**: `บันทึกเอกสารส่วนตัว v1.0`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**:
     - เลือก **"Only myself"** (ถ้าใช้คนเดียว)
     - หรือ **"Anyone"** (ถ้าต้องการให้คนอื่นเข้าถึง)
4. คลิก **"Deploy"**
5. อนุญาตสิทธิ์ตามที่ขอ:
   - คลิก **"Authorize access"**
   - เลือกบัญชี Google
   - คลิก **"Advanced"** → **"Go to [Project Name] (unsafe)"**
   - คลิก **"Allow"**
6. คัดลอก **Web app URL** ที่ได้

### ขั้นตอนที่ 7: เปิดใช้งานและทดสอบ

1. เปิด **Web app URL** ที่คัดลอกไว้ในเบราว์เซอร์
2. ระบบจะแสดงหน้า Dashboard
3. ทดสอบเพิ่มเอกสาร:
   - คลิก **"+ เพิ่มเอกสาร"**
   - กรอกข้อมูลเอกสาร (ต้องกรอกชื่อเอกสารเท่านั้น)
   - อัปโหลดไฟล์ (ถ้ามี)
   - คลิก **"บันทึก"**
4. ตรวจสอบว่าข้อมูลปรากฏใน Google Sheet

### ขั้นตอนที่ 8: ตั้งค่า Triggers อัตโนมัติ

1. ในเว็บแอป ไปที่หน้า **"⚙️ ตั้งค่า"**
2. เลื่อนลงมาที่ส่วน **"ตั้งเวลาอัตโนมัติ (Triggers)"**
3. คลิก **"✅ สร้าง Triggers"**
4. รอสักครู่ จนกว่าจะขึ้นข้อความ "สร้าง Triggers เรียบร้อย"
5. Triggers ที่ถูกสร้าง:
   - **แจ้งเตือนรายวัน**: ทำงานทุกวันเวลา 08:00 น.
   - **สำรองข้อมูลรายสัปดาห์**: ทำงานทุกวันอาทิตย์เวลา 02:00 น.

## 📊 สคีมาข้อมูล (Schema)

| คอลัมน์ | ประเภท | คำอธิบาย |
|--------|--------|----------|
| id | UUID | รหัสเอกสารอัตโนมัติ |
| title | Text | ชื่อเอกสาร (บังคับ) |
| category | Text | หมวดหมู่เอกสาร |
| tags | Text | แท็ก (คั่นด้วยจุลภาค) |
| owner | Text | เจ้าของเอกสาร |
| issueDate | Date | วันที่ออกเอกสาร |
| expiryDate | Date | วันหมดอายุ |
| remindDays | Number | จำนวนวันก่อนหมดอายุที่จะแจ้งเตือน |
| driveFileId | Text | ID ไฟล์ใน Google Drive |
| driveFileUrl | URL | ลิงก์ไฟล์ใน Google Drive |
| version | Text | เวอร์ชันเอกสาร |
| location | Text | ที่เก็บเอกสารจริง |
| source | Text | แหล่งที่มาของเอกสาร |
| status | Enum | สถานะ (active, archived, expired) |
| notes | Text | หมายเหตุ |
| createdAt | Timestamp | วันที่สร้าง (อัตโนมัติ) |
| updatedAt | Timestamp | วันที่แก้ไขล่าสุด (อัตโนมัติ) |

## 🎯 การใช้งานระบบ

### 1. Dashboard
- แสดงสถิติเอกสารทั้งหมด
- แสดงเอกสารล่าสุด 5 รายการ
- แสดงจำนวนเอกสารใกล้หมดอายุ

### 2. เพิ่มเอกสาร
1. คลิก **"+ เพิ่มเอกสาร"**
2. กรอกข้อมูล (ชื่อเอกสารบังคับ)
3. อัปโหลดไฟล์แนบ (ถ้ามี) โดย:
   - คลิก "อัปโหลดไฟล์" หรือ
   - ลากไฟล์มาวางในกรอบ
4. คลิก **"💾 บันทึก"**

### 3. ค้นหาและกรองเอกสาร
1. ไปที่หน้า **"เอกสารทั้งหมด"**
2. ใช้กล่องค้นหา: พิมพ์คำค้นหา (ชื่อ, แท็ก, หมายเหตุ)
3. เลือกหมวดหมู่และสถานะจาก dropdown
4. คลิก **"🔍 ค้นหา"**
5. สลับมุมมอง Table/Card ได้

### 4. แก้ไขและลบเอกสาร
- **แก้ไข**: คลิกปุ่ม "แก้ไข" → แก้ไขข้อมูล → บันทึก
- **เก็บถาวร**: คลิกปุ่ม "เก็บถาวร" (จะเปลี่ยนสถานะเป็น archived)
- **ลบ**: เปิดรายละเอียดเอกสาร → คลิก "🗑️ ลบ" → ยืนยัน

### 5. Export ข้อมูล
1. ไปที่หน้า **"⚙️ ตั้งค่า"**
2. เลื่อนลงมาที่ส่วน **"ส่งออกและสำรองข้อมูล"**
3. คลิก:
   - **"📥 Export CSV"** - ส่งออกเป็นไฟล์ CSV
   - **"📥 Export JSON"** - ส่งออกเป็นไฟล์ JSON
   - **"💾 สำรองข้อมูลเดี๋ยวนี้"** - สำรองข้อมูลทันที

### 6. แจ้งเตือนหมดอายุ
- ระบบจะส่งอีเมลอัตโนมัติทุกวันเวลา 08:00 น.
- แจ้งเตือนเอกสารที่เหลือเวลาน้อยกว่า `remindDays` วัน
- อีเมลจะมีรายละเอียดเอกสารและลิงก์ไฟล์

## 🔧 การแก้ไขปัญหา

### ปัญหา: ไม่สามารถบันทึกข้อมูลได้
**วิธีแก้:**
1. ตรวจสอบว่าตั้งค่า Script Properties ครบถ้วน
2. ตรวจสอบว่า SHEET_ID และ DRIVE_FOLDER_ID ถูกต้อง
3. ตรวจสอบสิทธิ์การเข้าถึง Sheet และ Folder

### ปัญหา: อีเมลแจ้งเตือนไม่ส่ง
**วิธีแก้:**
1. ตรวจสอบว่าสร้าง Triggers แล้ว (ไปที่ Settings → ดูรายการ Triggers)
2. ตรวจสอบว่ามีเอกสารที่ใกล้หมดอายุจริง
3. ตรวจสอบ Log ใน Apps Script:
   - ไปที่ Apps Script Editor
   - เมนู **"Executions"** → ดู error logs

### ปัญหา: อัปโหลดไฟล์ไม่ได้
**วิธีแก้:**
1. ตรวจสอบขนาดไฟล์ (ต้องไม่เกิน 10MB)
2. ตรวจสอบสิทธิ์การเขียนไฟล์ใน Google Drive
3. ตรวจสอบว่า DRIVE_FOLDER_ID ถูกต้อง

### ปัญหา: หน้าเว็บโหลดช้า
**วิธีแก้:**
1. ลดจำนวนเอกสารที่แสดงในหนึ่งหน้า (ปรับ pageSize)
2. ลบเอกสารที่ไม่ใช้งานแล้ว
3. สำรองและย้ายเอกสารเก่าไปชีตใหม่

## 📝 ตัวอย่างข้อมูล (Seed Data)

ใช้ข้อมูลตัวอย่างนี้เพื่อทดสอบระบบ (คัดลอกไปวางใน Google Sheet):

```
(ดูไฟล์ SeedData.txt)
```

## 🔐 ความปลอดภัย

- **ข้อมูล**: เก็บใน Google Sheets ของคุณเอง (ไม่มีใครเข้าถึงได้นอกจากคุณ)
- **ไฟล์**: เก็บใน Google Drive ของคุณเอง
- **การเข้าถึง**: ตั้งค่าได้ว่าใครสามารถเข้าถึงเว็บแอปได้บ้าง
- **รหัสผ่าน**: ใช้ ADMIN_PASS สำหรับฟีเจอร์แอดมิน (ยังไม่ได้ใช้งานในเวอร์ชันนี้)

## 📚 API Reference

### Actions ที่รองรับ

| Action | Payload | Response |
|--------|---------|----------|
| `ping` | - | `{ok, message, timestamp}` |
| `list` | `{filter, sort, page, pageSize}` | `{ok, data: {documents, pagination}}` |
| `get` | `{id}` | `{ok, data: document}` |
| `create` | `{document data}` | `{ok, data: document}` |
| `update` | `{id, ...fields}` | `{ok, data: document}` |
| `archive` | `{id}` | `{ok, data: document}` |
| `delete` | `{id}` | `{ok, data: {id}}` |
| `upload` | `{fileName, mimeType, base64Data}` | `{ok, data: {driveFileId, driveFileUrl}}` |
| `stats` | - | `{ok, data: stats}` |
| `exportCSV` | - | `{ok, data: {csv, fileName}}` |
| `exportJSON` | - | `{ok, data: {json, fileName}}` |
| `backupSheet` | - | `{ok, data: {backupId, backupUrl}}` |
| `createTriggers` | - | `{ok, data: {message, triggers}}` |
| `deleteTriggers` | - | `{ok, data: {message, count}}` |
| `listTriggers` | - | `{ok, data: {triggers, count}}` |

## 🎨 การปรับแต่ง

### เปลี่ยนสีธีม
แก้ไขใน `index.html`:
- ค้นหา `bg-blue-600` เปลี่ยนเป็นสีที่ต้องการ (เช่น `bg-green-600`)
- Tailwind CSS สีที่รองรับ: blue, green, red, yellow, purple, pink, indigo

### เพิ่มหมวดหมู่
แก้ไขใน `index.html` ส่วน `<select id="docCategory">` และ `<select id="filterCategory">`:
```html
<option value="หมวดหมู่ใหม่">หมวดหมู่ใหม่</option>
```

### ปรับเวลา Trigger
แก้ไขใน `Triggers.gs` ฟังก์ชัน `createAllTriggers()`:
```javascript
// แจ้งเตือนเวลา 10:00 น. แทน 8:00 น.
ScriptApp.newTrigger('dailyReminderJob')
  .timeBased()
  .atHour(10)  // เปลี่ยนจาก 8 เป็น 10
  .everyDays(1)
  .create();
```

## 🆕 การอัปเดตระบบ

เมื่อมีโค้ดใหม่:
1. แก้ไขโค้ดใน Apps Script Editor
2. บันทึกโค้ด (Ctrl+S หรือ Cmd+S)
3. ไม่ต้อง Deploy ใหม่ (ระบบจะใช้โค้ดใหม่อัตโนมัติ)

หากต้องการ Deploy เวอร์ชันใหม่:
1. คลิก **"Deploy"** → **"Manage deployments"**
2. คลิกไอคอน **✏️** (Edit) ข้างเวอร์ชันปัจจุบัน
3. เลือก **"New version"** ในส่วน Version
4. คลิก **"Deploy"**

## 📞 การขอความช่วยเหลือ

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Logs ใน Apps Script Editor: **View** → **Execution log**
2. ตรวจสอบ Browser Console: กด F12 → แท็บ Console
3. ตรวจสอบว่าทำตามขั้นตอนครบถ้วน

## 📜 License

MIT License - ใช้งานได้อย่างอิสระ

## 🙏 Credits

พัฒนาโดยใช้:
- Google Apps Script
- Google Sheets API
- Google Drive API
- Tailwind CSS
- Vanilla JavaScript

---

**เวอร์ชัน**: 1.0
**อัปเดตล่าสุด**: 2025
**ผู้พัฒนา**: บันทึกเอกสารส่วนตัว Team
