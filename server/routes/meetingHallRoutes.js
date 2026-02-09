import express from 'express';
import MeetingHallBooking from '../models/MeetingHallBooking.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { canCancelBefore } from '../utils/cancellation.js';

const router = express.Router();

// Middleware to verify user token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate time slots (8 AM to 8 PM)
const generateTimeSlots = (duration = 1) => {
  const slots = [];
  for (let hour = 8; hour <= 20 - duration; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + duration).toString().padStart(2, '0')}:00`;
    slots.push({ startTime, endTime });
  }
  return slots;
};

// Check if two time ranges overlap
const checkOverlap = (start1, end1, start2, end2) => {
  const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  
  return s1 < e2 && s2 < e1;
};

// Get available time slots for a specific date and duration
router.get('/available-slots/:date/:duration', authenticateUser, async (req, res) => {
  try {
    const { date, duration } = req.params;
    const durationNum = parseInt(duration);
    
    if (![1, 2, 3].includes(durationNum)) {
      return res.status(400).json({ message: 'Duration must be 1, 2, or 3 hours' });
    }
    
    console.log('Fetching meeting hall slots for date:', date, 'duration:', duration);
    
    const allSlots = generateTimeSlots(durationNum);
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    
    console.log('Current date:', currentDate, 'Current hour:', currentHour);
    
    // Filter out past slots if the selected date is today
    let filteredSlots = allSlots;
    if (date === currentDate) {
      filteredSlots = allSlots.filter(slot => {
        const slotHour = parseInt(slot.startTime.split(':')[0]);
        return slotHour > currentHour;
      });
      console.log('Filtered slots for today:', filteredSlots.length);
    }
    
    // Get all bookings for this date (only confirmed ones)
    const bookings = await MeetingHallBooking.find({
      date,
      status: 'confirmed'
    });

    console.log('Found bookings:', bookings.length);

    // Mark slots as available (only one booking per hall)
    const availableSlots = filteredSlots.filter(slot => {
      // Check if any booking overlaps with this slot
      const hasOverlap = bookings.some(booking => 
        checkOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)
      );
      return !hasOverlap;
    });

    console.log('Available slots:', availableSlots.length);

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new meeting hall booking
router.post('/book', authenticateUser, async (req, res) => {
  try {
    const { date, startTime, endTime, duration, meetingPurpose, numberOfAttendees } = req.body;
    
    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate inputs
    if (!meetingPurpose || !meetingPurpose.trim()) {
      return res.status(400).json({ message: 'Meeting purpose is required' });
    }

    if (!numberOfAttendees || numberOfAttendees < 1 || numberOfAttendees > 20) {
      return res.status(400).json({ message: 'Number of attendees must be between 1 and 20' });
    }

    // Check if slot is still available (no overlapping bookings)
    const existingBookings = await MeetingHallBooking.find({
      date,
      status: 'confirmed'
    });

    const hasOverlap = existingBookings.some(booking => 
      checkOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasOverlap) {
      return res.status(400).json({ message: 'This time slot conflicts with an existing booking' });
    }

    // Create the booking
    const newBooking = new MeetingHallBooking({
      userId: req.userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber || 'N/A',
      date,
      startTime,
      endTime,
      duration,
      meetingPurpose,
      numberOfAttendees
    });

    await newBooking.save();
    res.status(201).json({ 
      message: 'Meeting hall booked successfully', 
      booking: newBooking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateUser, async (req, res) => {
  try {
    const bookings = await MeetingHallBooking.find({
      userId: req.userId,
      status: 'confirmed'
    }).sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.delete('/cancel/:bookingId', authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await MeetingHallBooking.findOne({
      _id: bookingId,
      userId: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow cancellation only if it's at least 20 minutes before slot start
    if (!canCancelBefore(booking.date, booking.startTime, 20)) {
      return res.status(400).json({ message: 'Cancel only before 20 minutes of slot time' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all bookings
router.get('/admin/all-bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify admin token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // You can add admin verification here if needed
    
    const bookings = await MeetingHallBooking.find()
      .populate('userId', 'name email apartmentNumber')
      .sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
