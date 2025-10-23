import { useState } from "react";
import AuthModal from "./AuthModal";

function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md text-gray-100 shadow-md z-[9999]">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo + App Icon */}
        <div className="flex items-center space-x-2">
          <img src="/photo/app_icon.png" alt="App Icon" className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-green-400">AIcontrib</h1>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 text-gray-300">
          <li>
            <a href="#home" className="hover:text-green-400 transition">
              Home
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-green-400 transition">
              About
            </a>
          </li>
          <li>
            <a href="#services" className="hover:text-green-400 transition">
              Services
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-green-400 transition">
              FAQ
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-green-400 transition">
              Contact
            </a>
          </li>
        </ul>

        {/* Auth Button */}
        <div className="ml-4">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition"
          >
            Login / Sign Up
          </button>
        </div>
      </nav>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="relative z-[10000]">
          <AuthModal onClose={() => setIsAuthOpen(false)} />
        </div>
      )}
    </header>
  );
}

export default Navbar;
