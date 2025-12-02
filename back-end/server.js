
//Checks to see if backend is starting
console.log("Starting backend...");
// back-end/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


// For database access, database access methods.

import bodyParser from "body-parser"
import { pool, databaseTest, addPlayer, removePlayer, Update, getAll, Get, getTop, Increment } from "../database/db.js"

// imports blackjack, roulette, slots from gameplay folder.

import BlackjackGame from "../gameplay/blackjack.js";

import RouletteGame from "../gameplay/roulette.js";

import SlotsGame from "../gameplay/slots.js";

// Creates the backend server and sets up the routes for the games.
const app = express();
import helmet from "helmet"
app.use(helmet());


app.use(express.json());
app.use(bodyParser.json());

import session from "express-session";

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true
}));

app.use(session({
  secret: "super-secret-key-change-this",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax",   // <-- change this
    secure: false       // true if using HTTPS

  }
}));


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

// LOGIN + SIGNUP
app.post("/api/auth/:mode", async (req, res) => {
  const { mode } = req.params;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  if (mode === "signin") {
    const player = await Get("players", username);
    if (!player) {
      return res.status(404).json({ error: "Account does not exist." });
    }

    // ❗ BANNED CHECK HERE
    if (player.banned) {
      return res.status(403).json({ error: "Your account has been banned." });
    }

    if (password !== player.password) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Save session
    req.session.user = {
      username: player.username,
      role: player.role, // default normal user
      banned: player.banned
    };

    console.log("Session after login:", req.session.user);
    console.log("Cookie being set:", req.sessionID);


    return res.json(req.session.user);
  }

  if (mode === "signup") {

    const exists = await Get("players", username);

    if (exists) {
      return res.status(409).json({ error: "Account already exists." });
    }

    const newPlayer = await addPlayer(username, password, 1000);

    // Save in session
    req.session.user = {
      username: newPlayer.username,
      role: newPlayer.role || "user",
      banned: false
    };

    return res.status(201).json(req.session.user);
  }

  return res.status(400).json({ error: "Invalid auth request." });
});


// Get current logged in user info
app.get("/api/auth/me", (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session object:", req.session);

  if (!req.session.user) {
    console.log("No session user found.");
    return res.json({ role: "guest" });
  }
  console.log("Returning session user:", req.session.user);


  // Logged in user (could be "user" or "admin")
  res.json(req.session.user);
});


// ADMIN: Ban a User
app.post("/api/admin/ban", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required." });

  const found = await Get("players", username);
  if (!found) return res.status(404).json({ error: "User not found." });

  await Update("players", username, { banned: true });

  res.json({ message: `User ${username} was banned.` });
});

// ADMIN: Unban a User
app.post("/api/admin/unban", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required." });

  const found = await Get("players", username);
  if (!found) return res.status(404).json({ error: "User not found." });

  const updated = await Update("players", username, { banned: false });
  if (!updated) return res.status(500).json({ error: "Failed to unban user." });

  res.json({ message: `User ${username} was unbanned.` });
});



// Database API

app.get("/api/database/data/:table/:username", async (req, res) => {
    try {
        const { table, username } = req.params
        const player = await Get(table, username)
        if (!player) {
            return res.status(404).json({ error: "Player not found." })
        }

        res.json(player)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get player." })
    }
});

app.get("/api/database/leaderboard/:leaderName", async (req, res) => {
    try {
        const { leaderboard } = req.params
        const { by } = req.body
        const top = await getTop(leaderboard, by)
        res.status(201).json(top)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to get database." })
    }
});

app.patch("/api/database/data/:table/:username/add", async (req, res) => {
    try {
        const { table, username } = req.params
        const fields = req.body

        const player = await Increment(table, username, fields)
        if (!player) {
            return res.status(400).json({ error: "Failed to update player data." })
        }
        res.status(200).json(player);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update player data." })
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
        res.json({ message: `Player ${username} removed` })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to delete player." })
    }
});

app.patch("/api/database/data/:table/:username", async (req, res) => {
    try {
        const { table, username } = req.params
        const fields = req.body

        const player = await Update(table, username, fields)
        if (!player) {
            return res.status(400).json({ error: "Failed to update player data." })
        }
        res.status(200).json(player);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update player data." })
    }
});

//Checks to see if backend is setup complete
console.log("Backend setup complete.");

//Checks to see if backend shows message at the website
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Starts the server at the port 3000.
app.listen(3000, () => console.log("🎮 Backend running on http://localhost:3000"));

