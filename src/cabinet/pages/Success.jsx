import { Link } from "react-router-dom";

function Success() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-green-400">
      <h1 className="text-4xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="text-gray-300 mb-6">
        Your account has been activated successfully. Welcome aboard!
      </p>
      <Link
        to="/cabinet/account"
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default Success;
