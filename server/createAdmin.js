import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

dotenv.config();

export const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword
  });

  console.log("Admin created successfully");
};
