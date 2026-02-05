/**
 * Menghitung sudut antara tiga titik koordinat
 */
export function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

/**
 * Menjalankan fitur Text-to-Speech (Suara AI)
 */
export function speak(text) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; 
    utterance.rate = 1.1;     
    window.speechSynthesis.speak(utterance);
}