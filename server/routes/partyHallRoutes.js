import express from 'express';
import PartyHallBooking from '../models/PartyHallBooking.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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

// Define available time slots
const TIME_SLOTS = [
  'Morning (9 AM - 1 PM)',
  'Afternoon (2 PM - 6 PM)',
  'Evening (7 PM - 11 PM)'
];

// Get available time slots for a specific date
router.get('/available-slots/:date', authenticateUser, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate that the date is at least 2 days in advance
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    if (selectedDate < twoDaysFromNow) {
      return res.status(400).json({ 
        message: 'Party Hall bookings must be made at least 2 days in advance' 
      });
    }
    
    // Get all confirmed bookings for this date
    const bookings = await PartyHallBooking.find({
      date,
      status: 'confirmed'
    });

    // Create a set of booked slots
    const bookedSlots = new Set(bookings.map(b => b.timeSlot));
    
    // Return available slots (those not booked)
    const availableSlots = TIME_SLOTS.map(slot => ({
      timeSlot: slot,
      isAvailable: !bookedSlots.has(slot)
    }));

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new party hall booking
router.post('/book', authenticateUser, async (req, res) => {
  try {
    const { date, timeSlot, eventType, numberOfGuests } = req.body;
    
    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate that the date is at least 2 days in advance
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    if (selectedDate < twoDaysFromNow) {
      return res.status(400).json({ 
        message: 'Party Hall bookings must be made at least 2 days in advance' 
      });
    }

    // Check if the time slot is valid
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot selected' });
    }

    // Check if slot is still available (only one booking per slot)
    const existingBooking = await PartyHallBooking.findOne({
      date,
      timeSlot,
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Check if user already has a booking for this date (any slot)
    const userExistingBooking = await PartyHallBooking.findOne({
      userId: req.userId,
      date,
      status: 'confirmed'
    });

    if (userExistingBooking) {
      return res.status(400).json({ 
        message: 'You already have a booking for this date. Only one slot per day is allowed.' 
      });
    }

    // Create the booking
    const newBooking = new PartyHallBooking({
      userId: req.userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber || 'N/A',
      date,
      timeSlot,
      eventType,
      numberOfGuests
    });

    await newBooking.save();
    res.status(201).json({ 
      message: 'Party Hall booked successfully', 
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
    const bookings = await PartyHallBooking.find({
      userId: req.userId,
      status: 'confirmed'
    }).sort({ date: -1, createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking (only allowed within 1 day after booking)
router.delete('/cancel/:bookingId', authenticateUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await PartyHallBooking.findOne({
      _id: bookingId,
      userId: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if cancellation is within 1 day (24 hours) of booking creation
    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const hoursSinceBooking = (now - bookingCreatedAt) / (1000 * 60 * 60);
    
    if (hoursSinceBooking > 24) {
      return res.status(400).json({ 
        message: 'Cancellation period expired. Bookings can only be cancelled within 1 day of booking.' 
      });
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
    
    const bookings = await PartyHallBooking.find()
      .populate('userId', 'name email apartmentNumber')
      .sort({ date: -1, createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
