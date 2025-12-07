# Database Schema Documentation

## Overview
This document describes the Firestore database schema for the AI For Her platform. The schema is designed with separate collections for different user types (Entrepreneurs, Mentors, and Investors) to provide role-specific functionality and optimized data structures.

## User Collections

### 1. Entrepreneurs Collection (`entrepreneurs/{userId}`)

**Purpose**: Stores data for users who are entrepreneurs looking for mentorship, funding, and networking opportunities.

**Fields**:
```javascript
{
  // Basic Profile Information
  firstName: string,              // User's first name
  lastName: string,               // User's last name
  email: string,                  // User's email address (primary)
  phone: string,                  // Primary phone number with country code
  alternatePhone: string,         // Alternate/WhatsApp number (optional)
  profilePhoto: string,           // Profile picture URL
  role: 'entrepreneur',           // User role (always 'entrepreneur')
  createdAt: string,             // ISO timestamp of account creation
  updatedAt: string,             // Last profile update timestamp
  profileCompleted: boolean,      // Whether profile setup is complete
  emailVerified: boolean,         // Whether email is verified
  
  // Address Information
  address: {
    street: string,               // Street address
    city: string,                 // City
    state: string,                // State/Province
    postalCode: string,           // ZIP/Postal code
    country: string               // Country
  },
  
  // Professional Information
  bio: string,                    // Professional biography/about me
  education: string,              // Educational background
  experience: string,             // Work experience summary
  skills: array<string>,          // Key skills (e.g., ['Marketing', 'Finance', 'Technology'])
  
  // Social Media Links
  socialMedia: {
    linkedIn: string,             // LinkedIn profile URL
    twitter: string,              // Twitter/X handle or URL
    facebook: string,             // Facebook profile URL
    instagram: string,            // Instagram handle or URL
    youtube: string,              // YouTube channel URL
    github: string,               // GitHub profile (for tech entrepreneurs)
    website: string               // Personal website/portfolio
  },
  
  // Entrepreneur-Specific Fields
  startups: array<string>,        // Array of startup IDs owned by this entrepreneur
  primaryIndustry: string,        // Primary industry/sector (e.g., 'Technology', 'Healthcare')
  secondaryIndustries: array<string>, // Additional industries of interest
  businessStage: string,          // Current business stage (e.g., 'idea', 'mvp', 'growth', 'scaling')
  lookingFor: array<string>,      // What they're seeking (e.g., ['funding', 'mentorship', 'networking', 'cofounder'])
  achievements: array<string>,    // Notable achievements or awards
  
  // Preferences
  preferredContactMethod: string, // 'email', 'phone', 'whatsapp', 'linkedIn'
  availableForNetworking: boolean, // Whether open to networking opportunities
  language: array<string>,        // Languages spoken (e.g., ['English', 'Hindi', 'Tamil'])
  timezone: string                // User's timezone (e.g., 'Asia/Kolkata')
}
```

**Related Collections**:
- `startups/{startupId}` - Startups created by this entrepreneur
- `connections/{connectionId}` - Mentor-mentee connections
- `sessions/{sessionId}` - Scheduled sessions with mentors
- `journeys/{userId}` - Personal progress tracking

**Example Document**:
```json
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya.sharma@example.com",
  "phone": "+91-9876543210",
  "alternatePhone": "+91-9876543211",
  "profilePhoto": "https://storage.googleapis.com/profiles/priya_sharma.jpg",
  "role": "entrepreneur",
  "createdAt": "2025-12-07T10:30:00Z",
  "updatedAt": "2025-12-07T15:45:00Z",
  "profileCompleted": true,
  "emailVerified": true,
  "address": {
    "street": "123 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "bio": "Passionate healthcare entrepreneur with 5 years of experience in telemedicine. Building accessible healthcare solutions for rural India.",
  "education": "MBA from IIM Ahmedabad, B.Tech from IIT Mumbai",
  "experience": "Ex-Product Manager at HealthCare Inc., Founded 2 startups",
  "skills": ["Product Management", "Healthcare", "Digital Marketing", "Fundraising"],
  "socialMedia": {
    "linkedIn": "https://linkedin.com/in/priyasharma",
    "twitter": "https://twitter.com/priyasharma",
    "facebook": "https://facebook.com/priya.sharma",
    "instagram": "@priyasharma_entrepreneur",
    "youtube": "",
    "github": "",
    "website": "https://priyasharma.com"
  },
  "startups": ["startup123", "startup456"],
  "primaryIndustry": "HealthTech",
  "secondaryIndustries": ["EdTech", "Social Impact"],
  "businessStage": "mvp",
  "lookingFor": ["funding", "mentorship", "strategic partnerships"],
  "achievements": [
    "Winner - Women Entrepreneur Award 2024",
    "Featured in Forbes 30 Under 30",
    "Raised $500K in seed funding"
  ],
  "preferredContactMethod": "email",
  "availableForNetworking": true,
  "language": ["English", "Hindi", "Marathi"],
  "timezone": "Asia/Kolkata"
}
```

