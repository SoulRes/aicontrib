// src/components/About.jsx
import { useState } from "react";
import AuthModal from "./AuthModal";

function About() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <section
      id="about"
      className="relative py-20 bg-gray-950 text-gray-100 overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/photo/about2.png')" }}
      ></div>

      {/* Gradient overlay (fade left → right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Text Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-green-400">
            About AIcontrib
          </h2>

          <p className="mb-4 text-gray-300 leading-relaxed">
            AIcontrib is a revolutionary platform that connects individuals
            with spare computing power to AI software owners who need enhanced
            processing capabilities for complex tasks.
          </p>

          <p className="mb-4 text-gray-400 leading-relaxed">
            By joining AIcontrib, users can share their PC’s unused resources to
            help AI generate faster and more efficient responses. In return,
            users earn rewards for their contributions.
          </p>

          <h3 className="text-xl font-semibold text-green-300 mt-6 mb-2">
            How It Works
          </h3>
          <p className="mb-4 text-gray-400">
            Each time a user shares their resources, the power is pooled
            together to accelerate AI computations. More users means stronger,
            faster, and smarter AI.
          </p>

          <h3 className="text-xl font-semibold text-green-300 mt-6 mb-2">
            Benefits
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>Earn rewards for sharing your computing power</li>
            <li>Support AI developers with scalable resources</li>
            <li>Push the boundaries of Artificial Intelligence</li>
          </ul>

          <div className="mt-8">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition"
            >
              Join Us Now
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </section>
  );
}

export default About;
