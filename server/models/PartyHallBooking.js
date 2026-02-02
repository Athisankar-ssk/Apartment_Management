import mongoose from 'mongoose';

const partyHallBookingSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['Morning (9 AM - 1 PM)', 'Afternoon (2 PM - 6 PM)', 'Evening (7 PM - 11 PM)']
  },
  eventType: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
partyHallBookingSchema.index({ date: 1, timeSlot: 1 });
partyHallBookingSchema.index({ userId: 1, date: 1 });

export default mongoose.model('PartyHallBooking', partyHallBookingSchema);
