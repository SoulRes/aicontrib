function Contact() {
  return (
        <section
        id="contact"
        className="py-16 bg-gray-900 text-gray-100 relative z-10"
        >
        <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-400 mb-6 text-center">
            Contact Us
            </h2>
            <p className="text-center text-gray-400 mb-10">
            Have questions or want to collaborate? Send us a message below.
            </p>

            <form className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
            <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
            <button
                type="submit"
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition"
            >
                Send Message
            </button>
            </form>
        </div>
        </section>
  );
}

export default Contact;
