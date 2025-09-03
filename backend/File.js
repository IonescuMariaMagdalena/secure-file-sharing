const mongoose = require("mongoose");

const shareTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}, { _id: false });

const fileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },      // calea fișierului CRIPTAT
  iv: { type: Buffer, required: true },
  authTag: { type: Buffer, required: true },
  shareTokens: [shareTokenSchema]
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
