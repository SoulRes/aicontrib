// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setReady(true));
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen bg-black text-gray-100 overflow-hidden flex items-center justify-center"
      aria-label="Hero"
    >
      {/* Particles (now only inside Hero) */}
      {ready && (
        <Particles
          id="heroParticles"
          className="absolute inset-0"
          options={{
            fullScreen: { enable: false }, // <-- IMPORTANT
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
              number: { value: 80, density: { enable: true, area: 800 } },
              color: { value: "#22c55e" },
              shape: { type: "circle" },
              opacity: { value: 1 },
              size: { value: { min: 4, max: 8 } },
              move: { enable: true, speed: 1.2 },
              links: {
                enable: true,
                color: "#22c55e",
                opacity: 1,
                distance: 250,
              },
            },
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" },
                resize: true,
              },
              modes: { grab: { distance: 180, links: { opacity: 1 } } },
            },
            detectRetina: true,
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 text-center max-w-3xl px-6">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Harness the Power of{" "}
          <span className="text-green-400">AI Contribution</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Share your unused computing power and earn rewards while making AI
          faster and smarter.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <a
            href="#about"
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-lg rounded-lg shadow-md transition"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </section>
  );
}
