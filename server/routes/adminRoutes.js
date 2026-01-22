import express from "express";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    name: admin.name
  });
});


router.post("/create-user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const { adminEmail, name, email, userId, apartmentNumber, password, mobile } = req.body;
    if (!userId || !password || !name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existsUserId = await User.findOne({ userId });
    if (existsUserId) return res.status(400).json({ message: "User ID already exists" });

    const existsEmail = await User.findOne({ email });
    if (existsEmail) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ adminEmail, name, email, userId, apartmentNumber, password: hashed, mobile });
    await user.save();

    res.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user statistics
router.get("/stats", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const totalUsers = await User.countDocuments();
    console.log("Stats endpoint - Total users count:", totalUsers);
    res.json({ totalUsers });
  } catch (err) {
    console.error("Error in stats endpoint:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Migration endpoint - add email field to existing users (copy from adminEmail)
router.post("/migrate-users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    // Find users without email field and set it from adminEmail
    const users = await User.find({ email: { $exists: false } });
    let updated = 0;
    
    for (const user of users) {
      if (user.adminEmail) {
        user.email = user.adminEmail;
        await user.save();
        updated++;
      }
    }

    res.json({ message: `Migrated ${updated} users`, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
