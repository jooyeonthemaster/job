# Firebase Storage CORS Configuration Fix

## Problem
Firebase Storage CORS error preventing profile image uploads during onboarding.

## Solution Steps

### 1. Install Google Cloud SDK
If you haven't already, install the Google Cloud SDK:
- Download from: https://cloud.google.com/sdk/docs/install

### 2. Authenticate with Firebase
```bash
gcloud auth login
```

### 3. Apply CORS Configuration
Replace `YOUR_PROJECT_ID` with your actual Firebase project ID:

```bash
gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
```

Example:
```bash
gsutil cors set cors.json gs://jobmatch-12345.appspot.com
```

### 4. Verify CORS Settings
```bash
gsutil cors get gs://YOUR_PROJECT_ID.appspot.com
```

## Alternative: Firebase Storage Rules
If CORS issues persist, update your Firebase Storage rules in the Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profileImages/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## What Changed in the Code

1. **cors.json** - Created CORS configuration file allowing localhost and production domains
2. **userActions.ts** - Added error handling for image uploads, allowing profile creation to continue even if image upload fails
3. **onboarding/job-seeker/page.tsx** - Improved error handling and user feedback during profile creation

## Testing
1. Try completing the onboarding process again
2. Profile should be created even if image upload fails
3. Check browser console for any remaining errors