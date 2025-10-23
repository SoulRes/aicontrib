// src/components/Testimonials.jsx
import { motion } from "framer-motion";

function Testimonials() {
  const testimonials = [
    {
      name: "John D.",
      text: "I started sharing my PC power and already earned rewards while supporting AI research.",
      img: "https://randomuser.me/api/portraits/men/32.jpg", // Male
    },
    {
      name: "Sarah L.",
      text: "AIcontrib made me realize my unused laptop could actually help AI development.",
      img: "https://randomuser.me/api/portraits/women/44.jpg", // Female
    },
    {
      name: "Mike R.",
      text: "It feels great to contribute to the future of AI. The app runs smoothly.",
      img: "https://randomuser.me/api/portraits/men/65.jpg", // Male
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-950 text-gray-100 relative z-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-green-400">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-black border border-gray-800 hover:border-green-500/40 
                         p-6 rounded-xl shadow-xl hover:shadow-green-500/20 
                         transition flex flex-col items-center text-center"
            >
              <img
                src={t.img}
                alt={t.name}
                className="w-16 h-16 rounded-full mb-4 border-2 border-green-400"
              />
              <p className="italic text-gray-300 mb-4">"{t.text}"</p>
              <h4 className="font-bold text-green-300">{t.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
