import mongoose from 'mongoose';

const investorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  alternatePhone: String,
  profilePhoto: String,
  role: { type: String, default: 'investor' },
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
  
  // Investor-Specific Fields
  investmentAreas: [String],
  investmentRange: {
    min: Number,
    max: Number
  },
  portfolioCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  investmentStage: [String],
  bio: String,
  firm: String,
  
  // Optional Fields
  investmentCount: { type: Number, default: 0 },
  successfulExits: { type: Number, default: 0 },
  
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

export default mongoose.model('Investor', investorSchema);
