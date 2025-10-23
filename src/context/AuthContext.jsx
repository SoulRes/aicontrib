// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase"; // ensure firebase.js exports both auth and db
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Signup ---
  const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Create Firestore user document if it doesn't exist
    const userRef = doc(db, "users", email);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email,
        createdAt: new Date(),
        referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        referralCount: 0,
        referredBy: null,
        status: "Not Activated",
        tmc: 0,
        totalTMC: 0,
        usdt: 0,
      });
    }

    setUser({ ...result.user, profile: (await getDoc(userRef)).data() });
    return result.user;
  };

  // --- Login ---
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Load Firestore profile
    const userRef = doc(db, "users", email);
    const snap = await getDoc(userRef);

    setUser({
      ...result.user,
      profile: snap.exists() ? snap.data() : null,
    });

    return result.user;
  };

  // --- Logout ---
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // --- Persist user session ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔄 Auth state changed:", firebaseUser);

      if (firebaseUser?.email) {
        const userRef = doc(db, "users", firebaseUser.email);
        const snap = await getDoc(userRef);

        setUser({
          ...firebaseUser,
          profile: snap.exists() ? snap.data() : null,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user, // includes Firebase auth user + Firestore profile
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
