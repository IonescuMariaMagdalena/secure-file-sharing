import mongoose from "mongoose";

const shareTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}, { _id: false });

const fileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalName: String,
  mimeType: String,
  size: Number,
  path: { type: String, required: true },
  iv: { type: Buffer, required: true },
  authTag: { type: Buffer, required: true }
}, { timestamps: true });

fileSchema.add({ shareTokens: [shareTokenSchema] });

export default mongoose.model("File", fileSchema);