---

### 2. Mentors Collection (`mentors/{userId}`)

**Purpose**: Stores data for users who provide mentorship and guidance to entrepreneurs.

**Fields**:
```javascript
{
  // Common Fields
  firstName: string,              // User's first name
  lastName: string,               // User's last name
  email: string,                  // User's email address
  role: 'mentor',                 // User role (always 'mentor')
  createdAt: string,             // ISO timestamp of account creation
  profileCompleted: boolean,      // Whether profile setup is complete
  emailVerified: boolean,         // Whether email is verified
  
  // Mentor-Specific Fields
  expertise: array<string>,       // Areas of expertise (e.g., ['Marketing', 'Product Development'])
  experience: string,             // Years of experience or description
  availability: boolean,          // Whether currently accepting new mentees
  rating: number,                 // Average rating (0-5)
  totalSessions: number,          // Total number of sessions conducted
  bio: string,                    // Professional biography
  linkedIn: string,               // LinkedIn profile URL
  specializations: array<string>, // Specific specializations or certifications
  
  // Optional Fields
  phone: string,                  // Contact phone number
  location: string,               // City/Country
  company: string,                // Current company
  title: string,                  // Current job title
  avatar: string,                 // Profile picture URL
  hourlyRate: number,             // Hourly rate (if applicable)
  languages: array<string>        // Languages spoken
}
```

**Related Collections**:
- `connections/{connectionId}` - Mentor-mentee connections
- `sessions/{sessionId}` - Scheduled mentoring sessions
- `ratings/{ratingId}` - Ratings received from mentees

**Example Document**:
```json
{
  "firstName": "Amit",
  "lastName": "Patel",
  "email": "amit@example.com",
  "role": "mentor",
  "createdAt": "2025-11-15T14:20:00Z",
  "profileCompleted": true,
  "emailVerified": true,
  "expertise": ["Business Strategy", "Product Management", "Fundraising"],
  "experience": "15+ years in startup ecosystem",
  "availability": true,
  "rating": 4.8,
  "totalSessions": 42,
  "bio": "Former startup founder turned mentor, passionate about helping women entrepreneurs",
  "linkedIn": "https://linkedin.com/in/amitpatel",
  "specializations": ["SaaS", "B2B", "Go-to-market"],
  "location": "Bangalore, India",
  "company": "TechVentures Inc",
  "title": "VP of Product"
}
```

---

### 3. Investors Collection (`investors/{userId}`)

**Purpose**: Stores data for users who invest in startups and businesses.

**Fields**:
```javascript
{
  // Common Fields
  firstName: string,              // User's first name
  lastName: string,               // User's last name
  email: string,                  // User's email address
  role: 'investor',               // User role (always 'investor')
  createdAt: string,             // ISO timestamp of account creation
  profileCompleted: boolean,      // Whether profile setup is complete
  emailVerified: boolean,         // Whether email is verified
  
  // Investor-Specific Fields
  investmentAreas: array<string>, // Industries of interest (e.g., ['FinTech', 'EdTech'])
  investmentRange: {              // Investment range
    min: number,                  // Minimum investment amount
    max: number                   // Maximum investment amount
  },
  portfolioCompanies: array<string>, // Array of startup IDs in portfolio
  investmentStage: array<string>, // Preferred stages (e.g., ['seed', 'series-a'])
  bio: string,                    // Professional biography
  firm: string,                   // Investment firm or organization
  
  // Optional Fields
  phone: string,                  // Contact phone number
  location: string,               // City/Country
  website: string,                // Firm or personal website
  linkedIn: string,               // LinkedIn profile URL
  avatar: string,                 // Profile picture URL
  investmentCount: number,        // Number of investments made
  successfulExits: number         // Number of successful exits
}
```

