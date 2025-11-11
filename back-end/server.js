
//Checks to see if backend is starting
console.log("Starting backend...");
// back-end/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


// For database access, database access methods.

import bodyParser from "body-parser"
import { pool, databaseTest, addPlayer, removePlayer, updatePlayer, getAllPlayers, getPlayer } from "../database/db.js"

// imports blackjack, roulette, slots from gameplay folder.

import BlackjackGame from "../gameplay/blackjack.js";

import RouletteGame from "../gameplay/roulette.js";

import SlotsGame from "../gameplay/slots.js";



// Creates the backend server and sets up the routes for the games.
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../front-end");
app.use(express.static(frontendPath));

// Creates One Instance Per Game Type
const blackjack = new BlackjackGame();
const roulette = new RouletteGame();
const slots = new SlotsGame();



// Black Jack Game Implementation

// Starts a new game, player can hit or stand after this.
app.post("/api/blackjack/start", (req, res) => {
  console.log("Frontend requested: Start Game");
  console.log("✅ /api/blackjack/start route was called!");
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
  console.log("Frontend requested: Start Game");
  const { bets } = req.body;
  const result = roulette.placeBet(bets);
  console.log("Got result:", result);
  res.json({
    winningNumber: result.spinResult.number,
    color: result.spinResult.color,
    message: result.message,
    details: result, // optional full detail
  });
});

// Gives list of valid bet types.
app.get("/api/roulette/bet-types", (req, res) => {
  console.log("Frontend requested: Get Bet Types");
  res.json(roulette.getBetTypes());
});

// Slots Game Implementation

//Reads bet amount and spins once done.
app.post("/api/slots/play", (req, res) => {
  const { bet } = req.body;
  console.log("Frontend requested: Start Game");
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

app.get("/api/database/player/:username", async (req, res) => {
    try {
        const { username } = req.params
        const player = await getPlayer(username)
        if (!player) {
            return res.status(404).json({ error: "Player not found." })
        }

        res.json(player)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get player." })
    }
});

app.post("/api/database/player", async (req, res) => {
    try {
        const { username, password, chips } = req.body
        const player = await addPlayer(username, password, chips)
        res.status(201).json(player)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to add player." })
    }
});

app.delete("/api/database/player/:username", async (req, res) => {
    try {
        const { username } = req.params
        await removePlayer(username)
        res.json({message: `Player ${username} removed`})

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to delete player." })
    }
});

app.patch("/api/database/player/:username",  async (req, res) => {
    try {
        const { username } = req.params
        const fields = req.body

        const player = await updatePlayer(username, fields)
        if (!player) {
            return res.status(400).json({ error: "Failed to update player data." })
        }
        res.status(200).json(player);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update player data."})
    }
});

//Checks to see if backend is setup complete
console.log("Backend setup complete.");

//Checks to see if backend shows message at the website
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
    res.send("🎮 All-Inn Game Backend is running!");
});

// Starts the server at the port 3000.
app.listen(3000, () => console.log("🎮 Backend running on http://localhost:3000"));

