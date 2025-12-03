const homeBtn = document.getElementById("home-btn");
const spinBtn = document.getElementById("spinBtn");

const betSelect = document.getElementById("bet");
const linesSelect = document.getElementById("lines");

const lastResultDisplay = document.getElementById("lastResult");

// === GAME STATE ===

let spinning = false;

// Reel elements
const reels = document.querySelectorAll(".reel .strip");

// === FUNCTIONS ===

// Fill reel with animated symbols
function fillReel(reel) {
    const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "7️⃣"];
    let html = "";
    for (let i = 0; i < 20; i++) {
        html += `<div class="cell">${symbols[Math.floor(Math.random() * symbols.length)]}</div>`;
    }
    reel.innerHTML = html;
}

function animateReels() {
    reels.forEach(reel => {
        fillReel(reel);
        reel.style.transition = "transform 1s ease-out";
        reel.style.transform = `translateY(-${Math.floor(Math.random() * 300)}px)`;
    });
}

function stopReels(finalIcons) {
    reels.forEach((reel, index) => {
        const icon = finalIcons[index];

        // Build exactly 3 visible cells for a 3-row window
        reel.innerHTML = `
            <div class="cell"></div>                
            <div class="cell"></div>     
            <div class="cell final">${icon}</div>             
        `;

        // The fixed height of every cell is 72px (from your CSS)
        const cellHeight = 72; 

        reel.style.transition = "transform .35s ease-out";
        reel.style.transform = `translateY(-${cellHeight}px)`;
    });
}


homeBtn.addEventListener("click", () => {
    // Go back to homepage (adjust path if needed)
    window.location.href = "home.html"; 
});


// === MAIN SPIN BUTTON ===
spinBtn.addEventListener("click", async () => {
    const bet = parseInt(betSelect.value, 10);

    spinBtn.disabled = true;
    animateReels();

    // Contact backend
    const result = await fetch("/api/slots/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet })
    }).then(res => res.json());

    console.log(result)

    if (result.netResult != 0) {
        const res = await fetch(`/api/processgame/slots`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ change: result.netResult })
        });
    }

    // After animation finishes, force icons to match backend
    setTimeout(() => {
        const icons = result.reels.map(r => r.icon);
        stopReels(icons);


        lastResultDisplay.textContent = result.message;

        spinBtn.disabled = false;
    }, 1100);
});
