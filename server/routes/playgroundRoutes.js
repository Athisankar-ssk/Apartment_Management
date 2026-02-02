import express from 'express';
import PlaygroundBooking from '../models/PlaygroundBooking.js';
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

// Generate time slots (6 AM to 10 PM)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({ startTime, endTime });
  }
  return slots;
};

// Get available time slots for a specific date
router.get('/available-slots/:date', authenticateUser, async (req, res) => {
  try {
    const { date } = req.params;
    
    console.log('Fetching slots for date:', date);
    
    const allSlots = generateTimeSlots();
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log('Current date:', currentDate, 'Current hour:', currentHour);
    
    // Filter out past slots if the selected date is today
    let filteredSlots = allSlots;
    if (date === currentDate) {
      filteredSlots = allSlots.filter(slot => {
        const slotHour = parseInt(slot.startTime.split(':')[0]);
        // Show slot if it starts after current hour
        return slotHour > currentHour;
      });
      console.log('Filtered slots for today:', filteredSlots.length);
    }
    
    // Get all bookings for this date (only confirmed ones)
    const bookings = await PlaygroundBooking.find({
      date,
      status: 'confirmed'
    });

    console.log('Found bookings:', bookings.length);

    // Count bookings per time slot
    const slotBookingCount = {};
    bookings.forEach(booking => {
      const key = `${booking.startTime}-${booking.endTime}`;
      slotBookingCount[key] = (slotBookingCount[key] || 0) + 1;
    });

    // Mark slots as available or full (max 4 bookings per slot)
    const availableSlots = filteredSlots.map(slot => {
      const key = `${slot.startTime}-${slot.endTime}`;
      const bookingCount = slotBookingCount[key] || 0;
      return {
        ...slot,
        bookingCount,
        isAvailable: bookingCount < 4
      };
    }).filter(slot => slot.isAvailable); // Only return available slots

    console.log('Available slots:', availableSlots.length);

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new playground booking
router.post('/book', authenticateUser, async (req, res) => {
  try {
    const { date, startTime, endTime, duration } = req.body;
    
    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if slot is still available (less than 4 bookings)
    const existingBookings = await PlaygroundBooking.countDocuments({
      date,
      startTime,
      endTime,
      status: 'confirmed'
    });

    if (existingBookings >= 4) {
      return res.status(400).json({ message: 'This time slot is fully booked' });
    }

    // Check if user already has a booking for this date and time
    const userExistingBooking = await PlaygroundBooking.findOne({
      userId: req.userId,
      date,
      startTime,
      status: 'confirmed'
    });

    if (userExistingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this time slot' });
    }

    // Create the booking
    const newBooking = new PlaygroundBooking({
      userId: req.userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber || 'N/A',
      date,
      startTime,
      endTime,
      duration
    });

    await newBooking.save();
    res.status(201).json({ 
      message: 'Playground booked successfully', 
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
    const bookings = await PlaygroundBooking.find({
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
    
    const booking = await PlaygroundBooking.findOne({
      _id: bookingId,
      userId: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
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
    
    const bookings = await PlaygroundBooking.find()
      .populate('userId', 'name email apartmentNumber')
      .sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
