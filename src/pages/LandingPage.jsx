import Hero from '../components/Landing/Hero'
import About from '../components/Landing/About'
import Features from '../components/Landing/Features'
import Testimonials from '../components/Landing/Testimonials'
import Footer from '../components/Landing/Footer'
import Contact from '../components/Landing/Contact'

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />
      <div className="bg-gradient-to-b from-[#fffaf0] via-[#fdf4e3] to-[#faebcf]">
        <About />
        <Features />
        <Testimonials />
        <Contact />
        <Footer />

      </div>
    </div>
  )
}

export default LandingPage
