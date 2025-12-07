// Script to update existing mentors with new schema fields
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://women:women@cluster0.a770erh.mongodb.net/ai_for_her?retryWrites=true&w=majority&appName=Cluster0";

const mentorSchema = new mongoose.Schema({}, { strict: false });
const Mentor = mongoose.model('Mentor', mentorSchema);

async function updateMentors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all mentors
    const mentors = await Mentor.find({});
    console.log(`Found ${mentors.length} mentors to update`);

    for (const mentor of mentors) {
      const updates = {};

      // Add name field if missing
      if (!mentor.name && (mentor.firstName || mentor.lastName)) {
        updates.name = `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim();
      }

      // Add location if missing
      if (!mentor.location) {
        updates.location = {
          city: mentor.address?.city || '',
          state: mentor.address?.state || '',
          country: 'India'
        };
      }

      // Add languages if missing
      if (!mentor.languages || mentor.languages.length === 0) {
        updates.languages = ['English', 'Hindi'];
      }

      // Convert expertise to string if it's an array
      if (Array.isArray(mentor.expertise)) {
        updates.expertise = mentor.expertise.join(', ');
        updates.expertiseAreas = mentor.expertise;
      } else if (typeof mentor.expertise === 'string' && !mentor.expertiseAreas) {
        updates.expertiseAreas = [mentor.expertise];
      }

      // Add experience level based on years
      if (mentor.yearsOfExperience && !mentor.experienceLevel) {
        const years = mentor.yearsOfExperience;
        if (years <= 2) updates.experienceLevel = 'Beginner (0-2 years)';
        else if (years <= 5) updates.experienceLevel = 'Intermediate (3-5 years)';
        else if (years <= 10) updates.experienceLevel = 'Expert (6-10 years)';
        else updates.experienceLevel = 'Master (10+ years)';
      }

      // Add default values for new fields
      if (mentor.totalReviews === undefined) updates.totalReviews = 0;
      if (mentor.successStories === undefined) updates.successStories = 0;
      if (!mentor.responseTime) updates.responseTime = 'Within 48 hours';
      if (!mentor.availableDays) updates.availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!mentor.availableTimeSlots) updates.availableTimeSlots = ['Morning', 'Afternoon', 'Evening'];

      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await Mentor.updateOne({ _id: mentor._id }, { $set: updates });
        console.log(`✅ Updated mentor: ${mentor.name || mentor.email}`);
      }
    }

    console.log('\n✅ All mentors updated successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMentors();
