import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  adminEmail: String,
  name: String,
  email: { type: String, unique: true },
  userId: { type: String, unique: true },
  apartmentNumber: String,
  password: String,
  mobile: String,
  // Profile fields
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  alternateMobile: String,
  emergencyContactName: String,
  emergencyContactNumber: String,
  emergencyContactRelation: String,
  occupation: String,
  numberOfFamilyMembers: Number,
  vehicleDetails: String,
  profilePicture: String,
  address: String
}, { timestamps: true });

export default mongoose.model("User", userSchema);
