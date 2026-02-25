import express from "express";
import Visitor from "../models/Visitor.js";
import Security from "../models/Security.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify security token
const verifySecurity = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const security = await Security.findById(decoded.id);
    if (!security) return res.status(401).json({ message: "Invalid security user" });
    
    req.security = security;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Add new visitor entry
router.post("/add", verifySecurity, async (req, res) => {
  try {
    const { visitorName, visitorPhone, residentId, apartmentNumber, outTime } = req.body;

    if (!visitorName || !visitorPhone || !residentId || !apartmentNumber) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Verify resident exists
    const resident = await User.findById(residentId);
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // Determine status based on outTime
    let status = 'inside';
    if (outTime) {
      status = 'left';
    }

    // Create visitor entry - always capture current system time as inTime
    const visitor = new Visitor({
      visitorName,
      visitorPhone,
      residentName: resident.name,
      residentId,
      apartmentNumber,
      inTime: new Date(), // Always capture current server time
      outTime: outTime ? new Date(outTime) : null,
      status: status,
      securityId: req.security._id
    });

    await visitor.save();
    res.json({ message: "Visitor entry added successfully", visitor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all visitor entries with optional filtering
router.get("/all", verifySecurity, async (req, res) => {
  try {
    const { status, apartmentNumber, date } = req.query;
    let filter = {};

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by apartment number
    if (apartmentNumber) {
      filter.apartmentNumber = apartmentNumber;
    }

    // Filter by date (today)
    if (date === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.inTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const visitors = await Visitor.find(filter)
      .populate('residentId', 'name email mobile')
      .sort({ inTime: -1 });

    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get visitor by ID
router.get("/:id", verifySecurity, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('residentId', 'name email mobile apartmentNumber');
    
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update visitor exit (out-time)
router.put("/:id/checkout", verifySecurity, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status === 'left') {
      return res.status(400).json({ message: "Visitor has already checked out" });
    }

    visitor.outTime = new Date();
    visitor.status = 'left';

    await visitor.save();
    res.json({ message: "Visitor checkout recorded successfully", visitor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update visitor details (except status and times)
router.put("/:id", verifySecurity, async (req, res) => {
  try {
    const { visitorName, visitorPhone } = req.body;
    
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Update allowed fields only
    if (visitorName) visitor.visitorName = visitorName;
    if (visitorPhone) visitor.visitorPhone = visitorPhone;

    await visitor.save();
    res.json({ message: "Visitor details updated successfully", visitor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete visitor entry
router.delete("/:id", verifySecurity, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get visitor statistics (for dashboard quick stats)
router.get("/stats/summary", verifySecurity, async (req, res) => {
  try {
    // Active visitors (currently inside)
    const activeVisitors = await Visitor.countDocuments({ status: 'inside' });

    // Today's entries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayEntries = await Visitor.countDocuments({
      inTime: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ activeVisitors, todayEntries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
