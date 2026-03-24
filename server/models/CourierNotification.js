import mongoose from "mongoose";

const courierNotificationSchema = new mongoose.Schema(
  {
    residentName: { type: String, required: true },
    apartmentNumber: { type: String, required: true },
    courierType: {
      type: String,
      enum: ["Package", "Letter", "Document", "Food Delivery", "Grocery", "Other"],
      required: true,
    },
    courierFrom: { type: String, default: "" },     
    description: { type: String, default: "" },        
    notifiedBy: { type: String, required: true },      
    securityId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "collected"],
      default: "pending",
    },
    collectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("CourierNotification", courierNotificationSchema);
