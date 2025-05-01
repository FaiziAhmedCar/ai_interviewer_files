
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const app =! getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);