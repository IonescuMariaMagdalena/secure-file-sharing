// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./User");

const app = express();
const PORT = process.env.PORT || 5000;

// Conectare la MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});


// Ruta test
app.get("/", (req, res) => {
  res.send("✅ Backend is running with MongoDB!");
});

// Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email deja folosit" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hash });

    res.status(201).json({ message: "Cont creat cu succes!", id: user._id });
  } catch (err) {
    console.error("❌ Eroare la register:", err);
    res.status(500).json({ message: "Eroare server" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email sau parolă greșită" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Email sau parolă greșită" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ Eroare la login:", err);
    res.status(500).json({ message: "Eroare server" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
