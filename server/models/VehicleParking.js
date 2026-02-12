import mongoose from 'mongoose';

const vehicleParkingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  apartmentNumber: {
    type: String,
    required: true
  },
  slotId: {
    type: String,
    required: true
  },
  slotName: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Car', 'Motorcycle', 'Scooter', 'SUV', 'Other']
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'released'],
    default: 'pending'
  },
  approvedDate: {
    type: Date
  },
  releasedDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
vehicleParkingSchema.index({ userId: 1, status: 1 });
vehicleParkingSchema.index({ slotId: 1 });

export default mongoose.model('VehicleParking', vehicleParkingSchema);
