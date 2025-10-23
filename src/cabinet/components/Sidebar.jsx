import { NavLink } from "react-router-dom";
import {
  User,
  ShoppingCart,
  Download,
  ArrowLeftRight,
  Send,
  HelpCircle,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Account", path: "/cabinet/account", icon: <User size={18} /> },
    { name: "Buy License", path: "/cabinet/buy", icon: <ShoppingCart size={18} /> },
    { name: "Download", path: "/cabinet/download", icon: <Download size={18} /> },
    { name: "Exchange", path: "/cabinet/exchange", icon: <ArrowLeftRight size={18} /> },
    { name: "Send", path: "/cabinet/send", icon: <Send size={18} /> },
    { name: "Support", path: "/cabinet/support", icon: <HelpCircle size={18} /> },
  ];

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 bg-black border-r border-gray-800 
                 text-gray-200 flex flex-col z-40"
    >
      {/* Logo */}
      <div className="p-6 text-2xl font-extrabold text-green-400 border-b border-gray-800">
        AIcontrib
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition 
              ${
                isActive
                  ? "bg-green-500/20 text-green-400"
                  : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer (optional small text or version) */}
      <div className="p-4 text-xs text-gray-500 border-t border-gray-800 text-center">
        © 2025 AIcontrib
      </div>
    </aside>
  );
}

export default Sidebar;
