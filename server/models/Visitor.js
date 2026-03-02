import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  residentName: { type: String, required: true },
  residentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  apartmentNumber: { type: String, required: true },
  inTime: { type: Date, required: true },
  outTime: { type: Date },
  status: { type: String, enum: ['inside', 'left'], default: 'inside' },
  entryType: { type: String, enum: ['Visitor', 'Cab Entry', 'Food Delivery', 'Service Staff Entry', 'Other'], default: 'Visitor' },
  vehicleNumber: { type: String },
  vehicleDriverName: { type: String },
  securityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Security' }
}, { timestamps: true });

export default mongoose.model("Visitor", visitorSchema);
