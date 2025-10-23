import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Exchange() {
  const [user, setUser] = useState(null);
  const [tmcBalance, setTmcBalance] = useState(0);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(50);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");

  // ✅ Listen to Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Load user balance + exchange rate
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);

      try {
        // Fetch user balance
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setTmcBalance(userSnap.data().tmc || 0);
        }

        // Fetch exchange rate
        const rateRef = doc(db, "exchangeRates", "tmcToUsdt");
        const rateSnap = await getDoc(rateRef);
        if (rateSnap.exists()) {
          setRate(rateSnap.data().rate || 0);
        }
      } catch (err) {
        console.error("🔥 Error loading exchange data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // ✅ Handle Exchange
  const handleExchange = async () => {
    if (!user) return;
    if (amount < 50) {
      alert("Minimum exchange is 50 TMC");
      return;
    }
    if (amount > tmcBalance) {
      alert("Not enough TMC");
      return;
    }

    setProcessing(true);
    setSuccess("");

    try {
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");

      const data = userSnap.data();
      const newTmc = (data.tmc || 0) - amount;
      const usdtToAdd = amount * rate;

      await updateDoc(userRef, {
        tmc: newTmc,
        usdt: (data.usdt || 0) + usdtToAdd,
      });

      setSuccess(
        `✅ Successfully exchanged ${amount} TMC → ${usdtToAdd.toFixed(2)} USDT`
      );
      setTmcBalance(newTmc);
      setAmount(50);
    } catch (err) {
      console.error("Exchange error:", err);
      alert("Exchange failed. Check console for details.");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Show loader while waiting for user or data
  if (loadingUser || loadingData)
    return <p className="text-gray-400 text-center mt-10">Loading...</p>;

  if (!user) return <p className="text-gray-400 text-center">User not found.</p>;

  return (
    <div className="p-8 text-gray-100">
      <h1 className="text-3xl font-bold text-green-400 mb-6">
        Exchange TMC → USDT
      </h1>

      <div className="bg-black/70 border border-gray-800 rounded-2xl shadow-lg p-8">
        {/* Balances */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-2xl font-bold text-green-400">
              {tmcBalance.toLocaleString()} TMC
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <p className="text-sm text-gray-400">Exchange Rate</p>
            <p className="text-2xl font-bold text-green-400">
              1 TMC = {rate} USDT
            </p>
          </div>
        </div>

        {tmcBalance < 50 ? (
          <p className="text-red-400 text-center py-6">
            ❌ You need at least{" "}
            <span className="font-bold">50 TMC</span> to exchange.
          </p>
        ) : (
          <>
            {/* Slider + input */}
            <div className="mb-6">
              <label className="block mb-2 text-gray-300 text-sm">
                Choose amount to exchange
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max={tmcBalance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 accent-green-400"
                />
                <input
                  type="number"
                  min="50"
                  max={tmcBalance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white text-right"
                />
                <button
                  onClick={() => setAmount(tmcBalance)}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400">You will receive</p>
              <p className="text-2xl font-bold text-green-400">
                {(amount * rate).toFixed(2)} USDT
              </p>
            </div>

            {/* Exchange button */}
            <button
              onClick={handleExchange}
              disabled={processing}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-black font-medium transition disabled:opacity-50"
            >
              {processing ? "Exchanging..." : `Exchange ${amount} TMC`}
            </button>
          </>
        )}

        {success && <p className="mt-6 text-green-400 text-center">{success}</p>}
      </div>
    </div>
  );
}

export default Exchange;
