import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { HelpCircle, Send } from "lucide-react";

function Support() {
  const { user } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: "How can I activate my account?",
      a: "After completing your payment, your account will be automatically activated. You can also contact support if activation is delayed.",
    },
    {
      q: "Where can I download the software?",
      a: "Go to the 'Download' section in your dashboard to access the latest version of the software.",
    },
    {
      q: "What payment methods are accepted?",
      a: "Currently, we accept cryptocurrency payments including BTC, ETH, and USDT through our secure payment processor.",
    },
    {
      q: "I sent BTC but my account isn’t activated.",
      a: "Please allow up to 15 minutes for blockchain confirmation. If it still isn’t activated, provide your transaction ID below.",
    },
    {
      q: "Can I change my email address?",
      a: "For security reasons, email changes are handled manually. Please contact support with your request.",
    },
    {
      q: "How does the referral program work?",
      a: "Share your referral code from the Account section. You’ll earn TMC bonuses for every activated referral.",
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. We use Firebase Authentication and Firestore which follow Google’s security standards.",
    },
    {
      q: "Can I withdraw my TMC tokens?",
      a: "TMC tokens can be exchanged within the dashboard once the feature is enabled.",
    },
    {
      q: "Do you offer refunds?",
      a: "Refunds are handled on a case-by-case basis. Please describe your issue and our team will review it.",
    },
    {
      q: "How can I contact support directly?",
      a: "You can use the contact form below to reach our support team 24/7.",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "supportMessages"), {
        userEmail: user?.email || "guest",
        message,
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setMessage("");
    } catch (error) {
      console.error("🔥 Error sending message:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="text-green-400 w-7 h-7" />
        <h1 className="text-3xl font-bold text-green-400">Support Center</h1>
      </div>

      {/* FAQ Section */}
      <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-850 transition"
            >
              <button
                className="w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-200">{faq.q}</span>
                <span
                  className={`transform transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedIndex === index && (
                <div className="px-4 pb-3 text-gray-400 border-t border-gray-800 text-sm animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-black border border-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">
          Contact Support
        </h2>
        <p className="text-gray-400 mb-4">
          Need personalized help? Send us a message and we’ll respond as soon as
          possible.
        </p>

        {sent ? (
          <div className="bg-green-600/20 text-green-400 px-4 py-3 rounded-lg">
            ✅ Your message has been sent! Our team will get back to you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-32 bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              placeholder="Describe your issue here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Support;
