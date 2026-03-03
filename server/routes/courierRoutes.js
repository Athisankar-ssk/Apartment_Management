import express from "express";
import jwt from "jsonwebtoken";
import Security from "../models/Security.js";
import User from "../models/User.js";
import CourierNotification from "../models/CourierNotification.js";

const router = express.Router();

// ── Middleware: verify security token ──────────────────────────────────────
const verifySecurity = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const officer = await Security.findById(decoded.id).select("-password");
    if (!officer) return res.status(401).json({ message: "Invalid security token" });
    req.officer = officer;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// POST /api/courier  — log a new courier arrival
router.post("/", verifySecurity, async (req, res) => {
  try {
    const { residentName, apartmentNumber, courierType, courierFrom, description } = req.body;
    if (!residentName || !apartmentNumber || !courierType) {
      return res.status(400).json({ message: "residentName, apartmentNumber and courierType are required" });
    }
    const notification = await CourierNotification.create({
      residentName,
      apartmentNumber,
      courierType,
      courierFrom: courierFrom || "",
      description: description || "",
      notifiedBy: req.officer.name,
      securityId: req.officer.securityId,
    });
    res.status(201).json({ message: "Courier notification logged successfully", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courier  — all notifications (security sees all)
router.get("/", verifySecurity, async (req, res) => {
  try {
    const notifications = await CourierNotification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/courier/:id/collected  — mark as collected
router.patch("/:id/collected", verifySecurity, async (req, res) => {
  try {
    const notification = await CourierNotification.findByIdAndUpdate(
      req.params.id,
      { status: "collected", collectedAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Marked as collected", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Middleware: verify user token ─────────────────────────────────────────
const verifyUser = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid user token" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// GET /api/courier/my  — resident fetches their own notifications by apartment
router.get("/my", verifyUser, async (req, res) => {
  try {
    const notifications = await CourierNotification.find({
      apartmentNumber: req.user.apartmentNumber,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/courier/:id/received — resident marks their own notification as collected
router.patch("/:id/received", verifyUser, async (req, res) => {
  try {
    const notification = await CourierNotification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.status === "collected")
      return res.status(400).json({ message: "Already marked as collected" });
    notification.status = "collected";
    notification.collectedAt = new Date();
    await notification.save();
    res.json({ message: "Marked as received", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
