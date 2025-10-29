import { Link } from "react-router-dom";

function Failed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-red-400">
      <h1 className="text-4xl font-bold mb-4">❌ Payment Failed</h1>
      <p className="text-gray-300 mb-6">
        Something went wrong or the transaction was canceled.
      </p>
      <Link
        to="/cabinet/buy"
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-black font-semibold rounded-lg transition"
      >
        Try Again
      </Link>
    </div>
  );
}

export default Failed;
