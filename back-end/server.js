
// back-end/server.js
import express from "express";
import cors from "cors";

// imports blackjack, roulette, slots from gameplay folder.

import BlackjackGame from "./gameplay/blackjack.js";

import RouletteGame from "./gameplay/roulette.js";

import SlotsGame from "./gameplay/slots.js";

// Creates the backend server and sets up the routes for the games.
const app = express();
app.use(cors());
app.use(express.json());

// Creates One Instance Per Game Type
const blackjack = new BlackjackGame();
const roulette = new RouletteGame();
const slots = new SlotsGame();

// Black Jack Game Implementation

// Starts a new game, player can hit or stand after this.
app.post("/api/blackjack/start", (req, res) => {
  const { bet } = req.body;
  const result = blackjack.startGame(bet);
  res.json(result);
});

// Player hits to get another card.
app.post("/api/blackjack/hit", (req, res) => {
  const result = blackjack.hit();
  res.json(result);
});

// Player stands, dealer plays out their hand.
app.post("/api/blackjack/stand", (req, res) => {
  const result = blackjack.stand();
  res.json(result);
});

// Gets current game state without changing anything.
app.get("/api/blackjack/state", (req, res) => {
  const state = blackjack.getGameState();
  res.json(state);
});

// Roulette Game Implementation

// Reads bets and spins once done.
app.post("/api/roulette/play", (req, res) => {
  const { bets } = req.body;
  const result = roulette.placeBet(bets);
  res.json(result);
});

// Gives list of valid bet types.
app.get("/api/roulette/bet-types", (req, res) => {
  res.json(roulette.getBetTypes());
});

// Slots Game Implementation

//Reads bet amount and spins once done.
app.post("/api/slots/play", (req, res) => {
  const { bet } = req.body;
  if (!bet || bet <= 0) {
    return res.status(400).json({ error: "Invalid bet amount" });
  }

  const result = slots.play(bet);
  res.json(result);
});

// Gives paytable info
app.get("/api/slots/paytable", (req, res) => {
  res.json(slots.getPaytable());
});

// Gives symbol probabilities info
app.get("/api/slots/probabilities", (req, res) => {
  res.json(slots.getSymbolProbabilities());
});
