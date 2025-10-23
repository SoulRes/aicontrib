import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

function ParticlesTest() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return <p className="text-white">Loading particles...</p>;

  return (
    <div className="h-screen w-screen bg-black">
      <Particles
        id="tsparticles"
        className="h-full w-full"
        options={{
          background: { color: "#000000" },
          particles: {
            number: { value: 100 },
            color: { value: "#22c55e" },
            shape: { type: "circle" },
            opacity: { value: 0.7 },
            size: { value: { min: 2, max: 5 } },
            move: { enable: true, speed: 2 },
            links: {
              enable: true,
              color: "#22c55e",
              distance: 150,
              opacity: 0.4,
            },
          },
        }}
      />
    </div>
  );
}

export default ParticlesTest;
