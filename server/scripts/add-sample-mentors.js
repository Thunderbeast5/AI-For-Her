// Test script to add sample mentors with personal/group types
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://women:women@cluster0.a770erh.mongodb.net/ai_for_her?retryWrites=true&w=majority&appName=Cluster0";

const mentorSchema = new mongoose.Schema({
  userId: String,
  firstName: String,
  lastName: String,
  name: String,
  email: String,
  password: String,
  sector: String,
  expertise: String,
  bio: String,
  yearsOfExperience: Number,
  mentorType: {
    type: String,
    enum: ['personal', 'group', 'both'],
    default: 'both'
  },
  personalSessionPrice: Number,
  groupSessionPrice: Number,
  groupSessionCapacity: Number,
  totalConnections: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Mentor = mongoose.model('Mentor', mentorSchema);

const sampleMentors = [
  {
    userId: 'MENTOR001',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Food Processing',
    expertise: 'Organic food products, packaging, and distribution',
    bio: 'Helped 50+ women entrepreneurs start successful food processing businesses. Specialized in organic products, quality control, and market access.',
    yearsOfExperience: 12,
    mentorType: 'both',
    personalSessionPrice: 2000,
    groupSessionPrice: 0,
    groupSessionCapacity: 15
  },
  {
    userId: 'MENTOR002',
    firstName: 'Anjali',
    lastName: 'Desai',
    name: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Handicrafts',
    expertise: 'Traditional crafts, e-commerce, export markets',
    bio: 'Award-winning artisan with expertise in scaling handicraft businesses. Focus on helping women artisans reach national and international markets.',
    yearsOfExperience: 15,
    mentorType: 'personal',
    personalSessionPrice: 3000,
    groupSessionPrice: 0,
    groupSessionCapacity: 0
  },
  {
    userId: 'MENTOR003',
    firstName: 'Meera',
    lastName: 'Kapoor',
    name: 'Meera Kapoor',
    email: 'meera.kapoor@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Beauty & Personal Care',
    expertise: 'Natural cosmetics, salon management, brand building',
    bio: 'Beauty entrepreneur who built a chain of 20 salons. Now helping women start beauty businesses with sustainable and natural products.',
    yearsOfExperience: 10,
    mentorType: 'both',
    personalSessionPrice: 2500,
    groupSessionPrice: 0,
    groupSessionCapacity: 20
  },
  {
    userId: 'MENTOR004',
    firstName: 'Sneha',
    lastName: 'Reddy',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Tailoring & Garments',
    expertise: 'Custom tailoring, fashion design, boutique management',
    bio: 'Fashion designer with focus on empowering women tailors. Expert in setting up boutiques and managing custom orders.',
    yearsOfExperience: 8,
    mentorType: 'group',
    personalSessionPrice: 0,
    groupSessionPrice: 0,
    groupSessionCapacity: 25
  },
  {
    userId: 'MENTOR005',
    firstName: 'Dr. Kavita',
    lastName: 'Patel',
    name: 'Dr. Kavita Patel',
    email: 'kavita.patel@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Health & Wellness',
    expertise: 'Yoga centers, nutrition counseling, wellness coaching',
    bio: 'Healthcare professional turned wellness entrepreneur. Specialized in helping women start health and wellness businesses.',
    yearsOfExperience: 18,
    mentorType: 'both',
    personalSessionPrice: 3500,
    groupSessionPrice: 0,
    groupSessionCapacity: 12
  },
  {
    userId: 'MENTOR006',
    firstName: 'Rani',
    lastName: 'Verma',
    name: 'Rani Verma',
    email: 'rani.verma@example.com',
    password: '$2b$10$hashedPasswordExample',
    sector: 'Home Decor',
    expertise: 'Interior design, home accessories, online selling',
    bio: 'Interior designer helping women create profitable home decor businesses. Focus on sustainable and handmade products.',
    yearsOfExperience: 9,
    mentorType: 'personal',
    personalSessionPrice: 2200,
    groupSessionPrice: 0,
    groupSessionCapacity: 0
  }
];

async function addMentors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing mentors (optional)
    // await Mentor.deleteMany({});
    // console.log('Cleared existing mentors');

    // Add sample mentors
    const result = await Mentor.insertMany(sampleMentors);
    console.log(`✅ Added ${result.length} sample mentors`);

    console.log('\nSample Mentors:');
    result.forEach(mentor => {
      console.log(`- ${mentor.name} (${mentor.mentorType}) - ${mentor.sector}`);
      if (mentor.mentorType === 'personal' || mentor.mentorType === 'both') {
        console.log(`  Personal: ₹${mentor.personalSessionPrice}`);
      }
      if (mentor.mentorType === 'group' || mentor.mentorType === 'both') {
        console.log(`  Group: Free (Capacity: ${mentor.groupSessionCapacity})`);
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMentors();
