# Authentication System

## Overview
Role-based authentication system with Firebase for AI For Her platform.

## User Roles
- **Entrepreneur**: Build startups & connect with mentors and investors
- **Mentor**: Guide entrepreneurs & share expertise
- **Investor**: Discover opportunities & invest in promising startups

## Routes
- `/role-selection` - Choose your role (Entrepreneur, Mentor, or Investor)
- `/signup` - Create account with first name, last name, email, and password
- `/login` - Sign in to existing account
- `/dashboard` - Protected route (requires authentication)

## Features
- ✅ Firebase Authentication (Email/Password)
- ✅ Firestore database for user profiles
- ✅ Role-based user management
- ✅ Beautiful dark-themed UI with gradient effects
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## User Data Structure
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  role: 'entrepreneur' | 'mentor' | 'investor',
  createdAt: ISO timestamp
}
```

## Authentication Context
The `AuthContext` provides:
- `currentUser` - Current authenticated user
- `userRole` - User's role (entrepreneur/mentor/investor)
- `signup(email, password, firstName, lastName, role)` - Create new account
- `login(email, password)` - Sign in
- `logout()` - Sign out

## Usage Example
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { currentUser, userRole, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome {currentUser?.displayName}</p>
      <p>Role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Firebase Configuration
Firebase is configured in `/src/firebase/config.js` with:
- Authentication
- Firestore Database
- Project: aiforher

## Next Steps
To protect routes, create a PrivateRoute component:
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};
```

Then wrap protected routes:
```jsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```
