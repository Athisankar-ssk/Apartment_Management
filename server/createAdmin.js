import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

dotenv.config();

export const createAdmin = async () => {
  try {
    
    if (mongoose.connection.readyState !== 1) {
      console.log("Waiting for MongoDB connection...");
      await new Promise(resolve => {
        if (mongoose.connection.readyState === 1) resolve();
        else mongoose.connection.once('connected', resolve);
      });
    }

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
  } catch (error) {
    console.error("Error creating admin:", error.message);
  }
};
