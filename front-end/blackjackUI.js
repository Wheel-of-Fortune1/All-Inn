const startBtn = document.getElementById("start-btn");
const message = document.getElementById("message");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const dealerHand = document.getElementById("dealer-hand");
const playerHand = document.getElementById("player-hand");
const homeBtn = document.getElementById("home-btn");
const betInput = document.getElementById("bet-input");

// Function to render a hand of cards
function renderHand(container, hand) {
    container.innerHTML = "";
    hand.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        if (card.hidden) {
            cardDiv.innerHTML = `<div class="back">🂠</div>`;
        } else {
            const suitSymbol = {
                hearts: "♥",
                diamonds: "♦",
                clubs: "♣",
                spades: "♠",
            }[card.suit];

            cardDiv.innerHTML = `
        <div class="front">
          <div class="corner top-left">${card.value}${suitSymbol}</div>
          <div class="center-symbol">${suitSymbol}</div>
          <div class="corner bottom-right">${card.value}${suitSymbol}</div>
        </div>`;
        }
        container.appendChild(cardDiv);
    });
}

// Event Listeners for start button, hit button, stand button
startBtn.addEventListener("click", async () => {
    try {
        const bet = parseInt(betInput.value, 10);

        if (!bet || bet <= 0) {
            alert("Please enter a valid bet amount.");
            return;
        }

        const response = await fetch("/api/blackjack/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ bet })
        });

        const data = await response.json();

      
        if (!response.ok) {
            alert(data.error || "Failed to start game.");
            return;
        }

        console.log("Response from backend:", data);

        renderHand(playerHand, data.playerHand);
        renderHand(dealerHand, data.dealerHand);

        message.textContent = "Game started! Your turn.";

        hitBtn.disabled = false;
        standBtn.disabled = false;

    } catch (error) {
        console.error("Error connecting to backend:", error);
        message.textContent = "❌ Backend connection failed.";
    }
});


hitBtn.addEventListener("click", async () => {
    const res = await fetch("/api/blackjack/hit", { method: "POST" });
    const data = await res.json();
    renderHand(playerHand, data.playerHand);

    if (data.bust) {
        message.textContent = data.message;
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }

    if (data.payout !== undefined && data.payout !== 0) {
        const res = await fetch(`/api/processgame/blackjack`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ change: data.payout })
        });
    }
});

standBtn.addEventListener("click", async () => {
    const res = await fetch("/api/blackjack/stand", { method: "POST" });
    const data = await res.json();
    renderHand(playerHand, data.playerHand);
    renderHand(dealerHand, data.dealerHand);
    message.textContent = data.message;
    hitBtn.disabled = true;
    standBtn.disabled = true;

    if (data.payout !== undefined && data.payout !== 0) {
        const res = await fetch(`/api/processgame/blackjack`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ change: data.payout })
        });
    }
});

// Home button event listener
homeBtn.addEventListener("click", () => {
    window.location.href = "home.html";
});