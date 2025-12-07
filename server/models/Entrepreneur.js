import mongoose from 'mongoose';

const entrepreneurSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  alternatePhone: String,
  profilePhoto: String,
  role: { type: String, default: 'entrepreneur' },
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
  
  // Professional Information
  bio: String,
  education: String,
  experience: String,
  skills: [String],
  
  // Social Media
  socialMedia: {
    linkedIn: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    github: String,
    website: String
  },
  
  // Entrepreneur-Specific Fields
  startups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  primaryIndustry: String,
  secondaryIndustries: [String],
  businessStage: String,
  lookingFor: [String],
  achievements: [String],
  
  // Preferences
  preferredContactMethod: { type: String, default: 'email' },
  availableForNetworking: { type: Boolean, default: true },
  language: [String],
  timezone: String
});

export default mongoose.model('Entrepreneur', entrepreneurSchema);
