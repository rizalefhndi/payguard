import LandingNavbar from "./_landing/navbar"
import Hero from "./_landing/hero"
import HowItWorks from "./_landing/how-it-works"
import Features from "./_landing/features"
import Stats from "./_landing/stats"
import CtaSection from "./_landing/cta-section"
import Footer from "./_landing/footer"

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Stats />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
