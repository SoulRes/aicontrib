import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ✅ Auto-detect backend (local or deployed)
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://aicontrib-backend.vercel.app";

function Buy() {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(500);
  const [referralCode, setReferralCode] = useState("");
  const [referrerValid, setReferrerValid] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("usdttrc20"); // 💰 default crypto

  // ✅ Get buyer email from Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setBuyerEmail(user.email);
    });
    return unsubscribe;
  }, []);

  // ✅ Validate referral code
  const checkReferral = async () => {
    if (!buyerEmail) {
      alert("You must be logged in to use a referral code.");
      return;
    }

    if (!referralCode.trim()) {
      alert("Please enter a referral code first.");
      return;
    }

    setStatusMsg("⏳ Checking referral code...");
    setReferrerValid(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/check-referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode, buyerEmail }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error (${res.status}): ${errText}`);
      }

      const data = await res.json();

      if (data.valid) {
        setReferrerValid(true);
        setPrice(450); // 💰 apply $50 discount
        setStatusMsg("✅ Referral valid! $50 discount applied.");
      } else {
        setReferrerValid(false);
        setStatusMsg(data.message || "❌ Invalid referral code.");
      }
    } catch (err) {
      console.error("🔥 Referral check error:", err);
      setReferrerValid(false);
      setStatusMsg("❌ Unable to verify referral code. Try again later.");
    }
  };

  // ✅ Handle payment
  const handleBuy = async () => {
    if (!buyerEmail) {
      alert("Please log in to make a purchase.");
      return;
    }

    setLoading(true);
    setStatusMsg("⏳ Creating payment...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/nowpayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: price,
          price_currency: "usd",
          pay_currency: selectedCurrency, // ✅ dynamic crypto
          order_description: `AIcontrib License|${buyerEmail}|${referralCode || ""}`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Payment creation failed: ${errText}`);
      }

      const data = await res.json();

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        throw new Error("No invoice URL returned from server.");
      }
    } catch (err) {
      console.error("🔥 NOWPayments error:", err);
      alert("Failed to start payment. Please try again later.");
      setStatusMsg("❌ Payment initialization failed.");
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

        {/* Referral Code */}
        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-400">
            Have a referral code? Use it to get a $50 discount!
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
              disabled={loading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-black font-medium transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>
          {statusMsg && (
            <p
              className={`mt-2 text-sm ${
                referrerValid ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {statusMsg}
            </p>
          )}
        </div>

        {/* Currency Selector */}
        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-400">
            Choose your payment currency:
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none"
          >
            <option value="usdttrc20">USDT (TRC20)</option>
            <option value="btc">Bitcoin (BTC)</option>
            <option value="eth">Ethereum (ETH)</option>
            <option value="ltc">Litecoin (LTC)</option>
            <option value="doge">Dogecoin (DOGE)</option>
            <option value="trx">Tron (TRX)</option>
          </select>
        </div>

        {/* Price */}
        <p className="text-xl font-bold text-green-400 mb-6">${price}</p>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-black font-medium transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default Buy;
