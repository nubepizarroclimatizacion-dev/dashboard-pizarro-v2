
// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// A valid, dummy Firebase configuration to allow the app to initialize.
// In a real production environment, these should be replaced with your actual
// Firebase project's configuration keys.
const DUMMY_API_KEY = "AIzaSyA_dummy_api_key_for_testing";

const firebaseConfig = {
  apiKey: DUMMY_API_KEY,
  authDomain: "pizarro-dashboard-mock.firebaseapp.com",
  projectId: "pizarro-dashboard-mock",
  storageBucket: "pizarro-dashboard-mock.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1",
  measurementId: "G-ABCDEFGHIJ"
};

// Export a flag to indicate if we are running in mock mode
export const useMockAuth = firebaseConfig.apiKey === DUMMY_API_KEY;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
