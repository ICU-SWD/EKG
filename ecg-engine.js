// 1. ค้นหาจอ Canvas จากหน้าเว็บ
const canvas = document.getElementById('ecgMonitor');
const ctx = canvas.getContext('2d');

// ตั้งค่าสีและขนาดเส้นกราฟ
ctx.strokeStyle = '#00ff00'; // สีเขียวสะท้อนแสง
ctx.lineWidth = 2.5;
ctx.lineJoin = 'round';

// 2. ชุดตัวเลขจำลองคลื่นไฟฟ้าหัวใจ 1 รอบ (ค่าติดลบกราฟจะชี้ขึ้น)
const pWave = [0, -1, -3, -5, -3, -1, 0];
const prSegment = [0, 0, 0, 0, 0];
const qrs = [0, 5, -45, 12, 0]; 
let stSegment = [0, 0, 0, 0, 0, 0, 0]; // จุดที่เราจะแก้ไขตอนทำ STEMI
const tWave = [0, -2, -4, -6, -8, -6, -4, -2, 0];
const tpSegment = new Array(40).fill(0); // ระยะพัก (ปรับความยาวเพื่อเปลี่ยน Heart Rate)

let ecgPattern = [];

// ฟังก์ชันรวมชิ้นส่วนคลื่นทั้งหมดให้เป็น 1 รอบ
function updatePattern() {
    ecgPattern = [...pWave, ...prSegment, ...qrs, ...stSegment, ...tWave, ...tpSegment];
}
updatePattern(); // เรียกใช้ครั้งแรกเพื่อสร้างเส้นปกติ

// 3. ระบบวาดกราฟแบบ Sweep (วิ่งลบเส้นเก่า)
let currentIndex = 0;
let x = 0;
let yBase = 150; // จุดกึ่งกลางจอ (ปรับตามความสูง Canvas ของคุณ)
let xSpeed = 3;  // ความเร็วการวิ่ง

function drawECG() {
    if (!ctx) return; // ป้องกัน Error หากหน้าเว็บโหลด Canvas ไม่ทัน

    let yValue = ecgPattern[currentIndex];
    let currentY = yBase + yValue;

    // เทคนิค Sweep: ลบพื้นที่ล่วงหน้าเพื่อสร้าง "แถบดำ" นำทาง 20 พิกเซล
    ctx.clearRect(x + 1, 0, 20, canvas.height);

    if (x === 0) {
        ctx.beginPath();
        ctx.moveTo(x, currentY);
    } else {
        ctx.lineTo(x, currentY);
        ctx.stroke();
    }

    x += xSpeed;
    currentIndex++;

    // เมื่อรันจบ 1 รอบ ให้ดึง Array ใหม่
    if (currentIndex >= ecgPattern.length) {
        currentIndex = 0;
    }

    // เมื่อวิ่งสุดขอบจอขวา ให้วนกลับไปซ้ายสุด
    if (x >= canvas.width) {
        x = 0;
        ctx.beginPath(); 
    }

    // สั่งวาดเฟรมถัดไปเรื่อยๆ (ความลื่น 60 FPS)
    requestAnimationFrame(drawECG);
}

// เริ่มวาดกราฟทันที
drawECG();

// ----------------------------------------------------
// 4. ฟังก์ชันควบคุมสำหรับโหมดจำลองสถานการณ์ (ให้หน้าเว็บสั่งงาน)
// ----------------------------------------------------

function triggerSTEMI() {
    // ปรับเปลี่ยน ST Segment ให้ยกสูงขึ้น
    stSegment = [-20, -20, -18, -15, -12, -8, -4]; 
    updatePattern();
}

function triggerNormal() {
    // ปรับ ST Segment กลับเป็นเส้นตรงปกติ
    stSegment = [0, 0, 0, 0, 0, 0, 0]; 
    updatePattern();
}
