const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mime = require("mime");
const auth = require("./authMiddleware");
const File = require("./File");
const { encryptToFile, decryptToStream } = require("./cryptoUtil");

const router = express.Router();

// folder temporar pentru upload
const upload = multer({ dest: "tmp" });

// asigură-te că există folderul de fișiere criptate
const FILES_DIR = process.env.FILES_DIR || "uploads";
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });

/**
 * POST /api/files/upload
 * multipart/form-data: field "file"
 */
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Lipsește fișierul" });

    // cale finală criptată
    const safeName = req.file.originalname.replace(/[^\w.\- ]/g, "_");
    const encName = `${Date.now()}-${safeName}.enc`;
    const finalPath = path.join(FILES_DIR, encName);

    // criptăm și ștergem temporarul
    const { iv, authTag } = await encryptToFile(req.file.path, finalPath);
    fs.unlinkSync(req.file.path);

    const doc = await File.create({
      owner: req.user.id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype || mime.getType(req.file.originalname) || "application/octet-stream",
      size: req.file.size,
      path: finalPath,
      iv,
      authTag,
      shareTokens: []
    });

    res.status(201).json({ id: doc._id, name: doc.originalName, size: doc.size, createdAt: doc.createdAt });
  } catch (e) {
    console.error("upload error:", e);
    res.status(500).json({ message: "Eroare la upload" });
  }
});

/**
 * GET /api/files
 * lista fișierelor userului curent
 */
router.get("/", auth, async (req, res) => {
  const files = await File.find({ owner: req.user.id }).sort({ createdAt: -1 })
    .select("originalName size createdAt");
  res.json(files);
});

/**
 * GET /api/files/:id/download
 * descarcă (decriptează în stream)
 */
router.get("/:id/download", auth, async (req, res) => {
  const fileDoc = await File.findOne({ _id: req.params.id, owner: req.user.id });
  if (!fileDoc) return res.status(404).json({ message: "Fișier inexistent" });

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  decryptToStream(fileDoc, res);
});

/**
 * POST /api/files/:id/share
 * generează link temporar
 * body: { ttlMinutes: number }
 */
router.post("/:id/share", auth, async (req, res) => {
  const fileDoc = await File.findOne({ _id: req.params.id, owner: req.user.id });
  if (!fileDoc) return res.status(404).json({ message: "Fișier inexistent" });

  const token = crypto.randomBytes(24).toString("hex");
  const ttlMinutes = Number(req.body?.ttlMinutes || 30);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  fileDoc.shareTokens.push({ token, expiresAt });
  await fileDoc.save();

  // 👇 generează URL absolut
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  const absoluteUrl = `${base}/api/share/${token}`;

  res.json({ url: absoluteUrl, expiresAt });
});

module.exports = router;
