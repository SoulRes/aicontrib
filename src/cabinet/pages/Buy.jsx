import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Buy() {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(500);
  const [referralCode, setReferralCode] = useState("");
  const [referrerValid, setReferrerValid] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState(null);

  // ✅ Get logged-in user email from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setBuyerEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkReferral = async () => {
    if (!buyerEmail) {
      alert("You must be logged in to use a referral code.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/check-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode, buyerEmail }),
      });
      const data = await res.json();

      if (data.valid) {
        setReferrerValid(true);
        setPrice(450);
      } else {
        setReferrerValid(false);
        setPrice(500);
        alert(data.message || "Invalid referral code");
      }
    } catch (err) {
      console.error("Referral check error:", err);
      setReferrerValid(false);
    }
  };

  // ✅ Create invoice
  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/nowpayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          currency: "usd",
          referralCode,
          order_description: `AIcontrib License|${buyerEmail}|${referralCode || ""}`,
        }),
      });

      const data = await res.json();
      console.log("NOWPayments response:", data);

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        alert("Error creating invoice. Please try again.");
      }
    } catch (err) {
      console.error("NOWPayments error:", err);
      alert("Failed to start payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-gray-100">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Buy License</h1>

      <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <p className="text-gray-300 mb-4">
          Unlock full access by purchasing the license.
        </p>

        {/* Referral input */}
        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-400">
            Have a referral code? By using referral code you get $50 discount!
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none"
              placeholder="Enter referral code"
            />
            <button
              onClick={checkReferral}
              className="px-4 py-2 bg-green-500 hover:bg-blue-600 rounded-lg text-black"
            >
              Check
            </button>
          </div>
          {referrerValid === true && (
            <p className="mt-2 text-green-400 text-sm">
              ✅ Referral code valid! You get $50 discount. Total: ${price}
            </p>
          )}
          {referrerValid === false && (
            <p className="mt-2 text-red-400 text-sm">
              ❌ {referralCode ? "Invalid or unusable referral code." : "Invalid referral code."}
            </p>
          )}
        </div>

        {/* Price */}
        <p className="text-xl font-bold text-green-400 mb-6">${price}</p>

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={loading}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-black font-medium transition disabled:opacity-50"
        >
          {loading ? "Creating Invoice..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default Buy;
