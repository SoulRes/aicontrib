import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const cryptos = ["BTC", "ETH", "USDT", "LTC", "DOGE"];

function Send() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [crypto, setCrypto] = useState("BTC");
  const [address, setAddress] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  // ✅ Load user balance & payout history
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.email);

    Promise.all([
      getDoc(userRef),
      new Promise((resolve) => {
        const q = query(
          collection(db, "pendingTransactions"),
          where("userId", "==", user.email)
        );
        const unsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
          setHistory(data);
          resolve(unsub);
        });
      }),
    ]).then(async ([snap]) => {
      if (snap.exists()) setBalance(snap.data().usdt || 0);
      setLoadingData(false);
    });
  }, [user]);

  // ✅ Handle payout submission
  const handleSend = async () => {
    if (!user) return;
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (amount > balance) {
      alert("Not enough balance");
      return;
    }
    if (!address.trim()) {
      alert("Enter a valid wallet address");
      return;
    }

    setSubmitting(true);
    setSuccess("");

    try {
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User not found");

      const newBalance = (userSnap.data().usdt || 0) - Number(amount);
      await updateDoc(userRef, { usdt: newBalance });

      await addDoc(collection(db, "pendingTransactions"), {
        userId: user.email,
        crypto,
        address,
        usdtAmount: Number(amount),
        status: "Pending",
        timestamp: serverTimestamp(),
      });

      setBalance(newBalance);
      setSuccess(`✅ Payout of ${amount} ${crypto} submitted successfully.`);
      setAmount("");
      setAddress("");
    } catch (err) {
      console.error("🔥 Error submitting payout:", err);
      alert("Failed to submit payout. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🧩 Show loader while user or Firestore data is not ready
  if (loadingUser || loadingData)
    return <p className="text-gray-400 text-center mt-10">Loading...</p>;

  if (!user) return <p className="text-gray-400">User not found.</p>;

  return (
    <div className="p-8 text-gray-100">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Send (Withdraw)</h1>

      {/* Withdraw Form */}
      <div className="bg-black/70 border border-gray-800 rounded-2xl shadow-lg p-8 mb-10">
        <div className="mb-6">
          <p className="text-sm text-gray-400">Your Balance</p>
          <p className="text-2xl font-bold text-green-400">{balance} USDT</p>
        </div>

        <div className="space-y-4">
          {/* Crypto selection */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">Select Crypto</label>
            <select
              value={crypto}
              onChange={(e) => setCrypto(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
            >
              {cryptos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Address input */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">
              Recipient Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
            />
          </div>

          {/* Amount input */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={amount}
              min="1"
              max={balance}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSend}
            disabled={submitting}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-black font-medium transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Payout"}
          </button>
        </div>

        {success && <p className="mt-6 text-green-400 text-center">{success}</p>}
      </div>

      {/* Payout History */}
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Payout History</h2>
      <div className="bg-black/60 border border-gray-800 rounded-2xl shadow-lg p-6">
        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No payout history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left py-2 px-3">Payout ID</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Crypto</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-left py-2 px-3">Address</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-800 hover:bg-gray-900/40 transition"
                  >
                    <td className="py-2 px-3 text-xs text-gray-500">{tx.id}</td>
                    <td className="py-2 px-3">
                      {tx.timestamp?.toDate
                        ? tx.timestamp.toDate().toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2 px-3">{tx.crypto}</td>
                    <td className="py-2 px-3 text-green-400 font-medium">
                      {tx.usdtAmount} USDT
                    </td>
                    <td className="py-2 px-3 text-gray-400 break-all">{tx.address}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : tx.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Send;
