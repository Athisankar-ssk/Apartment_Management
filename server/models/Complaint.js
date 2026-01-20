import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Electricity", "Water", "Cleaning", "Other"]
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ["low", "medium", "high", "critical"]
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "in-progress", "resolved", "closed"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
