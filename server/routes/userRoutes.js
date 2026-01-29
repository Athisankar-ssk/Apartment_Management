import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// User login with email and password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user's profile
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.log("No token provided in GET /profile");
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification failed in GET /profile:", jwtError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// Update user's own profile
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { 
      name, 
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

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { 
        name, 
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

    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Profile updated successfully for user:", user.email);
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;
