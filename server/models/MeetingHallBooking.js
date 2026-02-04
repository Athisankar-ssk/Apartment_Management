import mongoose from 'mongoose';

const meetingHallBookingSchema = new mongoose.Schema({
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
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    default: 1
  },
  meetingPurpose: {
    type: String,
    required: true
  },
  numberOfAttendees: {
    type: Number,
    required: true,
    min: 1,
    max: 20
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
meetingHallBookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

export default mongoose.model('MeetingHallBooking', meetingHallBookingSchema);
