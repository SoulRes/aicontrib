// src/components/Services.jsx
function Services() {
  const services = [
    {
      title: "Computational Contribution",
      text: "Empower AI development by sharing your processing power.",
      img: "/photo/ai2.png",
    },
    {
      title: "AI Task Acceleration",
      text: "Speed up AI tasks with your spare computing resources.",
      img: "/photo/ai3.png",
    },
    {
      title: "Monetize Your Processing Power",
      text: "Turn your idle computing resources into income.",
      img: "/photo/ai1.png",
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-green-400">
          Our Unique Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-black border border-gray-800 hover:border-green-500/40 p-6 rounded-xl shadow-xl hover:shadow-green-500/20 transition flex flex-col"
            >
              <img
                src={service.img}
                alt={service.title}
                className={`rounded-md mb-6 w-full h-56 object-cover 
                  ${index === 2 ? "object-top" : ""}`}
              />
              <h3 className="text-xl font-bold mb-3 text-green-300">
                {service.title}
              </h3>
              <p className="text-gray-400">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
