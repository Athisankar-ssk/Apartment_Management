import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  adminEmail: String,
  name: String,
  email: { type: String, unique: true },
  userId: { type: String, unique: true },
  apartmentNumber: String,
  password: String,
  mobile: String
});

export default mongoose.model("User", userSchema);
