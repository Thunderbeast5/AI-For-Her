import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  alternatePhone: String,
  profilePhoto: String,
  role: { type: String, default: 'mentor' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profileCompleted: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  verificationOTP: String,
  otpExpiry: Date,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Display Name (computed from firstName + lastName)
  name: String,
  
  // Mentor-Specific Fields
  mentorType: { type: String, enum: ['personal', 'group', 'both'], default: 'both' },
  personalSessionPrice: { type: Number, default: 0 }, // Price in INR for personal mentoring
  groupSessionPrice: { type: Number, default: 0 }, // Price in INR for group mentoring (usually 0/free)
  
  // Expertise & Sector (Women-focused)
  expertise: { type: String, default: '' }, // Primary expertise as string for display
  expertiseAreas: [String], // Multiple expertise areas
  sector: { 
    type: String, 
    enum: [
      'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
      'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
      'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
      'Education & Training', 'Technology', 'Finance', 'Other'
    ]
  },
  
  // Experience
  experience: String,
  yearsOfExperience: { type: Number, min: 0, max: 50 },
  experienceLevel: { type: String, enum: ['Beginner (0-2 years)', 'Intermediate (3-5 years)', 'Expert (6-10 years)', 'Master (10+ years)'] },
  
  // Availability & Status
  availability: { type: Boolean, default: true },
  availableDays: [String], // ['Monday', 'Tuesday', etc.]
  availableTimeSlots: [String], // ['Morning', 'Afternoon', 'Evening']
  responseTime: { type: String, enum: ['Within 24 hours', 'Within 48 hours', 'Within a week'], default: 'Within 48 hours' },
  
  // Ratings & Stats
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  totalConnections: { type: Number, default: 0 },
  successStories: { type: Number, default: 0 },
  
  // Profile Details
  bio: String,
  linkedIn: String,
  specializations: [String], // Specific skills
  achievements: [String],
  certifications: [String], // Professional certifications
  education: String, // Educational background
  
  // Languages (Important for regional entrepreneurs)
  languages: [{ 
    type: String, 
    enum: ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Other']
  }],
  
  // Location (for local mentor matching)
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  
  // Group Mentoring
  groupSessionCapacity: { type: Number, default: 20 },
  groupSessionSchedule: String,
  
  // Optional Fields
  company: String,
  title: String,
  hourlyRate: Number,
  languages: [String],
  
  // Social Media
  socialMedia: {
    linkedIn: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    github: String,
    website: String
  }
});

export default mongoose.model('Mentor', mentorSchema);
