// Debug utility for Firebase authentication and storage
import { auth, db, storage } from './config';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, listAll } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

export const debugFirebaseAuth = () => {
  console.log('=== Firebase Debug Info ===');
  
  // Check auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('✅ User is authenticated:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      });
      
      // Check if user document exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          console.log('✅ User document exists in Firestore:', userDoc.data());
        } else {
          console.log('⚠️ User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('❌ Error fetching user document:', error);
      }
      
      // Test Storage access
      try {
        const storageRef = ref(storage, `profileImages/${user.uid}/`);
        const result = await listAll(storageRef);
        console.log('✅ Storage access successful, files:', result.items.length);
      } catch (error) {
        console.error('❌ Storage access error:', error);
      }
    } else {
      console.log('❌ No user is authenticated');
    }
  });
  
  // Check Firebase config
  console.log('Firebase Config:', {
    authDomain: auth.app.options.authDomain,
    projectId: auth.app.options.projectId,
    storageBucket: auth.app.options.storageBucket
  });
};

// Call this function in your component or page to debug
// Example: debugFirebaseAuth();