# AI for Her - Empowering Women Entrepreneurs with AI

A clean, modern web application built with React, Vite, and TailwindCSS, designed to support women entrepreneurs with AI-powered mentorship, funding opportunities, and business guidance.

## 🌟 Features

- **Landing Page**: Hero section with feature highlights and call-to-action
- **Dashboard**: Personalized hub with quick actions and progress tracking
- **Mentor Matching**: Smart algorithm to connect with experienced entrepreneurs
- **AI Chat Coach**: Interactive business coaching powered by AI
- **Opportunities**: Curated funding and growth opportunities
- **Growth Journey**: Visual timeline tracking entrepreneurial milestones

## 🎨 Design

- **Theme**: Clean white theme with soft lilac (#EDEBFF) and pink (#FDE2E4) accents
- **Typography**: Inter font for modern, readable text
- **UI Components**: Rounded cards, subtle shadows, and smooth animations
- **Layout**: Sidebar navigation with responsive design

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework with @tailwindcss/vite plugin
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── Navbar.jsx      # Top navigation bar
├── pages/              # Main application pages
│   ├── LandingPage.jsx # Hero and features
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Mentors.jsx     # Mentor matching
│   ├── Chat.jsx        # AI chat interface
│   ├── Opportunities.jsx # Funding opportunities
│   └── Journey.jsx     # Growth timeline
├── App.jsx             # Main app with routing
└── index.css           # Global styles and TailwindCSS
```

## 🎯 Key Pages

1. **Landing (/)** - Welcome page with hero section and feature overview
2. **Dashboard (/dashboard)** - Main hub with quick actions and stats
3. **Mentors (/mentors)** - Find and connect with mentors
4. **Chat (/chat)** - AI business coaching interface
5. **Opportunities (/opportunities)** - Browse funding and grants
6. **Journey (/journey)** - Track entrepreneurial progress

## 🎨 Customization

The app uses a custom TailwindCSS configuration with:
- Primary color: `#EDEBFF` (soft lilac)
- Accent color: `#FDE2E4` (soft pink)
- Inter font family for consistent typography

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)
