import mongoose from "mongoose";

const electricityBillSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  apartmentNumber: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  unitsConsumed: { type: Number, required: true },
  ratePerUnit: { type: Number, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Overdue'], 
    default: 'Unpaid' 
  },
  paidDate: { type: Date },
  paymentMethod: { type: String },
  transactionId: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model("ElectricityBill", electricityBillSchema);
