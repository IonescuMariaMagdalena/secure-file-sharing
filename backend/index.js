// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// modele / rute
const User = require("./User");
const filesRoutes = require("./filesRoutes");
const shareRoutes = require("./shareRoutes");

const app = express();                              // 1) creezi app
const PORT = process.env.PORT || 8080;              // pune 8080 by default

// conexiune DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB error:", err));

// middleware globale
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// (opțional) logger simplu
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ruta test
app.get("/", (_req, res) => {
  res.send("✅ Backend is running with MongoDB!");
});

// --- AUTH ---
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email deja folosit" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hash });
    res.status(201).json({ message: "Cont creat cu succes!", id: user._id });
  } catch (err) {
    console.error("❌ Eroare la register:", err);
    res.status(500).json({ message: "Eroare server" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email sau parolă greșită" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Email sau parolă greșită" });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (err) {
    console.error("❌ Eroare la login:", err);
    res.status(500).json({ message: "Eroare server" });
  }
});

// --- FILES & SHARE --- montează DUPĂ ce ai app creat
app.use("/api/files", filesRoutes);
app.use("/api/share", shareRoutes);

// pornire server
app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
  console.log(`🚀 API on http://localhost:${process.env.PORT || 8080} (listening on 0.0.0.0)`);
});


