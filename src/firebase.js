// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDj2fDwpstFATN1GqzKdEvNqSe3u8EnNNM",
  authDomain: "aicontribution.firebaseapp.com",
  databaseURL: "https://aicontribution-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aicontribution",
  storageBucket: "aicontribution.appspot.com",
  messagingSenderId: "847220817804",
  appId: "1:847220817804:web:85e0307421f1ad87e4e0a9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;