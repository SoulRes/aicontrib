// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
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

  /** 🟢 SIGN UP **/
  const signup = async (email, password) => {
    try {
      console.log("🚀 Signing up:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // ✅ Send verification email
      await sendEmailVerification(newUser, {
        url: `${window.location.origin}/`,
      });
      console.log("📨 Verification email sent to:", newUser.email);

      // ✅ Create Firestore document if not exists
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

      // ✅ Sign out until verified
      await signOut(auth);

      return {
        success: true,
        message:
          "✅ Verification email sent! Please check your inbox (or spam folder) and verify your email before logging in.",
      };
    } catch (error) {
      console.error("🔥 Signup error:", error.code, error.message);
      let message = "Signup failed.";
      if (error.code === "auth/email-already-in-use")
        message = "This email is already registered.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      if (error.code === "auth/weak-password")
        message = "Password must be at least 6 characters.";
      throw new Error(message);
    }
  };

  /** 🟡 LOGIN **/
  const login = async (email, password) => {
    try {
      console.log("🚀 Logging in:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      if (!currentUser.emailVerified) {
        console.warn("⚠️ Unverified email:", currentUser.email);
        await signOut(auth);
        throw new Error(
          "⚠️ Please verify your email before logging in. Check your inbox or spam folder."
        );
      }

      // ✅ Load Firestore profile
      const userRef = doc(db, "users", email);
      const snap = await getDoc(userRef);

      setUser({
        ...currentUser,
        profile: snap.exists() ? snap.data() : null,
      });

      return currentUser;
    } catch (error) {
      console.error("🔥 Login error:", error.code, error.message);
      let message = error.message || "Login failed.";
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")
        message = "Incorrect email or password.";
      if (error.code === "auth/user-not-found")
        message = "Account not found. Please sign up first.";
      if (error.message?.includes("verify your email"))
        message = "Please verify your email before logging in. Check your inbox or spam folder.";
      throw new Error(message);
    }
  };

  /** ✅ LOGOUT **/
  const logout = async () => {
    try {
      console.log("👋 Logging out user...");
      
      // 1️⃣ Immediately navigate before state resets
      window.location.replace("/"); // ✅ Hard redirect to landing page

      // 2️⃣ Then clear auth state
      await signOut(auth);
      setUser(null);
      
      console.log("✅ User signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /** ♻️ PERSIST USER SESSION **/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.emailVerified) {
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

    return unsubscribe;
  }, []);

  const value = {
    user,
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
