import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is AIcontrib?",
    answer:
      "AIcontrib is a platform where users contribute to AI model improvement and get rewarded for their participation.",
  },
  {
    question: "How can I start earning?",
    answer:
      "Simply sign up, connect your account, and start contributing through tasks or integrations available in your dashboard.",
  },
  {
    question: "How are payments made?",
    answer:
      "All payments are processed securely in USDT or BTC. You can withdraw your balance anytime from your dashboard.",
  },
  {
    question: "Do I need technical skills?",
    answer:
      "Not at all! AIcontrib is designed for everyone — from casual contributors to developers and data enthusiasts.",
  },
  {
    question: "How does the referral system work?",
    answer:
      "Share your unique referral link with friends. You earn a commission each time your referral contributes or makes a payment.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Withdrawals are processed automatically within 24 hours after approval.",
  },
  {
    question: "Is it free to join?",
    answer:
      "Yes! Creating an account and participating in basic tasks is completely free.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use Firebase authentication and encryption to ensure that your data and transactions are always safe.",
  },
  {
    question: "Can I use it on mobile?",
    answer:
      "Yes, the dashboard and contribution tools are mobile-friendly and optimized for all devices.",
  },
  {
    question: "Who can I contact for help?",
    answer:
      "You can reach out through the Support section in your dashboard or use the Contact form on the website.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="relative py-24 bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-green-400 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-black border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full p-5 text-left text-lg font-medium text-gray-200 hover:text-green-400 transition"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? "rotate-180 text-green-400" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-400">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
