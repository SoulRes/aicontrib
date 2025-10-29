// src/cabinet/pages/Buy.jsx
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Buy() {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(2);
  const [referralCode, setReferralCode] = useState("");
  const [referrerValid, setReferrerValid] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setBuyerEmail(user.email);
    });
    return unsubscribe;
  }, []);

  const checkReferral = async () => {
    if (!buyerEmail) {
      alert("You must be logged in to use a referral code.");
      return;
    }

    try {
      const res = await fetch("https://www.aicontrib.com/api/check-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode, buyerEmail }),
      });

      const data = await res.json();
      if (data.valid) {
        setReferrerValid(true);
        setPrice(1); // $50 discount
      } else {
        setReferrerValid(false);
        alert(data.message || "Invalid referral code");
      }
    } catch (err) {
      console.error("Referral check error:", err);
      setReferrerValid(false);
    }
  };

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nowpayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: price,
          price_currency: "usd",
          pay_currency: "usdttrc20",
          order_description: `AIcontrib License|${buyerEmail}|${referralCode || ""}`,
        }),
      });

      const data = await res.json();
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
        <p className="text-gray-300 mb-4">Unlock full access by purchasing the license.</p>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-400">
            Have a referral code? Use it to get $50 discount!
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
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-black"
            >
              Check
            </button>
          </div>
          {referrerValid && (
            <p className="mt-2 text-green-400 text-sm">
              ✅ Referral valid! New total: ${price}
            </p>
          )}
        </div>

        <p className="text-xl font-bold text-green-400 mb-6">${price}</p>

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
