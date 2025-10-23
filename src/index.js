// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";

import App from "./App"; // Landing page
import CabinetApp from "./cabinet/App"; // Cabinet
import AuthForm from "./components/AuthForm"; // Login/Signup
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protect cabinet with PrivateRoute
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/*" element={<App />} />

          {/* Authentication */}
          <Route path="/auth" element={<AuthForm />} />

          {/* Personal Cabinet (protected) */}
          <Route
            path="/cabinet/*"
            element={
              <PrivateRoute>
                <CabinetApp />
              </PrivateRoute>
            }
          />

          {/* Fallback → redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);