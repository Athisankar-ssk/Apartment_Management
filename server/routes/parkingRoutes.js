import express from 'express';
import VehicleParking from '../models/VehicleParking.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendParkingDecisionEmail, sendParkingRequestNotificationToAdmin } from '../utils/mailer.js';

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

// Sample parking slots
const PARKING_SLOTS = [
  { id: 'P001', name: 'Ground Floor - A1' },
  { id: 'P002', name: 'Ground Floor - A2' },
  { id: 'P003', name: 'Ground Floor - A3' },
  { id: 'P004', name: 'Ground Floor - A4' },
  { id: 'P005', name: 'Ground Floor - B1' },
  { id: 'P006', name: 'Ground Floor - B2' },
  { id: 'P007', name: 'Ground Floor - B3' },
  { id: 'P008', name: 'Ground Floor - B4' },
  { id: 'P009', name: '1st Floor - C1' },
  { id: 'P010', name: '1st Floor - C2' },
  { id: 'P011', name: '1st Floor - C3' },
  { id: 'P012', name: '1st Floor - C4' },
  { id: 'P013', name: '1st Floor - D1' },
  { id: 'P014', name: '1st Floor - D2' },
  { id: 'P015', name: '1st Floor - D3' },
];

// Get available parking slots
router.get('/available-slots', authenticateUser, async (req, res) => {
  try {
    // Get all booked/allocated slots (excluding released ones)
    const allocatedSlots = await VehicleParking.find({
      status: { $in: ['approved', 'pending'] }
    }).distinct('slotId');

    // Return available slots
    const availableSlots = PARKING_SLOTS
      .filter(slot => !allocatedSlots.includes(slot.id))
      .map(slot => ({
        id: slot.id,
        name: slot.name,
        isAvailable: true
      }));

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request a parking slot
router.post('/request-slot', authenticateUser, async (req, res) => {
  try {
    const { slotId, slotName, vehicleNumber, vehicleType } = req.body;

    if (!slotId || !vehicleNumber || !vehicleType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if slot is already allocated
    const existingAllocation = await VehicleParking.findOne({
      slotId,
      status: { $in: ['approved', 'pending'] }
    });

    if (existingAllocation) {
      return res.status(400).json({ message: 'Slot is already allocated' });
    }

    // Check if user already has an allocated slot
    const userExistingSlot = await VehicleParking.findOne({
      userId: req.userId,
      status: { $in: ['approved', 'pending'] }
    });

    if (userExistingSlot) {
      return res.status(400).json({ message: 'You already have an allocated parking slot' });
    }

    // Create new parking request
    const parkingRequest = new VehicleParking({
      userId: req.userId,
      userName: user.name,
      apartmentNumber: user.apartmentNumber,
      slotId,
      slotName: slotName || `Slot ${slotId}`,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      status: 'pending'
    });

    await parkingRequest.save();

    let adminEmailSent = false;
    try {
      adminEmailSent = await sendParkingRequestNotificationToAdmin({
        requestId: parkingRequest._id,
        residentName: user.name,
        residentEmail: user.email,
        apartmentNumber: user.apartmentNumber,
        slotName: parkingRequest.slotName,
        slotId: parkingRequest.slotId,
        vehicleType: parkingRequest.vehicleType,
        vehicleNumber: parkingRequest.vehicleNumber,
        requestedAt: parkingRequest.createdAt,
      });

      if (!adminEmailSent) {
        console.warn(`Admin parking-request email not sent for booking ${parkingRequest._id}`);
      }
    } catch (mailErr) {
      console.error('Failed to send parking request email to admin:', mailErr);
    }

    res.status(201).json({
      message: adminEmailSent
        ? 'Parking slot request submitted successfully. Admin has been notified by email.'
        : 'Parking slot request submitted successfully. Waiting for admin approval.',
      parkingRequest,
      adminEmailSent,
    });
  } catch (error) {
    console.error('Error requesting slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's allocated slot
router.get('/my-slot', authenticateUser, async (req, res) => {
  try {
    const slot = await VehicleParking.findOne({
      userId: req.userId,
      status: { $in: ['approved', 'pending'] }
    });

    if (!slot) {
      return res.status(404).json({ message: 'No allocated slot found' });
    }

    res.json(slot);
  } catch (error) {
    console.error('Error fetching user slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Release parking slot
router.post('/release-slot', authenticateUser, async (req, res) => {
  try {
    const slot = await VehicleParking.findOne({
      userId: req.userId,
      status: 'approved'
    });

    if (!slot) {
      return res.status(404).json({ message: 'No approved slot found to release' });
    }

    slot.status = 'released';
    slot.releasedDate = new Date();
    await slot.save();

    res.json({ message: 'Parking slot released successfully', slot });
  } catch (error) {
    console.error('Error releasing slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all parking requests/allocation
router.get('/admin/all-bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify admin token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const bookings = await VehicleParking.find()
      .populate('userId', 'name email apartmentNumber')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve parking slot request
router.post('/admin/approve/:bookingId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify admin token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const booking = await VehicleParking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending parking requests can be approved' });
    }

    const alreadyApprovedForSlot = await VehicleParking.findOne({
      _id: { $ne: booking._id },
      slotId: booking.slotId,
      status: 'approved'
    });

    if (alreadyApprovedForSlot) {
      return res.status(400).json({ message: 'This slot has already been approved for another resident' });
    }

    booking.status = 'approved';
    booking.approvedDate = new Date();
    await booking.save();

    let emailSent = false;
    try {
      const resident = await User.findById(booking.userId).select('name email apartmentNumber');
      if (resident?.email) {
        emailSent = await sendParkingDecisionEmail({
          toEmail: resident.email,
          residentName: resident.name || booking.userName,
          apartmentNumber: resident.apartmentNumber || booking.apartmentNumber,
          slotName: booking.slotName,
          slotId: booking.slotId,
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber,
          decision: 'approved',
          decisionAt: booking.approvedDate,
        });

        if (!emailSent) {
          console.warn(`Parking approval email not sent for booking ${booking._id}`);
        }
      } else {
        console.warn(`Resident email not found for parking booking ${booking._id}`);
      }
    } catch (mailErr) {
      console.error('Failed to send parking approval email:', mailErr);
    }

    res.json({
      message: emailSent
        ? 'Parking slot approved and resident notified by email'
        : 'Parking slot approved. Resident email notification could not be sent',
      booking,
      emailSent,
    });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Reject parking slot request
router.post('/admin/reject/:bookingId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify admin token
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const booking = await VehicleParking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending parking requests can be rejected' });
    }

    booking.status = 'rejected';
    await booking.save();

    const decisionAt = new Date();
    let emailSent = false;
    try {
      const resident = await User.findById(booking.userId).select('name email apartmentNumber');
      if (resident?.email) {
        emailSent = await sendParkingDecisionEmail({
          toEmail: resident.email,
          residentName: resident.name || booking.userName,
          apartmentNumber: resident.apartmentNumber || booking.apartmentNumber,
          slotName: booking.slotName,
          slotId: booking.slotId,
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber,
          decision: 'rejected',
          decisionAt,
        });

        if (!emailSent) {
          console.warn(`Parking rejection email not sent for booking ${booking._id}`);
        }
      } else {
        console.warn(`Resident email not found for parking booking ${booking._id}`);
      }
    } catch (mailErr) {
      console.error('Failed to send parking rejection email:', mailErr);
    }

    res.json({
      message: emailSent
        ? 'Parking slot request rejected and resident notified by email'
        : 'Parking slot request rejected. Resident email notification could not be sent',
      booking,
      emailSent,
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Security: Get all parking slot allocations (with slot availability)
router.get('/security/all-allocations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token (works for both admin and security)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get all approved and pending allocations
    const allocations = await VehicleParking.find({
      status: { $in: ['approved', 'pending'] }
    })
      .select('-password')
      .sort({ slotId: 1 });

    // Get allocated slot IDs
    const allocatedSlotIds = allocations.map(a => a.slotId);

    // Create a comprehensive slot map
    const PARKING_SLOTS = [
      { id: 'P001', name: 'Ground Floor - A1' },
      { id: 'P002', name: 'Ground Floor - A2' },
      { id: 'P003', name: 'Ground Floor - A3' },
      { id: 'P004', name: 'Ground Floor - A4' },
      { id: 'P005', name: 'Ground Floor - B1' },
      { id: 'P006', name: 'Ground Floor - B2' },
      { id: 'P007', name: 'Ground Floor - B3' },
      { id: 'P008', name: 'Ground Floor - B4' },
      { id: 'P009', name: '1st Floor - C1' },
      { id: 'P010', name: '1st Floor - C2' },
      { id: 'P011', name: '1st Floor - C3' },
      { id: 'P012', name: '1st Floor - C4' },
      { id: 'P013', name: '1st Floor - D1' },
      { id: 'P014', name: '1st Floor - D2' },
      { id: 'P015', name: '1st Floor - D3' },
    ];

    const slotMap = PARKING_SLOTS.map(slot => {
      const allocation = allocations.find(a => a.slotId === slot.id);
      return {
        slotId: slot.id,
        slotName: slot.name,
        isAllocated: !!allocation,
        allocation: allocation ? {
          id: allocation._id,
          userName: allocation.userName,
          apartmentNumber: allocation.apartmentNumber,
          vehicleNumber: allocation.vehicleNumber,
          vehicleType: allocation.vehicleType,
          status: allocation.status,
          approvedDate: allocation.approvedDate
        } : null
      };
    });

    res.json(slotMap);
  } catch (error) {
    console.error('Error fetching parking allocations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
