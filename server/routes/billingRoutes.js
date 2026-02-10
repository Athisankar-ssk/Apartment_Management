import express from "express";
import MaintenanceBill from "../models/MaintenanceBill.js";
import ElectricityBill from "../models/ElectricityBill.js";
import User from "../models/User.js";

const router = express.Router();

// ================== MAINTENANCE BILLS ==================

// Get all maintenance bills
router.get("/maintenance", async (req, res) => {
  try {
    const bills = await MaintenanceBill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get maintenance bills by userId
router.get("/maintenance/user/:userId", async (req, res) => {
  try {
    const bills = await MaintenanceBill.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new maintenance bill
router.post("/maintenance", async (req, res) => {
  try {
    const { userId, month, year, amount, dueDate } = req.body;
    
    // Get user details
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bill = new MaintenanceBill({
      userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber,
      month,
      year,
      amount,
      dueDate,
      status: 'Unpaid'
    });

    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update maintenance bill
router.put("/maintenance/:id", async (req, res) => {
  try {
    const updatedBill = await MaintenanceBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete maintenance bill
router.delete("/maintenance/:id", async (req, res) => {
  try {
    const bill = await MaintenanceBill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================== ELECTRICITY BILLS ==================

// Get all electricity bills
router.get("/electricity", async (req, res) => {
  try {
    const bills = await ElectricityBill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get electricity bills by userId
router.get("/electricity/user/:userId", async (req, res) => {
  try {
    const bills = await ElectricityBill.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new electricity bill
router.post("/electricity", async (req, res) => {
  try {
    const { userId, month, year, unitsConsumed, ratePerUnit, dueDate } = req.body;
    
    // Get user details
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amount = unitsConsumed * ratePerUnit;

    const bill = new ElectricityBill({
      userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber,
      month,
      year,
      unitsConsumed,
      ratePerUnit,
      amount,
      dueDate,
      status: 'Unpaid'
    });

    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update electricity bill
router.put("/electricity/:id", async (req, res) => {
  try {
    const updatedBill = await ElectricityBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete electricity bill
router.delete("/electricity/:id", async (req, res) => {
  try {
    const bill = await ElectricityBill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
