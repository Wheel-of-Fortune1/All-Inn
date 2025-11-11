const startBtn = document.getElementById("start-btn");
const message = document.getElementById("message");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const dealerHand = document.getElementById("dealer-hand");
const playerHand = document.getElementById("player-hand");
const homeBtn = document.getElementById("home-btn");

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

    // 👇 Send POST request to backend. Will need to change to environment variable.
    const response = await fetch("http://localhost:3000/api/blackjack/start", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bet: 10 }) // test data
    });

    const data = await response.json();
    console.log("Response from backend:", data);

    renderHand(playerHand, data.playerHand);
    renderHand(dealerHand, data.dealerHand);

    // 👇 Simple on-screen feedback
    message.textContent = "Game started! Your turn.";

    hitBtn.disabled = false;
    standBtn.disabled = false;

  } catch (error) {
    console.error("Error connecting to backend:", error);
    message.textContent = "❌ Backend connection failed.";
  }
});

hitBtn.addEventListener("click", async () => {
  const res = await fetch("http://localhost:3000/api/blackjack/hit", { method: "POST" });
  const data = await res.json();
  renderHand(playerHand, data.playerHand);

  if (data.bust) {
    message.textContent = data.message;
    hitBtn.disabled = true;
    standBtn.disabled = true;
  }
});

standBtn.addEventListener("click", async () => {
  const res = await fetch("http://localhost:3000/api/blackjack/stand", { method: "POST" });
  const data = await res.json();
  renderHand(playerHand, data.playerHand);
  renderHand(dealerHand, data.dealerHand);
  message.textContent = data.message;
  hitBtn.disabled = true;
  standBtn.disabled = true;
});

// Home button event listener
homeBtn.addEventListener("click", () => {
  // Go back to homepage (adjust path if needed)
  window.location.href = "index.html"; 
});