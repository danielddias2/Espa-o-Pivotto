import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
import BridalSection from '@/components/sections/BridalSection'
import GallerySection from '@/components/sections/GallerySection'
import ContactSection from '@/components/sections/ContactSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BridalSection />
      <AboutSection />
      <GallerySection />
      <ContactSection />
    </>
  )
}
