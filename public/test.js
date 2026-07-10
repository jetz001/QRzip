const fs = require('fs');

const text = `จัดไปครับ! ผมได้ปรับแก้โค้ดในหน้า Frontend (portal.js) ให้เปลี่ยนเกณฑ์การเลือก Algorithm แบบ Auto จาก "สแกนง่ายสุด (scanability-first)" เป็น "สั้นสุด (bytes-first)" ตามที่หน้า Lab แสดงผลแล้วครับ

ตอนนี้ถ้าคุณก๊อบปี้ข้อความไปวาง ทั้งหน้า Lab และหน้า Frontend จะตัดสินด้วยไม้บรรทัดเดียวกัน และเลือก Deflate + Dict ออกมาตรงกันเป๊ะๆ แน่นอนครับ!

พุชขึ้น GitHub ให้เรียบร้อยแล้วครับ ลองรีเฟรชหน้าเว็บแล้วทดสอบดูได้เลยครับ`;

let engineCode = fs.readFileSync('qrzip_engine.js', 'utf8');
// Mock browser globals needed by engine
global.window = {};
global.pako = require('pako'); // We need to install pako or just mock it? If we can't install pako, we can't run deflate!
