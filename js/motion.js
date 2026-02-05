import { exId, activeWorkout, sfxRep, sfxError, sfxWin } from "./data.js";
import { calculateAngle, speak } from "./logic.js";
import { updateUI } from "./ui.js";

// 1. Referensi Elemen DOM
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const repDisplay = document.getElementById("rep-display");
const feedback = document.getElementById("feedback");

// Set judul latihan di layar
if (activeWorkout) {
  document.getElementById("exercise-name").innerText = activeWorkout.title;
}

// 2. Variabel Kontrol Aplikasi
let reps = 0;
let stage = "start";
let holdStartTime = null;
let holdDuration = 0;
let isFinished = false;
let eccentricStartTime = null;
let eccentricDuration = 0;

/**
 * Fungsi internal untuk memutar suara berdasarkan tipe kejadian
 */
function playSound(type) {
  let audioToPlay = null;
  if (type === "rep") {
    sfxRep.currentTime = 0;
    audioToPlay = sfxRep;
  } else if (type === "error") {
    audioToPlay = sfxError;
  } else if (type === "win") {
    audioToPlay = sfxWin;
  }

  if (audioToPlay) {
    audioToPlay.play().catch((error) => console.log("Audio blocked:", error));
  }
}

/**
 * Logika Utama AI: Dipanggil setiap kali MediaPipe memberikan hasil deteksi
 */
