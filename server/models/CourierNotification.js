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
    courierFrom: { type: String, default: "" },       // sender / company e.g. Amazon, FedEx
    description: { type: String, default: "" },        // optional extra notes
    notifiedBy: { type: String, required: true },      // security officer name
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
