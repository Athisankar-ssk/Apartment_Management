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

// Get all users
router.get("/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const { name, email, userId, apartmentNumber, mobile } = req.body;
    
    // Check if new email/userId already exists for other users
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });
    }
    
    if (userId) {
      const existingUser = await User.findOne({ userId, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ message: "User ID already exists" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, userId, apartmentNumber, mobile },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user's full details (including profile fields)
router.put("/users/:id/full", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const { 
      name, 
      email, 
      userId, 
      apartmentNumber, 
      mobile,
      dateOfBirth,
      gender,
      alternateMobile,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      occupation,
      numberOfFamilyMembers,
      vehicleDetails,
      address
    } = req.body;
    
    // Check if new email/userId already exists for other users
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });
    }
    
    if (userId) {
      const existingUser = await User.findOne({ userId, _id: { $ne: req.params.id } });
      if (existingUser) return res.status(400).json({ message: "User ID already exists" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        email, 
        userId, 
        apartmentNumber, 
        mobile,
        dateOfBirth,
        gender,
        alternateMobile,
        emergencyContactName,
        emergencyContactNumber,
        emergencyContactRelation,
        occupation,
        numberOfFamilyMembers,
        vehicleDetails,
        address
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User details updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
