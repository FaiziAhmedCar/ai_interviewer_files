import { cert, getApps, initializeApp } from "firebase-admin/app";
const initFirebaseAdmin = () => {
  const apps = getApps();
  if (!apps.length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        
        })
    });
  }
};
