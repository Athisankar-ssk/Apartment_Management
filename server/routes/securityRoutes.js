import express from "express";
import Security from "../models/Security.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Invalid admin" });
    
    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Create security account (admin only)
router.post("/create", verifyAdmin, async (req, res) => {
  try {
    const { securityId, name, email, password, phoneNumber } = req.body;
    
    if (!securityId || !name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if security ID already exists
    const existsSecurityId = await Security.findOne({ securityId });
    if (existsSecurityId) {
      return res.status(400).json({ message: "Security ID already exists" });
    }

    // Check if email already exists
    const existsEmail = await Security.findOne({ email });
    if (existsEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create security account
    const security = new Security({
      securityId,
      name,
      email,
      password: hashedPassword,
      phoneNumber
    });

    await security.save();
    res.json({ message: "Security account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all security accounts (admin only)
router.get("/all", verifyAdmin, async (req, res) => {
  try {
    const securities = await Security.find().select("-password").sort({ name: 1 });
    res.json(securities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single security account by ID (admin only)
router.get("/:id", verifyAdmin, async (req, res) => {
  try {
    const security = await Security.findById(req.params.id).select("-password");
    if (!security) {
      return res.status(404).json({ message: "Security account not found" });
    }
    res.json(security);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update security account (admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { securityId, name, email, phoneNumber } = req.body;

    // Check if new security ID already exists for other accounts
    if (securityId) {
      const existingSecurity = await Security.findOne({ 
        securityId, 
        _id: { $ne: req.params.id } 
      });
      if (existingSecurity) {
        return res.status(400).json({ message: "Security ID already exists" });
      }
    }

    // Check if new email already exists for other accounts
    if (email) {
      const existingSecurity = await Security.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingSecurity) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const security = await Security.findByIdAndUpdate(
      req.params.id,
      { securityId, name, email, phoneNumber },
      { new: true }
    ).select("-password");

    if (!security) {
      return res.status(404).json({ message: "Security account not found" });
    }

    res.json({ message: "Security account updated", security });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete security account (admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const security = await Security.findByIdAndDelete(req.params.id);
    if (!security) {
      return res.status(404).json({ message: "Security account not found" });
    }
    res.json({ message: "Security account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Security login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const security = await Security.findOne({ email });
    if (!security) {
      return res.status(400).json({ message: "Security account not found" });
    }

    const isMatch = await bcrypt.compare(password, security.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: security._id, type: "security" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, name: security.name, securityId: security.securityId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