function onResults(results) {
  if (isFinished || !results.poseLandmarks) return;

  // --- MULAI LOGIKA AUTO-BRIGHT ---
  const offscreenCanvas = document.createElement("canvas");
  const offCtx = offscreenCanvas.getContext("2d");
  offscreenCanvas.width = 1;
  offscreenCanvas.height = 1;
  offCtx.drawImage(results.image, 0, 0, 1, 1);
  const pixelData = offCtx.getImageData(0, 0, 1, 1).data;
  const avgBrightness = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;

  // Jika rata-rata kegelapan di bawah ambang batas 85
  if (avgBrightness < 85) {
    canvasElement.classList.add("bright-mode");
  } else {
    canvasElement.classList.remove("bright-mode");
  }
  // --- SELESAI LOGIKA AUTO-BRIGHT ---

  // Sembunyikan loading spinner saat kamera mulai terdeteksi
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) loadingScreen.style.display = "none";

  canvasElement.width = results.image.width;
  canvasElement.height = results.image.height;

  canvasCtx.save();
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-canvasElement.width, 0);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );

  const lm = results.poseLandmarks;

  // Memilih sisi tubuh yang paling terlihat (Kiri atau Kanan)
  const leftVisible = lm[13].visibility > lm[14].visibility;
  const side = leftVisible
    ? { s: lm[11], e: lm[13], w: lm[15], h: lm[23], k: lm[25] }
    : { s: lm[12], e: lm[14], w: lm[16], h: lm[24], k: lm[26] };

  // Hitung sudut
  const angle = calculateAngle(side.s, side.e, side.w);
  const bodyAngle = calculateAngle(side.s, side.h, side.k);

  const isBackStraight = bodyAngle > 160;

  drawConnectors(canvasCtx, lm, POSE_CONNECTIONS, {
    color: "#ffffff",
    lineWidth: 4,
  });
  drawLandmarks(canvasCtx, lm, {
    color: isBackStraight ? "#00f3ff" : "#ff0055",
    radius: 5,
  });

  // --- LOGIKA REPETISI (PUSH / PULL / SQUAT) ---
  if (
    activeWorkout.type === "push" ||
    activeWorkout.type === "pull" ||
    activeWorkout.type === "squat"
  ) {
    let currentAngle =
      activeWorkout.type === "squat"
        ? calculateAngle(side.h, side.k, lm[leftVisible ? 27 : 28])
        : angle;

    // --- LOGIKA PULL ---
    if (activeWorkout.type === "pull") {
      let startThreshold = 160;
      let successThreshold = 70;

      if (exId === "scapular_pulls") successThreshold = 145;
      else if (exId === "australian_pullup") successThreshold = 90;

      const isHandsUp = side.w.y < side.s.y;

      if (
        currentAngle > startThreshold &&
        (isHandsUp || exId === "australian_pullup")
      ) {
        stage = "hanging";
      }

      if (currentAngle < successThreshold && stage === "hanging") {
        if (isBackStraight) {
          reps++;
          stage = "pulled";
          updateUI(repDisplay, feedback, reps, "PULL SUCCESS! ⚡");
          // Reset styling ke normal
          feedback.style.borderColor = "rgba(255, 255, 255, 0.15)";
          feedback.style.color = "white";
          playSound("rep");
          speak(reps.toString());
        } else {
          playSound("error");
          speak("Keep body straight");
          feedback.innerText = "FIX FORM: STRAIGHT BACK!";
          // Efek Error Merah
          feedback.style.borderColor = "var(--neon-red)";
          feedback.style.color = "var(--neon-red)";
        }
      }
    }
    // --- LOGIKA PUSH & SQUAT ---
    else {
      let targetAngle = 90;
      if (exId === "knee_pushup") targetAngle = 100;
      else if (activeWorkout.type === "squat") targetAngle = 90;

      const isHorizontal = Math.abs(side.s.y - side.h.y) < 0.2;

      if (activeWorkout.type === "push") {
        if (currentAngle < targetAngle) {
          if (isHorizontal && isBackStraight) {
            stage = "down";
            feedback.innerText = "BAGUS! SEKARANG DORONG KE ATAS ↑";
            feedback.style.color = "var(--neon-blue)";
            feedback.style.borderColor = "var(--neon-blue)";
          }
        }

        if (currentAngle > 150 && stage === "down") {
          reps++;
          stage = "up";
          updateUI(repDisplay, feedback, reps, "PUSH SUCCESS! 🔥");
          feedback.style.borderColor = "rgba(255, 255, 255, 0.15)";
          feedback.style.color = "white";
          playSound("rep");
          speak(reps.toString());
        }
      } else if (activeWorkout.type === "squat") {
        if (currentAngle < targetAngle) stage = "down";
        if (currentAngle > 160 && stage === "down") {
          reps++;
          stage = "up";
          updateUI(repDisplay, feedback, reps, "SQUAT SUCCESS! 🍑");
          feedback.style.borderColor = "rgba(255, 255, 255, 0.15)";
          feedback.style.color = "white";
          playSound("rep");
          speak(reps.toString());
        }
      }
    }
  }

  // --- LOGIKA HOLD ---
  else if (activeWorkout.type === "hold") {
    let isPoseCorrect = false;
    let poseFeedback = "";

    if (exId === "dead_hang") {
      const isArmStraight = angle > 160;
      const isHandsUp = side.w.y < side.s.y;
      if (isArmStraight && isHandsUp) isPoseCorrect = true;
      else poseFeedback = !isHandsUp ? "RAISE HANDS UP!" : "STRAIGHTEN ARMS!";
    } else if (exId === "negative_pullup") {
      const isHandsUp = side.w.y < side.s.y;
      const isTopPosition = angle < 90;
      const isBottomPosition = angle > 160;

      if (isTopPosition && isHandsUp) {
        if (stage !== "at_top") {
          stage = "at_top";
          speak("Hold and lower slowly");
          feedback.innerText = "START LOWERING SLOWLY...";
        }
        eccentricStartTime = Date.now();
      }

      if (stage === "at_top" && !isBottomPosition) {
        isPoseCorrect = true;
        eccentricDuration = Math.floor(
          (Date.now() - eccentricStartTime) / 1000,
        );
      }

      if (stage === "at_top" && isBottomPosition) {
        if (eccentricDuration >= 3) {
          reps++;
          playSound("rep");
          speak(reps.toString());
          updateUI(repDisplay, feedback, reps, "GREAT CONTROL! 🔥");
          feedback.style.borderColor = "rgba(255, 255, 255, 0.15)";
          feedback.style.color = "white";
        } else {
          playSound("error");
          speak("Too fast! Slow down");
          feedback.innerText = "TOO FAST! TARGET: 3s+";
          feedback.style.borderColor = "var(--neon-red)";
          feedback.style.color = "var(--neon-red)";
        }

        stage = "start";
        eccentricDuration = 0;
        eccentricStartTime = null;
      }

      if (!isHandsUp) {
        stage = "start";
        poseFeedback = "GET ON THE BAR!";
      }
    } else if (exId === "basic_plank") {
      const isElbowBent = angle > 70 && angle < 110;
      const isHorizontal = Math.abs(side.s.y - side.h.y) < 0.15;

      if (isElbowBent && isBackStraight && isHorizontal) {
        isPoseCorrect = true;
      } else {
        poseFeedback = !isHorizontal
          ? "GET LOWER (HORIZONTAL)!"
          : !isElbowBent
            ? "CHECK ELBOWS (90°)!"
            : "FIX HIPS!";
      }
    } else {
      isPoseCorrect = isBackStraight;
      poseFeedback = "STRAIGHTEN BODY!";
    }

    if (isPoseCorrect) {
      if (!holdStartTime) {
        holdStartTime = Date.now();
        if (exId !== "negative_pullup") speak("Locked in, hold!");
      }
      let duration =
        exId === "negative_pullup"
          ? eccentricDuration
          : Math.floor((Date.now() - holdStartTime) / 1000);
      updateUI(repDisplay, feedback, duration, "HOLDING... ⏳");
      feedback.style.borderColor = "rgba(255, 255, 255, 0.15)";
      feedback.style.color = "white";

      if (duration > 0 && duration % 5 === 0 && duration !== holdDuration)
        speak(duration + " seconds");
      holdDuration = duration;

      if (exId !== "negative_pullup" && duration >= activeWorkout.target)
        finishExam();
    } else {
      if (holdStartTime) speak("Position lost");
      holdStartTime = null;
      feedback.innerText = poseFeedback;
      feedback.style.color = "var(--neon-red)";
      feedback.style.borderColor = "var(--neon-red)";
    }
  }

  if (
    (activeWorkout.type !== "hold" || exId === "negative_pullup") &&
    reps >= activeWorkout.target
  ) {
    finishExam();
  }

  canvasCtx.restore();
}

