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
        setLoading(false);
        return;
      }

      if (isLogin) {
        await login(email, password);
        if (onSuccess) onSuccess();
        navigate("/cabinet");
      } else {
        await signup(email, password);
        setMessage(
          "✅ Verification email sent! Please check your inbox and verify your email before logging in."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-green-400 mb-4">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
      {message && <p className="text-green-400 text-sm mb-2 text-center">{message}</p>}

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

      {/* Confirm password */}
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

      {/* Submit */}
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

      {/* Switch */}
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
