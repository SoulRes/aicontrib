import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  // ✅ SIGN UP
  const signup = async (email, password) => {
    console.log("🚀 Starting signup with:", email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ User created:", userCredential.user);

      // ✅ Try sending verification email
      try {
        console.log("📧 Attempting to send verification email...");
        const result = await sendEmailVerification(userCredential.user, {
          url: window.location.origin + "/login", // redirect URL after verification
          handleCodeInApp: true,
        });
        console.log("✅ sendEmailVerification result:", result);
        console.log("📨 Verification email sent to:", userCredential.user.email);
      } catch (emailError) {
        console.error("🔥 Email verification failed:", emailError.code, emailError.message);
        throw new Error(
          "Failed to send verification email. Check Firebase settings or authorized domains."
        );
      }

      // ✅ Sign out the user until verified
      console.log("🔒 Signing out user until email is verified...");
      await signOut(auth);

      return userCredential;
    } catch (error) {
      console.error("🔥 Signup error:", error.code, error.message);
      let message = "Signup failed.";
      if (error.code === "auth/email-already-in-use") message = "This email is already registered.";
      if (error.code === "auth/invalid-email") message = "Please enter a valid email address.";
      if (error.code === "auth/weak-password") message = "Password must be at least 6 characters.";
      throw new Error(message);
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    console.log("🚀 Attempting login for:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login success:", userCredential.user);

      if (!userCredential.user.emailVerified) {
        console.warn("⚠️ Email not verified for:", userCredential.user.email);
        await signOut(auth);
        throw new Error("Please verify your email before logging in.");
      }

      return userCredential;
    } catch (error) {
      console.error("🔥 Login error:", error.code, error.message);
      let message = "Login failed.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password")
        message = "Incorrect email or password.";
      if (error.code === "auth/user-not-found") message = "Account not found.";
      throw new Error(message);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      console.log("👋 Logging out user...");
      await signOut(auth);
      console.log("✅ User signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error.code, error.message);
    }
  };

  return { signup, login, logout };
}
