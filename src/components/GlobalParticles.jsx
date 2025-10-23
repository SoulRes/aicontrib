// src/components/GlobalParticles.jsx
import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function GlobalParticles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Particles
        id="globalParticles"
        className="w-full h-full"
        options={{
          fullScreen: { enable: false }, // stays inside this wrapper
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, area: 1000 } },
            color: { value: "#22c55e" },
            shape: { type: "circle" },
            opacity: { value: 0.15 },
            size: { value: { min: 1, max: 3 } },
            move: { enable: true, speed: 0.6 },
            links: {
              enable: true,
              color: "#22c55e",
              opacity: 0.15,
              distance: 130,
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
