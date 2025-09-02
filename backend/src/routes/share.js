import { Router } from "express";
import File from "../models/File.js";
import { decryptToStream } from "../utils/crypto.js";

const router = Router();

router.get("/:token", async (req, res) => {
  const token = req.params.token;
  const fileDoc = await File.findOne({ "shareTokens.token": token });
  if (!fileDoc) return res.status(404).json({ message: "Invalid token" });

  const t = fileDoc.shareTokens.find(st => st.token === token);
  if (!t || t.expiresAt < new Date()) return res.status(410).json({ message: "Link expired" });

  res.setHeader("Content-Disposition", `attachment; filename="${fileDoc.originalName}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  decryptToStream(fileDoc, res);
});

export default router;
