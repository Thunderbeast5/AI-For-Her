import mongoose from 'mongoose';

const investorSchema = new mongoose.Schema({
  investorId: {
    type: String,  // Changed from ObjectId to String to support email-based userId
    required: true
  },
  investorName: String,
  investorEmail: String,
  amount: {
    type: Number,
    required: true
  },
  equityPercentage: Number,
  investmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  }
});

const investmentProjectSchema = new mongoose.Schema({
  // Project Identification
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true
  },
  entrepreneurId: {
    type: String,  // Changed from ObjectId to String to support email-based userId
    required: true
  },
  userId: String,
  projectName: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },

  // Funding Details
  fundingGoal: {
    type: Number,
    required: true
  },
  currentFunding: {
    type: Number,
    default: 0
  },
  fundingPercentage: {
    type: Number,
    default: 0
  },
  minimumInvestment: {
    type: Number,
    required: true
  },
  maximumInvestment: Number,
  fundingDeadline: {
    type: Date,
    required: true
  },
  equityOffered: {
    type: Number,
    required: true
  },
  valuationAmount: {
    type: Number,
    required: true
  },

  // Investors
  investors: [investorSchema],
  totalInvestors: {
    type: Number,
    default: 0
  },

  // Project Details
  fundingPurpose: {
    type: String,
    required: true
  },
  revenueModel: String,
  currentRevenue: {
    type: Number,
    default: 0
  },
  projectedRevenue: Number,
  monthlyBurnRate: Number,

  // Milestones & Timeline
  milestones: [String],
  timeline: String,

  // Market & Traction
  marketSize: String,
  competitiveAdvantage: String,
  customerBase: Number,
  growthRate: String,

  // Team & Credentials
  teamSize: Number,
  keyTeamMembers: [String],
  advisors: [String],

  // Documents & Media
  pitchDeckUrl: String,
  businessPlanUrl: String,
  financialProjectionsUrl: String,
  videoUrl: String,
  images: [String],

  // Legal & Compliance
  registeredEntity: String,
  registrationNumber: String,
  taxId: String,

  // Additional Information
  previousFunding: String,
  existingInvestors: String,
  risks: String,
  exitStrategy: String,

  // Status
  status: {
    type: String,
    enum: ['active', 'funded', 'closed', 'cancelled'],
    default: 'active'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update funding percentage when currentFunding changes
investmentProjectSchema.pre('save', function(next) {
  if (this.fundingGoal > 0) {
    this.fundingPercentage = (this.currentFunding / this.fundingGoal) * 100;
    
    // Update status if fully funded
    if (this.fundingPercentage >= 100) {
      this.status = 'funded';
    }
  }
  
  this.totalInvestors = this.investors.length;
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('InvestmentProject', investmentProjectSchema);
