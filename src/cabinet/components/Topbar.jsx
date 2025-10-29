// src/cabinet/components/Topbar.jsx
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Topbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // ✅ 1. Navigate immediately to landing page to prevent route flicker
      navigate("/", { replace: true });

      // ✅ 2. Then perform logout asynchronously
      await logout();

      console.log("✅ User logged out and redirected to home.");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-bold text-green-400">Dashboard</h1>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition disabled:opacity-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
}

export default Topbar;
