import { useEffect, useState, useMemo } from "react";

function EarningsCounter() {
  // 🧠 Memoize startDate so it doesn't change every render
  const startDate = useMemo(() => new Date("2025-09-11T00:00:00Z"), []);

  const baseEarnings = 10000;
  const baseUsers = 250;
  const baseResponses = 500000;

  const [stats, setStats] = useState({
    earnings: baseEarnings,
    users: baseUsers,
    responses: baseResponses,
  });

  // Helper: format large numbers
  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return Math.floor(num).toLocaleString();
  };

  useEffect(() => {
    const updateStats = () => {
      const now = new Date();
      const elapsed = (now - startDate) / 1000; // seconds since start date

      const newEarnings = baseEarnings + elapsed * 0.1; // $0.1/sec
      const newUsers = baseUsers + elapsed / 7200; // +1 user/2 hours
      const newResponses = baseResponses + elapsed * 15; // +15/sec

      setStats({
        earnings: newEarnings,
        users: newUsers,
        responses: newResponses,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [startDate]); // ✅ no warning now

  return (
    <section id="earnings" className="relative py-32 text-gray-100 bg-gray-950">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/photo/ai4.png')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-400 mb-16">
          Community Impact
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          <StatCard
            title="Total User Earnings"
            value={`$${formatNumber(stats.earnings)}`}
          />
          <StatCard
            title="Active Contributors"
            value={`${formatNumber(stats.users)}+`}
          />
          <StatCard
            title="AI Responses Produced"
            value={formatNumber(stats.responses)}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      className="bg-black border border-gray-800 hover:border-green-500/40 
                  p-10 rounded-xl shadow-xl hover:shadow-green-500/20 transition"
    >
      <h3 className="text-xl text-gray-400 mb-3">{title}</h3>
      <p className="text-5xl font-extrabold text-green-300">{value}</p>
    </div>
  );
}

export default EarningsCounter;
