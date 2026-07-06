# QRzip

โปรเจคตัวอย่างสำหรับ “ย่อข้อความแบบ lossless แล้วแพ็กลง QR” โดยมี 2 แนวทางหลัก:

- **Free QR (payload อยู่ใน QR)**: สแกนแล้วได้ข้อความกลับทันที (เหมาะกับข้อความสั้น/กลาง)
- **Member QR (ref)**: สแกนได้ QR สั้นมาก เพราะเก็บข้อมูลไว้หลังบ้าน (เหมาะกับข้อความยาว)

ในโฟลเดอร์นี้มีทั้งหน้าเว็บ (static) และสคริปต์ server ตัวอย่างสำหรับฝั่ง member/ref

## โครงไฟล์

- `index.html` หน้าบ้าน (Free QR + สแกน/ดึงข้อมูล)
- `lab.html` / `text_compression_demo.html` แลบทดลองบีบอัดและเทียบ QR (รองรับ byte-mode)
- `portal.js` / `portal.css` logic และ UI หลัก (decode/scan)
- `signup.html`, `member.html`, `admin.html` หน้า flow ตัวอย่าง
- `qrzip_server.py` เซิร์ฟเวอร์ตัวอย่าง (เก็บ/ดึง ref)
- `schema.sql` โครงฐานข้อมูลตัวอย่าง
- `cloudflare_worker.js` ตัวอย่าง worker (ถ้าต้องการ deploy)
- `bin/` ไฟล์ที่ไม่เกี่ยวกับการรันจริง (ถูก ignore โดย `.gitignore`)

## วิธีรันแบบเร็ว (static)

1. เปิด terminal ในโฟลเดอร์โปรเจค
2. รัน

```bash
python -m http.server 8000
```

3. เปิดเบราว์เซอร์:
- `http://localhost:8000/index.html`
- `http://localhost:8000/text_compression_demo.html` (แลบ)

## แนวคิด payload (Free QR)

ระบบมี “prefix” เพื่อให้ decoder รู้ว่าควรถอดแบบไหน

### Text mode (คัดลอกได้)

- `QZ1|T|...` เก็บข้อความตรง ๆ (raw text)
- `QZ1|D|<base64url(deflate bytes)>` deflate raw
- `QZ1|K|<profile>|<base64url(deflate bytes)>` deflate + preset dictionary (profile)
- `QZ1|L|...` LZ compact token stream
- `QZ1|F|<profile>|<bitLength>|<base64url(bitstream)>` fixed huffman

### Byte mode (ลด overhead)

แนวคิดคือเก็บเป็น “byte payload” เพื่อตัด overhead ของ base64/text ให้ QR โล่งขึ้น (ในแลบจะเห็นผลชัด)

- `QZ1D + <deflate bytes>`
- `QZ1K + <profileId:1 byte> + <deflate bytes>`
- `QZ1L + <lz token bytes>`
- `QZ1F + <profileId> + <bitLength:uint16> + <bitstream bytes>`

> หมายเหตุ: byte-mode เหมาะกับการใช้งานแบบ “สแกน → decode ในระบบเรา” มากกว่าการคัดลอกข้อความออกจาก QR

## ออโต้เลือกอัลกอริทึม (Lab)

ใน `text_compression_demo.html` มี Auto Selector v2 ที่:
- วิเคราะห์สถิติข้อความ (entropy / ratio / pattern)
- ลองหลายวิธี แล้วเลือกตามเกณฑ์ที่ตั้ง (สั้นสุด/สแกนง่ายสุด/คุมความหนาแน่น)
- แสดง `scanability score`, `QR version`, `utilization` เพื่อเดาว่าสแกนง่ายแค่ไหน

## การพัฒนา/จัดระเบียบไฟล์

- ไฟล์ทดลอง/รูปผลเทสต่าง ๆ ย้ายเข้า `bin/` และถูก ignore โดย `.gitignore`
- ถ้าต้องการเก็บภาพประกอบ README ให้สร้างโฟลเดอร์ `docs/` แทน (และไม่ ignore)

