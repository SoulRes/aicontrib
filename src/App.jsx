import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import Services from "./components/Services";
import EarningsCounter from "./components/EarningsCounter";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";  // ✅ new import
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import GlobalParticles from "./components/GlobalParticles";

function App() {
  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div>
        <Hero />

        <HowItWorks />

        <div className="relative min-h-screen">
          <GlobalParticles />

          <About />
          <Services />
          <EarningsCounter />
          <Testimonials />
          <FAQ /> {/* ✅ Added here */}
          <Contact />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
