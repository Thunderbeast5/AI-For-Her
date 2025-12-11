import Mentor from '../models/Mentor.js';
import Entrepreneur from '../models/Entrepreneur.js';

const calculateMatchScore = (entrepreneur, mentor) => {
  let score = 0;
  const weights = {
    primaryIndustry: 30,
    secondaryIndustries: 20,
    businessStage: 15,
    skills: 15,
    language: 10,
    location: 5,
    rating: 5,
  };

  // Primary Industry/Sector Match
  if (entrepreneur.primaryIndustry && mentor.sector && entrepreneur.primaryIndustry.toLowerCase() === mentor.sector.toLowerCase()) {
    score += weights.primaryIndustry;
  }

  // Secondary Industries/Expertise Areas Match
  if (entrepreneur.secondaryIndustries && mentor.expertiseAreas) {
    const commonIndustries = entrepreneur.secondaryIndustries.filter(ind => 
      mentor.expertiseAreas.some(exp => exp.toLowerCase().includes(ind.toLowerCase()))
    );
    score += commonIndustries.length * (weights.secondaryIndustries / mentor.expertiseAreas.length || 1);
  }

  // Business Stage Match
  if (entrepreneur.businessStage && mentor.experience) {
    if (mentor.experience.toLowerCase().includes(entrepreneur.businessStage.toLowerCase())) {
      score += weights.businessStage;
    }
  }

  // Skills/Specializations Match
  if (entrepreneur.skills && mentor.specializations) {
    const commonSkills = entrepreneur.skills.filter(skill => 
      mentor.specializations.some(spec => spec.toLowerCase().includes(skill.toLowerCase()))
    );
    score += commonSkills.length * (weights.skills / mentor.specializations.length || 1);
  }

  // Language Match
  if (entrepreneur.language && mentor.languages) {
    const commonLanguages = entrepreneur.language.filter(lang => mentor.languages.includes(lang));
    if (commonLanguages.length > 0) {
      score += weights.language;
    }
  }

  // Location Match
  if (entrepreneur.address && mentor.location && entrepreneur.address.city.toLowerCase() === mentor.location.city.toLowerCase()) {
    score += weights.location;
  }

  // Mentor Rating
  if (mentor.rating) {
    score += (mentor.rating / 5) * weights.rating;
  }

  return Math.min(100, Math.round(score)); // Cap score at 100
};

export const findMatches = async (entrepreneurId) => {
  const entrepreneur = await Entrepreneur.findOne({ userId: entrepreneurId });
  if (!entrepreneur) {
    throw new Error('Entrepreneur not found');
  }

  const mentors = await Mentor.find({ availability: true });

  const matches = mentors.map(mentor => ({
    mentor,
    score: calculateMatchScore(entrepreneur, mentor),
  }));

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
};
