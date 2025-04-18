// สคริปต์สร้าง random secret key สำหรับ NEXTAUTH_SECRET
const crypto = require('crypto');
const randomKey = crypto.randomBytes(32).toString('hex');
console.log('ใช้ key นี้สำหรับ NEXTAUTH_SECRET ในไฟล์ .env.local:');
console.log(randomKey); 