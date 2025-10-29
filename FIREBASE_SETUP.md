# Firebase Setup and Deployment Guide

## Issue Fixed
The authentication errors you were experiencing were caused by missing Firestore security rules. The 400 Bad Request errors occurred because Firebase was rejecting requests due to no security rules being configured.

## What Was Created

1. **firestore.rules** - Security rules for Firestore database
2. **firestore.indexes.json** - Database indexes for efficient queries
3. **firebase.json** - Firebase project configuration
4. **.firebaserc** - Firebase project alias configuration
5. **Updated config.js** - Added offline persistence and better error handling

## Security Rules Overview

The security rules now allow:
- ✅ Users can read/write their own data
- ✅ All authenticated users can read mentors and opportunities
- ✅ Only mentors/admins can create mentor profiles
- ✅ Users can manage their own chat messages and journey data
- ✅ Mentor-mentee sessions are accessible only to participants

## Deploy Firebase Rules

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Deploy Firestore Rules and Indexes**:
```bash
firebase deploy --only firestore
```

### Option 2: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aiforher**
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` and paste it there
5. Click **Publish**
6. Navigate to **Indexes** tab
7. Create indexes as specified in `firestore.indexes.json`

## Testing Authentication

After deploying the rules:

1. Clear your browser cache and local storage
2. Restart your development server:
```bash
npm run dev
```

3. Try to sign up/login again
4. The authentication should now work without 400 errors

## Common Issues and Solutions

### Issue: Still getting 400 errors
**Solution**: Make sure rules are deployed. Check Firebase Console → Firestore → Rules to verify they're active.

### Issue: Permission denied errors
**Solution**: Ensure the user is authenticated before accessing Firestore. Check that `currentUser` exists in your components.

### Issue: Offline persistence warnings
**Solution**: These are normal if you have multiple tabs open. The app will still work correctly.

## Project Structure

```
AI-For-Her/
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Database indexes
├── firebase.json            # Firebase configuration
├── .firebaserc              # Project alias
└── src/
    └── firebase/
        └── config.js        # Firebase initialization
```

## Next Steps

1. Deploy the rules using one of the methods above
2. Test authentication flow (signup/login)
3. Verify that you can access protected routes
4. Check that Firestore operations work correctly

## Important Notes

- The Firebase config contains your actual project credentials
- Security rules are now properly configured to protect your data
- Offline persistence is enabled for better user experience
- All authenticated users can access the platform features

## Support

If you continue to experience issues:
1. Check browser console for specific error messages
2. Verify Firebase project settings in console
3. Ensure billing is enabled if using Firebase features that require it
4. Check that your Firebase project has Authentication and Firestore enabled
