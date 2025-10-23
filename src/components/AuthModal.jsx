import AuthForm from "./AuthForm";

function AuthModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center min-h-screen">
      {/* Modal Box */}
      <div className="relative bg-gray-900 text-gray-100 rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Auth Form */}
        <AuthForm onSuccess={onClose} />
      </div>
    </div>
  );
}

export default AuthModal;
