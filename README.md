# QRzip (Serverless Edition)

โปรเจกต์สำหรับ “ย่อข้อความให้มีขนาดเล็กที่สุด แล้วแพ็กลง QR Code” เพื่อให้ได้ภาพ QR ที่สแกนง่าย ไม่หนาแน่นจนเกินไป โดยมี 2 แนวทางหลักในการทำงาน:

- **Offline QR (Free)**: บีบอัดข้อความด้วยอัลกอริทึม (Deflate, Huffman, LZ) แล้วฝังข้อมูลทั้งหมดลงใน QR Code โดยตรง ไม่ต้องพึ่งพาอินเทอร์เน็ตในการสแกนกลับ
- **Short QR (Cloud)**: สร้าง QR Code สั้นเฉียบ โดยเก็บข้อมูลขนาดใหญ่ไว้ในฐานข้อมูลคลาวด์ และใช้รหัสสั้น (Reference ID) ฝังลงใน QR Code เหมาะสำหรับข้อความที่ยาวมากๆ (ต้องการอินเทอร์เน็ตในการดึงข้อมูล)

เว็บไซต์หลัก: **[https://qrzip.online](https://qrzip.online)**

## 🚀 โครงสร้างสถาปัตยกรรม (Architecture)

ปัจจุบันโปรเจกต์นี้ได้รับการพัฒนาให้เป็นแบบ **100% Serverless** และให้บริการผ่าน **Cloudflare Ecosystem**:

- **Frontend**: `Cloudflare Pages` 
  - โค้ดทั้งหมดอยู่ในโฟลเดอร์ `public/` (HTML, JS, CSS)
  - ไม่มีการใช้ Framework ที่ซับซ้อน เป็น Vanilla JS ล้วนเพื่อความรวดเร็วที่สุด
- **Backend / API**: `Cloudflare Pages Functions`
  - โค้ด API อยู่ในโฟลเดอร์ `functions/` (Javascript)
  - ให้บริการ API อย่างเช่น `/api/member/signup`, `/api/store`, `/api/get`
- **Database**: `Cloudflare D1` (Serverless SQLite)
  - เก็บข้อมูลสมาชิกและข้อมูล Short QR 

## 📂 โครงสร้างโฟลเดอร์

```
QRZIP/
├── public/                     # โฟลเดอร์สำหรับฝั่ง Frontend (เปิดผ่านเว็บเบราว์เซอร์)
│   ├── index.html              # หน้าหลัก (สร้าง/สแกน QR Code)
│   ├── portal.js               # Logic หลักของ UI และการเชื่อมต่อ API
│   ├── qrzip_engine.js         # Core Engine สำหรับเข้ารหัส/ถอดรหัส อัลกอริทึมบีบอัดข้อความ
│   ├── decode.js               # สคริปต์สำหรับการถอดรหัส QR
│   ├── member.html             # หน้า Dashboard ของสมาชิก (ดูประวัติการสร้าง QR)
│   ├── admin.html              # หน้า Dashboard ของ Admin (จัดการสมาชิกและ QR)
│   ├── signup.html             # หน้าสมัครสมาชิก
│   └── text_compression_demo.html # ห้องแลบทดลองเปรียบเทียบอัลกอริทึมบีบอัด (Byte-mode vs Text-mode)
│
├── functions/                  # โฟลเดอร์สำหรับ Backend API (Cloudflare Functions)
│   ├── api/                    # Endpoint ต่างๆ เช่น /api/store, /api/get, /api/health
│   └── utils.js                # ฟังก์ชันตัวช่วยสำหรับ Response ของ API
│
├── schema.sql                  # โครงสร้างตารางฐานข้อมูล SQLite (สำหรับ D1)
├── wrangler.toml               # ไฟล์ตั้งค่าของ Cloudflare Wrangler
├── package.json                # ตั้งค่า Scripts และ Dependencies สำหรับรันในเครื่อง (dev)
└── README.md
```

## 🛠️ วิธีติดตั้งและทดสอบในเครื่อง (Local Development)

การรันทดสอบในเครื่องจะจำลองสภาพแวดล้อมของ Cloudflare ด้วยเครื่องมือที่ชื่อว่า `Wrangler`

1. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

2. **สร้างฐานข้อมูล D1 จำลองในเครื่อง (Local Database)**
   นำไฟล์ `schema.sql` ไปสร้างเป็นตารางในฐานข้อมูลจำลอง
   ```bash
   npm run db:setup
   ```

3. **รันเซิร์ฟเวอร์จำลอง**
   ```bash
   npm run dev
   ```
   > คำสั่งนี้จะทำการเสิร์ฟไฟล์ในโฟลเดอร์ `public` พร้อมกับเปิดการทำงานของ API ในโฟลเดอร์ `functions` ไปพร้อมๆ กัน 
   
   เปิดเบราว์เซอร์แล้วเข้าไปที่: `http://localhost:8788`

## 🧠 เทคนิคการบีบอัดข้อความ (Payload Engineering)

ระบบมี "Prefix" พิเศษที่ทำให้ตัวสแกนรู้ว่าข้อมูลข้างในถูกบีบอัดมาด้วยวิธีไหน:

### Text Mode (สามารถคัดลอกรหัสดิบๆ ไปถอดที่อื่นได้)
- `QZ1|T|...` : เก็บข้อความแบบตรงไปตรงมา (Raw text)
- `QZ1|D|<base64url>` : บีบอัดด้วย Deflate 
- `QZ1|K|<profile>|<base64url>` : บีบอัดด้วย Deflate + Preset Dictionary (Profile) เฉพาะทาง
- `QZ1|L|...` : บีบอัดด้วยเทคนิค LZ Compact Token
- `QZ1|F|<profile>|<bitLength>|<base64url>` : บีบอัดแบบ Fixed Huffman Tree

### Byte Mode (บีบอัดถึงระดับไบต์ - ประหยัดพื้นที่ที่สุด)
ตัดความซ้ำซ้อนของการแปลงเป็น Base64 ออกไป ทำให้เก็บข้อมูลได้เยอะขึ้นในขนาด QR ที่เล็กลง (เหมาะกับการใช้แอปหรือเว็บของเรารับหน้าที่เป็นตัวสแกนโดยตรง)
- `QZ1D` + `<deflate bytes>`
- `QZ1K` + `<profileId>` + `<deflate bytes>`
- `QZ1L` + `<lz token bytes>`
- `QZ1F` + `<profileId>` + `<bitLength>` + `<bitstream bytes>`

*สามารถดูและทดลองการบีบอัดอย่างละเอียดได้ที่หน้า `text_compression_demo.html`*
