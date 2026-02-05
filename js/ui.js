/**
 * Menggambar Progress Bar Modern (Glassmorphism Style)
 * Tetap mempertahankan parameter asli agar tidak merusak motion.js
 */
export function drawProgressBar(ctx, canvasWidth, angle, type, exId) {
    let percent = 0;
    let color = '#00f3ff'; 

    // Menentukan target sudut berdasarkan jenis latihan (Logika Asli)
    let targetMin = 70;
    if (exId === 'wall_pushup') targetMin = 110;
    if (exId === 'knee_pushup') targetMin = 100;

    // Menghitung persentase progres (Logika Asli dengan warna diperbarui)
    if (type === 'push') {
        percent = Math.max(0, Math.min(100, (180 - angle) / (180 - targetMin) * 100));
        color = percent > 85 ? '#00ff88' : (percent > 45 ? '#00f3ff' : '#ff0055'); 
    } else if (type === 'pull') {
        percent = Math.max(0, Math.min(100, (180 - angle) / (180 - 50) * 100));
        color = percent > 85 ? '#00ff88' : '#00f3ff';
    } else { return; }

    const isMobile = window.innerWidth < 768;
    const barWidth = isMobile ? 12 : 20; 
    const barHeight = isMobile ? 200 : 350;
    const barX = isMobile ? 25 : 40;
    const barY = (window.innerHeight / 2) - (barHeight / 2);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvasWidth, 0);

    // Efek Glow Neon
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    // Background Bar (Track)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, barX, barY, barWidth, barHeight, 10, true, false);

    // Isian Bar (Progress)
    const fillHeight = (percent / 100) * barHeight;
    ctx.fillStyle = color;
    roundRect(ctx, barX, barY + barHeight - fillHeight, barWidth, fillHeight, 10, true, false);

    // Teks Persentase
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isMobile ? '14px' : '18px'} Inter`;
    ctx.fillText(Math.round(percent) + "%", barX - 5, barY - 15);

    ctx.restore();
}

/**
 * Fungsi pembantu untuk membuat sudut melengkung pada Canvas
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

/**
 * Memperbarui angka repetisi dan pesan feedback di layar
 */
export function updateUI(repDisplay, feedback, val, msg) {
    // Update teks angka dan pesan feedback
    repDisplay.innerText = val;
    feedback.innerText = msg;
    
    // Efek animasi "Pop" agar user tahu repetisi berhasil terhitung
    repDisplay.style.transform = "scale(1.3)";
    
    // Kembalikan ke ukuran semula setelah 200ms
    setTimeout(() => {
        repDisplay.style.transform = "scale(1)";
    }, 200);
}