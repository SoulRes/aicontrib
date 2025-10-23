// src/cabinet/pages/Account.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Copy } from "lucide-react";

function Account() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.warn("⚠️ No user in context");
        return;
      }

      try {
        const userRef = doc(db, "users", user.email);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserData(snap.data());

          const referralsRef = collection(db, "users", user.email, "referrals");
          const referralSnaps = await getDocs(referralsRef);
          const referralList = referralSnaps.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setReferrals(referralList);
        } else {
          console.warn("❌ No document found for:", user.email);
        }
      } catch (err) {
        console.error("🔥 Firestore fetch error:", err);
      }
    };

    fetchData();
  }, [user]);

  if (!userData) {
    return <p className="text-center text-gray-400">Loading account...</p>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(userData.referralCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxTMC = 1000;
  const progress = Math.min(((userData.totalTMC || 0) / maxTMC) * 100, 100);

    // Normalize Firestore value for activation
const rawStatus = String(userData.status || "").toLowerCase();
const isActivated = rawStatus === "activated" || rawStatus === "active";

  return (
    <div className="p-6 text-gray-100">
      {/* Header with account info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">My Account</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        {/* Status badge */}
        <div className="mt-4 md:mt-0">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              isActivated ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {isActivated ? "Activated" : "Not Activated"}
          </span>
        </div>
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-gray-400">USDT Balance</h2>
          <p className="text-2xl font-bold text-green-400">
            {userData.usdt ?? 0} USDT
          </p>
        </div>
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-gray-400">TMC</h2>
          <p className="text-2xl font-bold text-green-400">
            {userData.tmc ?? 0}
          </p>
        </div>
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg text-gray-400">Total Earned</h2>
          <p className="text-2xl font-bold text-green-400">
            {userData.totalTMC ?? 0}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-lg text-gray-400 mb-2">Level Progress</h2>
        <div className="w-full bg-gray-800 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {userData.totalTMC ?? 0} / {maxTMC} TMC
        </p>
      </div>

      {/* Referral code */}
      <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg text-gray-400">Referral Code</h2>
          <p className="text-xl font-bold text-green-400">
            {userData.referralCode}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition text-black font-semibold"
        >
          <Copy className="w-4 h-4 mr-2 text-black" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Referral list */}
      <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-lg text-gray-400 mb-4">Your Referrals</h2>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((ref, i) => (
              <li
                key={i}
                className="flex justify-between p-3 bg-gray-800 rounded-lg"
              >
                <span>{ref.id}</span>
                <span className="text-green-400">
                  {ref.status ?? "Pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No referrals yet.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
