// 1. Tambahkan Import di bagian paling atas
import { workouts, roadmaps } from "./data.js";

let userProgress = JSON.parse(localStorage.getItem("califlow_progress")) || [];
let activeWorkoutId = null;

// 2. Fungsi init() tetap sama, namun sekarang menggunakan 'roadmaps' dari import
function init() {
  const grid = document.getElementById("workout-grid");
  if (!grid) return; // Safety check
  grid.innerHTML = "";

  const xpDisplay = document.getElementById("xp-display");
  if (xpDisplay) xpDisplay.innerText = userProgress.length * 100;

  roadmaps.forEach((roadmap) => {
    const completedSteps = roadmap.steps.filter((stepId) =>
      userProgress.includes(stepId),
    ).length;
    const progressPercent = Math.round(
      (completedSteps / roadmap.steps.length) * 100,
    );

    const card = document.createElement("div");
    card.className = "card open";
    card.innerHTML = `
            <div class="card-img" style="background-image: url('${roadmap.img}'); position: relative;">
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(255,255,255,0.1);">
                    <div style="width: ${progressPercent}%; height: 100%; background: #00f3ff; transition: width 0.5s ease;"></div>
                </div>
            </div>
            <div class="card-info">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="card-title">${roadmap.title}</h3>
                    <span style="color: #00f3ff; font-size: 0.8rem; font-weight: bold;">${progressPercent}%</span>
                </div>
                <p class="card-desc">${roadmap.desc}</p>
            </div>
        `;
    card.onclick = () => showSteps(roadmap.id);
    grid.appendChild(card);
  });
}

// 3. Tambahkan fungsi ke window agar bisa dipanggil dari HTML (karena sistem module membatasi scope)
window.init = init;
window.closeModal = () =>
  document.getElementById("modal-simulation").classList.add("hidden");
window.launchCamera = () => {
  if (activeWorkoutId) {
    window.location.href = `camera.html?ex=${activeWorkoutId}`;
  } else {
    alert("Please select a workout first!");
  }
};

// Fungsi showSteps, createCard, dan openWorkout tetap menggunakan data dari import
function showSteps(roadmapId) {
  const roadmap = roadmaps.find((r) => r.id === roadmapId);
  const grid = document.getElementById("workout-grid");
  const completedSteps = roadmap.steps.filter((stepId) =>
    userProgress.includes(stepId),
  ).length;
  const progressPercent = Math.round(
    (completedSteps / roadmap.steps.length) * 100,
  );

  grid.innerHTML = "";

  // Header navigasi menggunakan kelas CSS, bukan inline style
  const header = document.createElement("div");
  header.className = "roadmap-header-container";
  header.innerHTML = `
        <button onclick="init()" class="btn-back-main">
            Back to Main Menu
        </button>
        <div class="roadmap-info-flex">
            <h2 class="roadmap-title-text">${roadmap.title}</h2>
            <p class="roadmap-progress-text">Progress: ${progressPercent}%</p>
        </div>
    `;
  grid.appendChild(header);

  const roadmapSteps = workouts.filter((w) => roadmap.steps.includes(w.id));
  roadmapSteps.forEach((workout) => {
    const isCompleted = userProgress.includes(workout.id);
    const isUnlocked = (workout.req || []).every((r) =>
      userProgress.includes(r),
    );
    createCard(workout, isUnlocked, isCompleted);
  });
}

function createCard(workout, isUnlocked, isCompleted) {
  const grid = document.getElementById("workout-grid");
  const card = document.createElement("div");
  card.className = `card ${isCompleted ? "done" : isUnlocked ? "open" : "locked"}`;
  card.innerHTML = `
        <div class="card-img" style="background-image: url('${workout.img}')">
            ${!isUnlocked && !isCompleted ? '<div class="lock-overlay">🔒</div>' : ""}
            ${isCompleted ? '<div class="lock-overlay" style="background: rgba(0,243,255,0.1)">✅</div>' : ""}
        </div>
        <div class="card-info">
            <h3 class="card-title">${workout.title}</h3>
            <p class="card-desc">${workout.desc}</p>
        </div>
    `;
  card.onclick = () =>
    isUnlocked || isCompleted
      ? openWorkout(workout.id)
      : alert("Complete previous steps first!");
  grid.appendChild(card);
}

function openWorkout(id) {
  activeWorkoutId = id;
  const workout = workouts.find((w) => w.id === id);
  const modal = document.getElementById("modal-simulation");
  const modalContent = document.querySelector(".modal-content");

  // Menggunakan kelas CSS untuk styling modal
  modalContent.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h2 class="modal-title">${workout.title}</h2>
        <div class="modal-body-content">
            <h3>Instructions:</h3>
            <ul class="instruction-list">
                ${(workout.steps || []).map((s) => `<li>${s}</li>`).join("")}
            </ul>
        </div>
        <button onclick="launchCamera()" class="btn-ai-start">
            🚀 START AI EXAM
        </button>
    `;
  modal.classList.remove("hidden");
}

// Menjalankan inisialisasi awal
init();
