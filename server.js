const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(cors());
app.use(express.json());

// Hjelpefunksjoner for å lese/lagre data
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // Hvis fil ikke finnes eller er ødelagt, start på nytt
    return { users: [], achievements: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Enkel id-generator
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * POST /api/signup
 * body: { email, password, displayName }
 * OBS: Passord lagres i klartekst – KUN for testing / skole / hobby.
 */
app.post("/api/signup", (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email og passord er påkrevd" });
  }

  const data = readData();
  const existing = data.users.find((u) => u.email === email);

  if (existing) {
    return res.status(409).json({ error: "Bruker med denne e-posten finnes allerede" });
  }

  const user = {
    id: makeId(),
    email,
    password, // IKKE sikkert, men greit for testing
    displayName: displayName || email.split("@")[0],
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  writeData(data);

  // Ikke send passord tilbake
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

/**
 * POST /api/login
 * body: { email, password }
 * Returnerer user hvis riktig
 */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const data = readData();
  const user = data.users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Feil e-post eller passord" });
  }

  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * GET /api/achievements
 * Returnerer alle achievements (nyeste først)
 */
app.get("/api/achievements", (req, res) => {
  const data = readData();
  const sorted = [...data.achievements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sorted);
});

/**
 * POST /api/achievements
 * body: { text, userId }
 */
app.post("/api/achievements", (req, res) => {
  const { text, userId } = req.body;

  if (!text || !userId) {
    return res.status(400).json({ error: "text og userId er påkrevd" });
  }

  const data = readData();
  const user = data.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: "Ugyldig bruker" });
  }

  const achievement = {
    id: makeId(),
    userId,
    userEmail: user.email,
    userName: user.displayName,
    text,
    createdAt: new Date().toISOString(),
  };

  data.achievements.push(achievement);
  writeData(data);

  res.status(201).json(achievement);
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
