import mongoose from "mongoose";

const securitySchema = new mongoose.Schema({
  securityId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Security", securitySchema);
