import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function AuthForm({ onSuccess }) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (isLogin) {
        await login(email, password);
        if (onSuccess) onSuccess();
        navigate("/cabinet");
      } else {
        await signup(email, password);
        setMessage(
          "✅ Verification email sent! Please check your inbox (and spam folder) before logging in."
        );
      }
    } catch (err) {
      console.error("🔥 Auth error:", err);

      // Extract better error message
      const rawMsg = err.message || "";
      let msg = "Login failed.";

      if (
        rawMsg.includes("verify your email") ||
        rawMsg.includes("not verified") ||
        rawMsg.includes("Please verify")
      ) {
        msg =
          "⚠️ Please verify your email before logging in. Check your inbox or spam folder.";
      } else if (rawMsg.includes("already registered")) {
        msg = "This email is already registered. Try logging in instead.";
      } else if (rawMsg.includes("password")) {
        msg = "Incorrect email or password.";
      } else if (rawMsg.includes("not found")) {
        msg = "No account found with this email.";
      } else if (rawMsg.includes("too-many-requests")) {
        msg = "Too many attempts. Please wait a moment before retrying.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-green-400 mb-4">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 p-2 rounded-md">
          {error}
        </p>
      )}
      {message && (
        <p className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/30 p-2 rounded-md">
          {message}
        </p>
      )}

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Password field */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-green-400"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Confirm password (only for Sign Up) */}
      {!isLogin && (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-green-500 hover:bg-green-600 text-black rounded-md font-semibold transition disabled:opacity-60"
      >
        {loading
          ? isLogin
            ? "Logging in..."
            : "Creating account..."
          : isLogin
          ? "Login"
          : "Sign Up"}
      </button>

      {/* Switch form */}
      <p
        className="mt-4 text-sm text-gray-400 cursor-pointer hover:text-green-400 text-center"
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setMessage("");
        }}
      >
        {isLogin
          ? "Don’t have an account? Sign Up"
          : "Already have an account? Login"}
      </p>
    </form>
  );
}

export default AuthForm;
