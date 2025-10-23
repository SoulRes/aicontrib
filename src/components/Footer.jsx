function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-8 mt-20 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <img src="/photo/app_icon.png" alt="App Icon" className="w-6 h-6" />
          <span className="text-lg font-semibold text-gray-200">AIcontrib</span>
        </div>

        {/* Center - Nav Links */}
        <ul className="flex space-x-6 mb-4 md:mb-0">
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
            <a href="#contact" className="hover:text-green-400 transition">
              Contact
            </a>
          </li>
        </ul>

        {/* Right - Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} AIcontrib. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
