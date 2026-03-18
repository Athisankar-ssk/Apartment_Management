import express from "express";
import jwt from "jsonwebtoken";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import {
  sendComplaintNotificationToAdmin,
  sendComplaintResolvedToUser,
} from "../utils/mailer.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// User submits a complaint
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { category, subject, description, urgency } = req.body;
    
    const complaint = await Complaint.create({
      userId: req.userId,
      category,
      subject,
      description,
      urgency
    });

    // Notify admin about the new complaint (best-effort)
    try {
      const user = await User.findById(req.userId).select("name email apartmentNumber mobile");
      const mailSent = await sendComplaintNotificationToAdmin({
        complaintId: complaint._id,
        category,
        subject,
        description,
        urgency,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
        apartmentNumber: user?.apartmentNumber || "",
        mobile: user?.mobile || "",
        submittedAt: complaint.createdAt,
      });

      if (!mailSent) {
        console.warn(`Admin email not sent for complaint ${complaint._id} — check EMAIL_USER/EMAIL_PASS`);
      }
    } catch (mailErr) {
      console.error("Failed to send complaint notification to admin:", mailErr);
    }

    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
});

// User gets their own complaints
router.get("/my-complaints", verifyToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// Admin gets all complaints
router.get("/all", verifyToken, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email apartmentNumber mobile")
      .sort({ createdAt: -1 });
    
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// Admin gets single complaint details
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email userId apartmentNumber mobile");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch complaint details" });
  }
});

// Admin updates complaint status
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email apartmentNumber mobile");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // If status changed to 'resolved', notify the resident (best-effort)
    try {
      if (String(status).toLowerCase() === "resolved") {
        const user = complaint.userId;
        if (user?.email) {
          const resolvedMail = await sendComplaintResolvedToUser({
            toEmail: user.email,
            residentName: user.name || "Resident",
            complaintId: complaint._id,
            subject: complaint.subject,
            resolvedAt: new Date(),
          });

          if (!resolvedMail) {
            console.warn(`Resolution email not sent for complaint ${complaint._id} — check EMAIL_USER/EMAIL_PASS`);
          }
        }
      }
    } catch (mailErr) {
      console.error("Failed to send resolved email to user:", mailErr);
    }

    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update complaint status" });
  }
});

export default router;