**Related Collections**:
- `startups/{startupId}` - Startups they've invested in or are interested in
- `savedProjects/{projectId}` - Saved startup projects

**Example Document**:
```json
{
**Fields**:
```javascript
{
  // Basic Startup Information
  userId: string,                 // Reference to entrepreneur who created it
  name: string,                   // Startup name
  tagline: string,                // One-line description/tagline
  description: string,            // Detailed description (what the startup does)
  logo: string,                   // Logo URL
  coverImage: string,             // Cover/banner image URL
  
  // Business Details
  industry: string,               // Primary industry/sector
  subIndustries: array<string>,   // Additional industries/categories
  stage: string,                  // Current stage (idea/prototype/mvp/revenue/growth/scaling)
  foundedDate: string,            // When the startup was founded
  registrationNumber: string,     // Business registration number (optional)
  businessType: string,           // 'Sole Proprietorship', 'Partnership', 'Private Limited', 'LLP', etc.
  
  // Problem & Solution
  problemStatement: string,       // Problem being solved
  solution: string,               // How the startup solves it
  targetMarket: string,           // Target customer/market description
  uniqueSellingPoint: string,     // What makes it unique (USP)
  
  // Funding Information
  fundingGoal: number,            // Target funding amount (in INR/USD)
  currentFunding: number,         // Amount raised so far
  fundingStage: string,           // 'bootstrapped', 'pre-seed', 'seed', 'series-a', etc.
  fundingHistory: array<object>, // Previous funding rounds
  revenueModel: string,           // How the startup makes money
  currentRevenue: number,         // Monthly/Annual revenue (optional)
  
  // Team Information
  team: array<{
    name: string,                 // Team member name
    role: string,                 // Position/role
    bio: string,                  // Brief bio
    photo: string,                // Profile photo URL
    linkedIn: string,             // LinkedIn profile
    email: string                 // Contact email
  }>,
  teamSize: number,               // Total number of employees
  
  // Product Information
  productStatus: string,          // 'concept', 'development', 'beta', 'launched'
  features: array<string>,        // Key features of the product/service
  technology: array<string>,      // Technologies used
  screenshots: array<string>,     // Product screenshots/images
  demoVideo: string,              // Demo video URL (YouTube, Vimeo, etc.)
  
  // Market & Traction
  customerBase: number,           // Number of customers/users
  marketSize: string,             // Total addressable market description
  competitors: array<string>,     // List of competitors
  competitiveAdvantage: string,   // What gives them an edge
  traction: {
    users: number,                // Total users
    revenue: number,              // Monthly/Annual revenue
    growth: string,               // Growth rate description
    partnerships: array<string>   // Strategic partnerships
  },
  
  // Documents & Links
  documents: array<{
    name: string,                 // Document name
    type: string,                 // 'pitch-deck', 'business-plan', 'financial-projection', etc.
    url: string,                  // Document URL
    uploadedAt: string            // Upload timestamp
  }>,
  website: string,                // Startup website
  socialMedia: {
    linkedIn: string,             // Company LinkedIn
    twitter: string,              // Twitter handle
    facebook: string,             // Facebook page
    instagram: string,            // Instagram handle
    youtube: string               // YouTube channel
  },
  
  // Contact Information
  email: string,                  // Startup contact email
  phone: string,                  // Contact phone number
  address: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  
  // Metadata
  visibility: string,             // 'public', 'private', 'investors-only'
  lookingFor: array<string>,      // ['funding', 'mentorship', 'partnerships', 'talent']
  featured: boolean,              // Whether featured on platform
  verified: boolean,              // Whether verified by platform
  status: string,                 // 'active', 'paused', 'closed'
  createdAt: string,             // Creation timestamp
  updatedAt: string,             // Last update timestamp
  views: number,                  // Number of profile views
  savedBy: array<string>          // Array of user IDs who saved this startup
}
```

**Example Document**:
```json
{
  "userId": "entrepreneur_user_123",
  "name": "HealthConnect",
  "tagline": "Making healthcare accessible for rural India",
  "description": "HealthConnect is a telemedicine platform that connects rural patients with qualified doctors through video consultations, enabling quality healthcare access in remote areas. Our platform includes prescription management, health records, and AI-powered symptom analysis.",
  "logo": "https://storage.googleapis.com/startups/healthconnect_logo.png",
  "coverImage": "https://storage.googleapis.com/startups/healthconnect_cover.jpg",
  "industry": "HealthTech",
  "subIndustries": ["Telemedicine", "AI", "Rural Healthcare"],
  "stage": "mvp",
  "foundedDate": "2024-06-15",
  "registrationNumber": "U74999MH2024PTC123456",
  "businessType": "Private Limited",
  "problemStatement": "Over 65% of India's population lives in rural areas with limited access to quality healthcare. Travel time, costs, and lack of nearby specialists make healthcare inaccessible.",
  "solution": "A mobile-first telemedicine platform with offline capabilities, vernacular language support, and affordable consultation fees. We partner with local health workers for last-mile connectivity.",
  "targetMarket": "Rural population in Tier 2 and Tier 3 cities across India, focusing on 500+ districts with limited healthcare infrastructure",
  "uniqueSellingPoint": "First telemedicine platform with offline consultation booking, AI-powered vernacular health assistant, and integration with local health workers",
  "fundingGoal": 5000000,
  "currentFunding": 500000,
  "fundingStage": "seed",
  "fundingHistory": [
    {
      "round": "Pre-seed",
      "amount": 500000,
      "date": "2024-10-15",
      "investors": ["Angel Investor Network", "Women Entrepreneurs Fund"]
    }
  ],
  "revenueModel": "Commission per consultation (15%), subscription plans for premium features, B2B partnerships with NGOs and government programs",
  "currentRevenue": 50000,
  "team": [
    {
      "name": "Priya Sharma",
      "role": "Founder & CEO",
      "bio": "Ex-Product Manager at HealthCare Inc., IIM Ahmedabad",
      "photo": "https://storage.googleapis.com/team/priya.jpg",
      "linkedIn": "https://linkedin.com/in/priyasharma",
      "email": "priya@healthconnect.com"
    },
    {
      "name": "Dr. Rajesh Kumar",
      "role": "Chief Medical Officer",
      "bio": "MBBS, MD with 15 years experience in rural healthcare",
      "photo": "https://storage.googleapis.com/team/rajesh.jpg",
      "linkedIn": "https://linkedin.com/in/drrajesh",
      "email": "rajesh@healthconnect.com"
    },
    {
      "name": "Ananya Tech",
      "role": "CTO",
      "bio": "Full-stack developer with expertise in mobile apps and AI",
      "photo": "https://storage.googleapis.com/team/ananya.jpg",
      "linkedIn": "https://linkedin.com/in/ananyatech",
      "email": "ananya@healthconnect.com"
    }
  ],
  "teamSize": 12,
  "productStatus": "launched",
  "features": [
    "Video consultations with doctors",
    "AI-powered symptom checker",
    "Digital prescription management",
    "Health records storage",
    "Offline consultation booking",
    "Multi-language support (10 Indian languages)",
    "Medicine delivery integration",
    "Health insurance claim assistance"
  ],
  "technology": ["React Native", "Node.js", "MongoDB", "AWS", "TensorFlow", "WebRTC"],
  "screenshots": [
    "https://storage.googleapis.com/startup/screen1.jpg",
    "https://storage.googleapis.com/startup/screen2.jpg",
    "https://storage.googleapis.com/startup/screen3.jpg"
  ],
  "demoVideo": "https://youtube.com/watch?v=demo123",
  "customerBase": 5000,
  "marketSize": "India's telemedicine market is projected to reach $5.5 billion by 2025, with rural healthcare being a $10 billion opportunity",
  "competitors": ["Practo", "1mg", "DocsApp", "mfine"],
  "competitiveAdvantage": "Only platform with offline capabilities and deep rural penetration through local health worker network",
  "traction": {
    "users": 5000,
    "revenue": 50000,
    "growth": "40% month-over-month user growth",
    "partnerships": [
      "Partnership with 3 NGOs covering 50 villages",
      "Pilot program with State Health Department",
      "Tie-up with 100+ local health workers"
    ]
  },
  "documents": [
    {
      "name": "Pitch Deck",
      "type": "pitch-deck",
      "url": "https://storage.googleapis.com/docs/healthconnect_pitch.pdf",
      "uploadedAt": "2025-11-20T10:00:00Z"
    },
    {
      "name": "Business Plan",
      "type": "business-plan",
      "url": "https://storage.googleapis.com/docs/healthconnect_bp.pdf",
      "uploadedAt": "2025-11-21T14:30:00Z"
    },
    {
      "name": "Financial Projections",
      "type": "financial-projection",
      "url": "https://storage.googleapis.com/docs/healthconnect_finance.xlsx",
      "uploadedAt": "2025-11-22T09:15:00Z"
    }
  ],
  "website": "https://healthconnect.in",
  "socialMedia": {
    "linkedIn": "https://linkedin.com/company/healthconnect",
    "twitter": "https://twitter.com/healthconnect_in",
    "facebook": "https://facebook.com/healthconnect",
    "instagram": "@healthconnect.in",
    "youtube": "https://youtube.com/c/healthconnect"
  },
  "email": "contact@healthconnect.com",
  "phone": "+91-9876543210",
  "address": {
    "street": "456 Tech Park, Bandra West",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400050",
    "country": "India"
  },
  "visibility": "public",
  "lookingFor": ["funding", "mentorship", "strategic partnerships"],
  "featured": true,
  "verified": true,
  "status": "active",
  "createdAt": "2024-06-15T12:00:00Z",
  "updatedAt": "2025-12-07T16:30:00Z",
  "views": 1250,
  "savedBy": ["investor123", "investor456", "mentor789"]
}
```

---

## Shared Collections

### 5. Connections Collection (`connections/{connectionId}`)

**Purpose**: Manages mentor-mentee relationships.

**Fields**:
```javascript
{
  mentorId: string,               // Reference to mentor userId
  menteeId: string,               // Reference to entrepreneur userId
  status: string,                 // 'pending', 'active', 'completed', 'rejected'
  createdAt: string,             // Connection request timestamp
  acceptedAt: string,            // When connection was accepted (optional)
  notes: string                   // Optional notes
}
```

---

### 6. Sessions Collection (`sessions/{sessionId}`)

**Purpose**: Stores scheduled mentoring sessions.

**Fields**:
```javascript
{
  mentorId: string,               // Reference to mentor userId
  menteeId: string,               // Reference to entrepreneur userId
  scheduledAt: string,            // Scheduled date/time
  duration: number,               // Duration in minutes
  status: string,                 // 'scheduled', 'completed', 'cancelled'
  topic: string,                  // Session topic
  notes: string,                  // Session notes
  meetingLink: string,            // Video call link (optional)
  createdAt: string              // Creation timestamp
}
```

---

### 7. Opportunities Collection (`opportunities/{opportunityId}`)

**Purpose**: Stores opportunities like grants, competitions, accelerators.

**Fields**:
```javascript
{
  title: string,                  // Opportunity title
  description: string,            // Detailed description
  category: string,               // 'grant', 'competition', 'accelerator'
  deadline: string,               // Application deadline
  amount: number,                 // Prize/grant amount (optional)
  eligibility: string,            // Eligibility criteria
  link: string,                   // Application link
  createdAt: string              // Creation timestamp
}
```

---

### 8. Self-Help Groups Collection (`shg/{groupId}`)

**Purpose**: Manages self-help groups for entrepreneurs.

**Fields**:
```javascript
{
  name: string,                   // Group name
  description: string,            // Group description
  createdBy: string,              // Reference to creator userId
  members: array<string>,         // Array of member userIds
  category: string,               // Group category/focus
  meetingSchedule: string,        // Meeting frequency
  createdAt: string,             // Creation timestamp
  maxMembers: number              // Maximum group size
}
```

---

### 9. Notifications Collection (`notifications/{notificationId}`)

**Purpose**: Stores user notifications.

**Fields**:
```javascript
{
  userId: string,                 // Reference to user
  type: string,                   // Notification type
  title: string,                  // Notification title
  message: string,                // Notification message
  read: boolean,                  // Read status
  link: string,                   // Optional link
  createdAt: string              // Creation timestamp
}
```

---

### 10. Chats Collection (`chats/{chatId}`)

**Purpose**: Stores chat conversations with subcollection for messages.

**Fields**:
```javascript
{
  participants: array<string>,    // Array of participant userIds
  lastMessage: string,            // Last message preview
  lastMessageAt: string,          // Last message timestamp
  createdAt: string              // Chat creation timestamp
}
```

**Subcollection**: `messages/{messageId}`
```javascript
{
  senderId: string,               // Reference to sender userId
  content: string,                // Message content
  type: string,                   // 'text', 'image', 'file'
  createdAt: string              // Message timestamp
}
```

---

## Migration Guide

### From Old Schema to New Schema

If you have existing data in a `users` collection, you need to migrate it to the new role-specific collections:

1. **Backup your data** before starting migration
2. **For each user document**:
   - Read the `role` field
   - Copy the document to the appropriate collection (`entrepreneurs`, `mentors`, or `investors`)
   - Add role-specific fields with default values
   - Optionally delete the old document from `users` collection

**Example Migration Script**:
```javascript
// This is a conceptual example - adjust for your needs
const migrateUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const userId = userDoc.id;
    const role = userData.role;
    
    if (role === 'entrepreneur') {
      await setDoc(doc(db, 'entrepreneurs', userId), {
        ...userData,
        startups: [],
        industry: '',
        stage: '',
        lookingFor: [],
        bio: ''
      });
    } else if (role === 'mentor') {
      await setDoc(doc(db, 'mentors', userId), {
        ...userData,
        expertise: [],
        experience: '',
        availability: true,
        rating: 0,
        totalSessions: 0,
        bio: '',
        linkedIn: '',
        specializations: []
      });
    } else if (role === 'investor') {
      await setDoc(doc(db, 'investors', userId), {
        ...userData,
        investmentAreas: [],
        investmentRange: { min: 0, max: 0 },
        portfolioCompanies: [],
        investmentStage: [],
        bio: '',
        firm: ''
      });
    }
  }
};
```

---

## Security Rules Summary

The Firestore security rules enforce the following:

1. **Authentication Required**: All operations require user authentication
2. **User Ownership**: Users can only read/write their own documents in role-specific collections
3. **Cross-Role Reading**: All authenticated users can read documents from any role collection (for browsing mentors, investors, etc.)
4. **Collection-Specific Write Rules**: Only the document owner can update/delete their own profile
5. **Shared Collections**: Access controlled based on document fields (e.g., mentorId, menteeId for sessions)

---

## Best Practices

1. **Always validate role** before accessing role-specific data
2. **Use indexes** for frequently queried fields (already configured in `firestore.indexes.json`)
3. **Keep sensitive data private** - don't expose personal information unnecessarily
4. **Paginate large queries** to avoid excessive reads
5. **Cache user role** in local state to minimize Firestore reads
6. **Update timestamps** whenever documents are modified
7. **Maintain referential integrity** - clean up related documents when deleting users

---

## Indexes

The following composite indexes are configured in `firestore.indexes.json`:

- **Entrepreneurs**: By `createdAt` (descending)
- **Mentors**: By `createdAt` (descending), by `expertise` and `rating`
- **Investors**: By `createdAt` (descending), by `investmentAreas` and `investmentRange.min`
- **Sessions**: By `mentorId`/`menteeId` and `scheduledAt`
- **Connections**: By `mentorId`/`menteeId` and `status`
- **Notifications**: By `userId` and `createdAt`

---

## Version History

- **v2.0** (December 2025): Separated user schema into role-specific collections (entrepreneurs, mentors, investors)
- **v1.0** (Initial): Single `users` collection with role field

---

For questions or issues with the schema, please consult the development team or refer to the Firebase Firestore documentation.
