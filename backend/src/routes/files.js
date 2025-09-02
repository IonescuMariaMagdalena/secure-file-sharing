import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { auth } from "../middleware/auth.js";
import File from "../models/File.js";
import { encryptToFile, decryptToStream } from "../utils/crypto.js";

const router = Router();
const upload = multer({ dest: "tmp" }); // fișiere temporare, apoi le criptăm

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });

  const destDir = process.env.FILES_DIR || "uploads";
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const finalPath = path.join(destDir, `${Date.now()}-${req.file.originalname}.enc`);

  const { iv, authTag } = await encryptToFile(req.file.path, finalPath);
  fs.unlinkSync(req.file.path); // ștergem fișierul necriptat

  const fileDoc = await File.create({
    owner: req.user.id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: finalPath,
    iv,
    authTag,
    shareTokens: []
  });

  res.status(201).json({ id: fileDoc._id, originalName: fileDoc.originalName });
});

router.get("/", auth, async (req, res) => {
  const files = await File.find({ owner: req.user.id }).select("originalName size createdAt");
  res.json(files);
});

router.get("/:id/download", auth, async (req, res) => {
  const fileDoc = await File.findOne({ _id: req.params.id, owner: req.user.id });
  if (!fileDoc) return res.status(404).json({ message: "Not found" });

  res.setHeader("Content-Disposition", `attachment; filename="${fileDoc.originalName}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  decryptToStream(fileDoc, res);
});

router.post("/:id/share", auth, async (req, res) => {
  const fileDoc = await File.findOne({ _id: req.params.id, owner: req.user.id });
  if (!fileDoc) return res.status(404).json({ message: "Not found" });

  const token = randomBytes(24).toString("hex");
  const ttlMinutes = Number(req.body.ttlMinutes || 30);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  fileDoc.shareTokens.push({ token, expiresAt });
  await fileDoc.save();

  res.json({ url: `/api/share/${token}`, expiresAt });
});

export default router;
