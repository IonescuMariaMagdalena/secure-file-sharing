const express = require("express");
const File = require("./File");
const { decryptToStream } = require("./cryptoUtil");

const router = express.Router();

/**
 * GET /api/share/:token
 * descarcă fișierul prin link temporar (fără auth)
 */
router.get("/:token", async (req, res) => {
  const token = req.params.token;
  const fileDoc = await File.findOne({ "shareTokens.token": token });
  if (!fileDoc) return res.status(404).json({ message: "Token invalid" });

  const t = fileDoc.shareTokens.find(x => x.token === token);
  if (!t || t.expiresAt < new Date()) return res.status(410).json({ message: "Link expirat" });

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  decryptToStream(fileDoc, res);
});

module.exports = router;
