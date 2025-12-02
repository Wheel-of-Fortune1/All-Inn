const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const resultDisplay = document.getElementById("result");
const betTypeSelect = document.getElementById("betType");
const betValueInput = document.getElementById("betValue");
const betAmountInput = document.getElementById("betAmount");
const homeBtn = document.getElementById("home-btn");

// Event listener for spin button
spinBtn.addEventListener("click", async () => {
  const betType = betTypeSelect.value;
  const betValue = betValueInput.value ? parseInt(betValueInput.value) : null;
  const betAmount = parseFloat(betAmountInput.value);

  if (!betAmount || betAmount <= 0) {
    alert("Please enter a valid bet amount.");
    return;
  }

  // Build the bets array that matches backend format
  const bets = [
    {
      type: betType,
      value: betValue,
      amount: betAmount,
    },
  ];

  try {
    resultDisplay.textContent = "🎲 Spinning wheel...";
    spinBtn.disabled = true;

    // 🔌 Send to backend
    const response = await fetch("http://localhost:3000/api/roulette/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bets }),
    });

    const data = await response.json();
    console.log("Roulette result from backend:", data);

    // 🎡 Visual spin animation
    const randomRotation = 720 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${randomRotation}deg)`;

    // Wait for spin animation (~4s)
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // 🧮 Display results
    const { winningNumber, color, message } = data;

    resultDisplay.innerHTML = `
      <p>Winning Number: <strong>${winningNumber}</strong></p>
      <p>Color: <strong style="color:${color}">${color.toUpperCase()}</strong></p>
      <p>${message}</p>
    `;

  } catch (error) {
    console.error("Error connecting to backend:", error);
    resultDisplay.textContent = "❌ Backend connection failed.";
  } finally {
    spinBtn.disabled = false;
  }
});


homeBtn.addEventListener("click", () => {
    // Go back to homepage (adjust path if needed)
    window.location.href = "home.html"; 
});
