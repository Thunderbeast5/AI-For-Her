import mongoose from 'mongoose';

const startupSchema = new mongoose.Schema({
  // Basic Information
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  tagline: { type: String },
  description: { type: String, required: true },
  logo: { type: String },
  coverImage: { type: String },
  
  // Founder Information
  founderName: { type: String, required: true },
  coFounders: [{ 
    name: String, 
    role: String, 
    email: String 
  }],
  
  // Business Details
  industry: { type: String, required: true },
  subIndustries: [String],
  stage: { type: String, required: true, enum: ['Idea', 'Prototype', 'Seed', 'Early Stage', 'Growth', 'Series A', 'Series B', 'Series C+'] },
  foundedDate: { type: Date },
  registrationNumber: { type: String },
  businessType: { type: String, enum: ['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'Other'] },
  location: { type: String },
  
  // Problem & Solution
  problemStatement: { type: String, required: true },
  solution: { type: String, required: true },
  targetMarket: { type: String, required: true },
  uniqueSellingPoint: { type: String },
  valueProposition: { type: String },
  
  // Product/Service Information
  productStatus: { type: String, enum: ['Idea', 'In Development', 'MVP Ready', 'Launched', 'Scaling'] },
  features: [String],
  technology: [String],
  screenshots: [String],
  demoVideo: { type: String },
  
  // Funding Information
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  fundingStage: { type: String },
  fundingHistory: [{
    round: String,
    amount: Number,
    date: Date,
    investors: [String]
  }],
  revenueModel: { type: String },
  currentRevenue: { type: Number },
  projectedRevenue: { type: Number },
  monthlyBurnRate: { type: Number },
  runway: { type: String },
  
  // Team Information
  teamSize: { type: Number, required: true },
  team: [{
    name: String,
    role: String,
    bio: String,
    photo: String,
    linkedIn: String,
    email: String
  }],
  keyHires: [String],
  
  // Market & Traction
  customerBase: { type: Number, default: 0 },
  monthlyActiveUsers: { type: Number },
  marketSize: { type: String },
  competitors: [String],
  competitiveAdvantage: { type: String },
  traction: {
    users: Number,
    revenue: Number,
    growth: String,
    partnerships: [String],
    milestones: [String]
  },
  achievements: [String],
  
  // Business Model
  businessModel: { type: String },
  pricingStrategy: { type: String },
  customerAcquisitionCost: { type: Number },
  lifetimeValue: { type: Number },
  
  // Go-to-Market Strategy
  marketingStrategy: { type: String },
  salesChannels: [String],
  partnerships: [String],
  
  // Risks & Challenges
  risks: [String],
  challenges: { type: String },
  mitigation: { type: String },
  
  // Documents & Links
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  pitchDeck: { type: String },
  businessPlan: { type: String },
  financialProjections: { type: String },
  
  // Contact Information
  email: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Social Media
  socialMedia: {
    linkedIn: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    github: String
  },
  
  // Investment Details
  lookingFor: [String], // ['Funding', 'Mentorship', 'Partnership', 'Advisory', 'Talent']
  investmentUse: { type: String }, // How funds will be used
  expectedROI: { type: String },
  exitStrategy: { type: String },
  
  // Metadata
  visibility: { type: String, default: 'public', enum: ['public', 'private', 'investors-only'] },
  featured: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  status: { type: String, default: 'active', enum: ['active', 'paused', 'closed', 'funded'] },
  views: { type: Number, default: 0 },
  savedBy: [String],
  interestedInvestors: [String],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
startupSchema.index({ userId: 1, createdAt: -1 });
startupSchema.index({ industry: 1, stage: 1 });
startupSchema.index({ visibility: 1, status: 1 });

export default mongoose.model('Startup', startupSchema);
