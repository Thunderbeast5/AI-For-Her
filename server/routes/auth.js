import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Entrepreneur from '../models/Entrepreneur.js';
import Mentor from '../models/Mentor.js';
import Investor from '../models/Investor.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Check if user already exists
    let existingUser;
    existingUser = await Entrepreneur.findOne({ email });
    if (!existingUser) existingUser = await Mentor.findOne({ email });
    if (!existingUser) existingUser = await Investor.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user data
    const userData = {
      userId: email,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileCompleted: false,
      emailVerified: false,
      verificationOTP: otp,
      otpExpiry: otpExpiry
    };
    
    // Save to appropriate collection
    let user;
    if (role === 'entrepreneur') {
      user = new Entrepreneur(userData);
    } else if (role === 'mentor') {
      user = new Mentor(userData);
    } else if (role === 'investor') {
      user = new Investor(userData);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    await user.save();
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue with registration even if email fails
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      user: { ...user.toObject(), password: undefined, verificationOTP: undefined }, 
      token,
      message: 'Registration successful. Please check your email for OTP verification.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find user
    let user = await Entrepreneur.findOne({ email });
    let Model = Entrepreneur;
    if (!user) {
      user = await Mentor.findOne({ email });
      Model = Mentor;
    }
    if (!user) {
      user = await Investor.findOne({ email });
      Model = Investor;
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Check OTP
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    
    // Update user as verified
    await Model.findOneAndUpdate(
      { email },
      { 
        emailVerified: true, 
        verificationOTP: null, 
        otpExpiry: null,
        updatedAt: new Date()
      }
    );
    
    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    let user = await Entrepreneur.findOne({ email });
    let Model = Entrepreneur;
    if (!user) {
      user = await Mentor.findOne({ email });
      Model = Mentor;
    }
    if (!user) {
      user = await Investor.findOne({ email });
      Model = Investor;
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update user with new OTP
    await Model.findOneAndUpdate(
      { email },
      { 
        verificationOTP: otp, 
        otpExpiry: otpExpiry,
        updatedAt: new Date()
      }
    );
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.firstName);
      res.json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check all collections
    let user = await Entrepreneur.findOne({ email });
    if (!user) user = await Mentor.findOne({ email });
    if (!user) user = await Investor.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if password exists in database
    if (!user.password) {
      return res.status(500).json({ message: 'Account error. Please contact support or register again.' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      user: { ...user.toObject(), password: undefined, verificationOTP: undefined }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
