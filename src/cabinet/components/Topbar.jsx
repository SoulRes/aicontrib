// src/cabinet/components/Topbar.jsx
import { getAuth, signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // ✅ Firebase logout
      console.log("✅ User logged out successfully.");

      // ✅ Redirect to landing page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("🔥 Logout error:", error);
      alert("Logout failed, please try again.");
    }
  };

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-bold text-green-400">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </button>
    </header>
  );
}

export default Topbar;
