import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 32 },
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
