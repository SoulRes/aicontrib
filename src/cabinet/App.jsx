// src/cabinet/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Account from "./pages/Account";
import Buy from "./pages/Buy";
import Download from "./pages/Download";
import Exchange from "./pages/Exchange";
import Send from "./pages/Send";
import Support from "./pages/Support";
import "./styles.css";

function CabinetApp() {
  return (
    <div className="flex">
      {/* Sidebar (fixed) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 ml-64 min-h-screen bg-[#0a0a0a]">
        <Topbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="account" replace />} />
            <Route path="account" element={<Account />} />
            <Route path="buy" element={<Buy />} />
            <Route path="download" element={<Download />} />
            <Route path="exchange" element={<Exchange />} />
            <Route path="send" element={<Send />} />
            <Route path="support" element={<Support />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default CabinetApp;
