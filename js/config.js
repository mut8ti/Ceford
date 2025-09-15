// Firebase configuration using environment variables
// Note: For static HTML sites, we need to reference the actual values
const firebaseConfig = {
  apiKey: "AIzaSyB__VrarOe_CFfI7hKL5jFsEni1Lh3Lnqs",
  authDomain: "cefored-institute.firebaseapp.com",
  projectId: "cefored-institute",
  storageBucket: "cefored-institute.firebasestorage.app",
  messagingSenderId: "460320160628",
  appId: "1:460320160628:web:614f9decdecbdfb50a4a21",
  measurementId: "G-HMTSZWL569"
};

// Validate Firebase configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('Missing Firebase configuration fields:', missingFields);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
}

console.log('Firebase configuration loaded successfully for project:', firebaseConfig.projectId);

export default firebaseConfig;
