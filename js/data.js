/**
 * WORKOUT DATABASE
 * Standardized data for AI detection and UI rendering
 */
export const workouts = [
    // PUSHUP PROGRESSION
    { 
        id: "knee_pushup", 
        title: "Step 1: Knee Push Up", 
        desc: "Transition exercise using knees as a pivot point.", 
        img: "img/knee.jpg", 
        req: ["knee_pushup"], 
        type: "push", 
        target: 12,
        steps: [
            "Start in plank position with knees on the floor", 
            "Keep back straight and core engaged", 
            "Lower chest toward the floor", 
            "Push back up to the top"
        ] 
    },
    { 
        id: "regular_pushup", 
        title: "Step 2: Standard Push Up", 
        desc: "The classic floor push up for chest and triceps.", 
        img: "img/standard.jpg", 
        req: ["knee_pushup"], 
        type: "push", 
        target: 10,
        steps: [
            "Assume full plank position", 
            "Lower body until elbows reach 90 degrees", 
            "Keep body in a straight line", 
            "Push back up to the starting position"
        ] 
    },

    // PULL-UP PROGRESSION
    { 
        id: "dead_hang", 
        title: "Step 1: Dead Hang", 
        desc: "Build grip strength and shoulder joint stability.", 
        img: "img/dead-hang.jpg", 
        req: [], 
        type: "hold", 
        target: 30, // seconds
        steps: [
            "Grab the bar with a shoulder-width grip", 
            "Hang with straight arms and relaxed shoulders", 
            "Keep your core engaged to prevent swinging", 
            "Hold as long as possible"
        ] 
    },
    { 
        id: "scapular_pulls", 
        title: "Step 2: Scapular Pulls", 
        desc: "Learn to engage your lats without bending your arms.", 
        img: "img/scap-pulls.jpg", 
        req: ["dead_hang"], 
        type: "pull", // Small movement detection
        target: 12,
        steps: [
            "Hang from the bar with straight arms", 
            "Pull your shoulder blades down and back", 
            "Lift your body slightly without bending elbows", 
            "Lower back to a dead hang position"
        ] 
    },
    { 
        id: "australian_pullup", 
        title: "Step 3: Australian Pull Up", 
        desc: "Horizontal pulling to build fundamental back strength.", 
        img: "img/australian.jpg", 
        req: ["scapular_pulls"], 
        type: "pull", 
        target: 10,
        steps: [
            "Find a chest-high bar and hang underneath it", 
            "Keep your body straight like a plank", 
            "Pull your chest to the bar", 
            "Lower back down with control"
        ] 
    },
    { 
        id: "negative_pullup", 
        title: "Step 4: Negative Pull Up", 
        desc: "Build strength by controlling the downward movement.", 
        img: "img/negative.jpg", 
        req: ["australian_pullup"], 
        type: "hold", // Track time taken to go down
        target: 5, // 5 repetitions of 5-second descents
        steps: [
            "Jump or use a stool to get your chin above the bar", 
            "Hold the top position for a split second", 
            "Lower yourself as slowly as possible (3-5 seconds)", 
            "Once arms are straight, reset and repeat"
        ] 
    },
    { 
        id: "standard_pullup", 
        title: "Step 5: Standard Pull Up", 
        desc: "The ultimate upper body pulling master move.", 
        img: "img/pullup.jpg", 
        req: ["negative_pullup"], 
        type: "pull", 
        target: 5,
        steps: [
            "Start from a full dead hang", 
            "Pull up until your chin clears the bar", 
            "Keep your legs still and core tight", 
            "Lower down to a full hang with control"
        ] 
    },

    // CORE STABILITY
    { 
        id: "basic_plank", 
        title: "Core: Basic Plank", 
        desc: "Isometric hold to build rock-solid core stability.", 
        img: "img/plank.jpg", 
        req: [], 
        type: "hold", 
        target: 30,
        steps: [
            "Rest on forearms and toes", 
            "Maintain a straight line from head to heels", 
            "Tighten core and do not let hips sag", 
            "Hold until timer ends"
        ] 
    },

    // LOWER BODY 
    { 
        id: "basic_squat", 
        title: "Legs: Squat", 
        desc: "Foundational lower body movement for glutes and quads.", 
        img: "img/squat.jpg", 
        req: [], 
        type: "squat", 
        target: 15,
        steps: [
            "Stand with feet shoulder-width apart", 
            "Lower hips as if sitting back into a chair", 
            "Keep chest up and heels on the floor", 
            "Return to full standing position"
        ] 
    }
];

/**
 * MASTER ROADMAPS
 * Groups workouts into logical learning paths
 */
export const roadmaps = [
    {
        id: "pushup-journey",
        title: "Push Up Mastery",
        desc: "From zero to standard push up proficiency.",
        img: "img/master-pushup.jpg", 
        steps: ["wall_pushup", "knee_pushup", "regular_pushup"]
    },
    {
        id: "pullup-journey",
        title: "Pull Up Mastery",
        desc: "Scientific progression from hanging to full Pull Ups.",
        img: "img/master-pullup.jpg", 
        steps: ["dead_hang", "scapular_pulls", "australian_pullup", "negative_pullup", "standard_pullup"]
    },
    {
        id: "core-strength",
        title: "Core Fundamentals",
        desc: "Building the foundation of all athletic movement.",
        img: "img/core.jpg", 
        steps: ["basic_plank"]
    },
    {
        id: "leg-power",
        title: "Leg Power",
        desc: "Develop explosive and stable lower body strength.",
        img: "img/legs-main.jpg", 
        steps: ["basic_squat"]
    }
];

// EXERCISE CONFIGURATION
const urlParams = new URLSearchParams(window.location.search);
export const exId = urlParams.get('ex') || 'wall_pushup';
export const activeWorkout = workouts.find(w => w.id === exId);

// AUDIO ASSETS
export const sfxRep = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-mechanical-crate-pick-up-3154.mp3'); 
export const sfxError = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'); 
export const sfxWin = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'); 

sfxRep.volume = 0.5;
sfxError.volume = 0.3;
sfxWin.volume = 0.6;