/**
 * Menampilkan layar selesai dengan tema modern
 */
function finishExam() {
  if (isFinished) return;
  isFinished = true;
  playSound("win");
  speak("Workout complete! Well done.");

  let progress = JSON.parse(localStorage.getItem("califlow_progress")) || [];
  if (!progress.includes(exId)) progress.push(exId);
  localStorage.setItem("califlow_progress", JSON.stringify(progress));

  const summaryOverlay = document.createElement("div");
  summaryOverlay.style =
    "position:fixed;inset:0;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;color:white;backdrop-filter:blur(10px);";
  summaryOverlay.innerHTML = `
        <h1 style="color:var(--neon-blue);font-size:3rem;margin-bottom:10px;letter-spacing:5px;">FINISH!</h1>
        <p style="color:var(--text-muted);margin-bottom:30px;">Target ${activeWorkout.target} repetisi tercapai.</p>
        <button onclick="window.location.replace('index.html')" style="padding:18px 50px;background:var(--neon-blue);border:none;border-radius:15px;cursor:pointer;font-weight:800;text-transform:uppercase;letter-spacing:2px;box-shadow:0 0 20px var(--neon-blue-glow);">BACK TO DASHBOARD</button>
    `;
  document.body.appendChild(summaryOverlay);
}

/**
 * Inisialisasi Aplikasi (RESOLUSI ADAPTIF & CEPAT)
 */
function initApp() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) loadingScreen.style.display = "none";

  const startOverlay = document.createElement("div");
  startOverlay.style =
    "position:fixed;inset:0;background:black;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;";
  startOverlay.innerHTML = `
        <h1 style="color:white;margin-bottom:20px;letter-spacing:3px;">SYSTEM READY</h1>
        <button id="start-btn" style="padding:20px 60px;font-size:1.5rem;font-weight:bold;background:var(--neon-blue);border:none;border-radius:50px;cursor:pointer;box-shadow:0 0 20px var(--neon-blue-glow);">TAP TO START</button>
    `;
  document.body.appendChild(startOverlay);

  document.getElementById("start-btn").onclick = () => {
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
      loadingScreen.style.zIndex = "10001";
    }
    sfxRep
      .play()
      .then(() => {
        sfxRep.pause();
      })
      .catch((e) => console.log(e));
    startOverlay.remove();

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    const isMobile = window.innerWidth < 768;
    pose.setOptions({
      modelComplexity: isMobile ? 0 : 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();
    speak("System Online.");
  };
}

initApp();
