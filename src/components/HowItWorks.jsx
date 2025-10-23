// src/components/HowItWorks.jsx
import { motion } from "framer-motion";
import { Download, Zap, DollarSign } from "lucide-react"; // nice icons

function HowItWorks() {
  const steps = [
    {
      title: "Download & Install",
      text: "Get the AIcontrib app on your PC and install it in a few clicks.",
      icon: <Download className="w-12 h-12 text-green-400" />,
    },
    {
      title: "Share Your Power",
      text: "Run the app to share unused CPU/GPU resources with our AI network.",
      icon: <Zap className="w-12 h-12 text-green-400" />,
    },
    {
      title: "Earn Rewards",
      text: "Receive payouts while helping accelerate AI research and applications.",
      icon: <DollarSign className="w-12 h-12 text-green-400" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gray-950 text-gray-100 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-green-400">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.25, duration: 0.7 }}
              viewport={{ once: true }}
              className="relative bg-black border border-gray-800 
                         hover:border-green-500/50 p-10 rounded-xl 
                         shadow-xl hover:shadow-green-500/30 
                         transition flex flex-col items-center text-center group"
            >
              {/* Glowing number */}
              <span className="absolute -top-6 left-6 text-5xl font-extrabold text-green-500/30 group-hover:text-green-400/60 transition">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Icon with hover pulse */}
              <div className="mb-6 transform transition group-hover:scale-110 group-hover:rotate-3">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-green-300 text-xl font-bold mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">{step.text}</p>
            </motion.div>
          ))}

          {/* Connecting line for flow */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-green-500/20 via-green-400/40 to-green-500/20 -z-10" />
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
