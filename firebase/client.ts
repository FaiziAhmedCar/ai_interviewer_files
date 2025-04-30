// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBn2ZuBDs7FkFtt-ePHfgnbaQsi_yQGeRI",
  authDomain: "paradox-611998.firebaseapp.com",
  projectId: "paradox-611998",
  storageBucket: "paradox-611998.firebasestorage.app",
  messagingSenderId: "26483642266",
  appId: "1:26483642266:web:8cbc1f0699a450e8353423",
  measurementId: "G-2ZEXJFPFYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);