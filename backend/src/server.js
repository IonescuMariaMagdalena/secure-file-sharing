import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import fs from "fs";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import filesRoutes from "./routes/files.js";
import shareRoutes from "./routes/share.js";

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (!fs.existsSync(process.env.FILES_DIR || "uploads")) {
  fs.mkdirSync(process.env.FILES_DIR || "uploads", { recursive: true });
}

app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: false }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/share", shareRoutes);

await connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
