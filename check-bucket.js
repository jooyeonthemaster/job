// Script to check actual Firebase Storage bucket configuration
// Run with: node check-bucket.js

const https = require('https');

// Firebase project info from your .env
const projectId = 'jobmatching-9fed0';
const possibleBuckets = [
  `${projectId}.appspot.com`,
  `${projectId}.firebasestorage.app`
];

console.log('\\n=== Firebase Storage Bucket Check ===\\n');
console.log('Project ID:', projectId);
console.log('\\nChecking possible bucket names:\\n');

// Test each possible bucket
possibleBuckets.forEach(bucket => {
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o`;
  
  https.get(url, (res) => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`✅ ${bucket} - EXISTS (Status: ${res.statusCode} - Authentication required)`);
    } else if (res.statusCode === 404) {
      console.log(`❌ ${bucket} - NOT FOUND (Status: 404)`);
    } else {
      console.log(`⚠️  ${bucket} - Status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`❌ ${bucket} - Error: ${err.message}`);
  });
});

console.log('\\n=== Current .env.local Configuration ===\\n');
console.log('STORAGE_BUCKET in .env:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jobmatching-9fed0.firebasestorage.app');
console.log('\\nNote: If the bucket exists but returns 401/403, it means the bucket is configured but needs proper CORS settings.');