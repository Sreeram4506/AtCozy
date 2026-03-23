import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from './components/Navigation';
import { CustomCursor } from './components/CustomCursor';
import { ParticleField } from './components/ParticleField';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { CityMotion } from './sections/CityMotion';
import { PortraitStudy } from './sections/PortraitStudy';
import { DayNight } from './sections/DayNight';
import { AllProducts } from './sections/AllProducts';
import { CraftSection } from './sections/CraftSection';
import { FinalScene } from './sections/FinalScene';
import { Newsletter } from './sections/Newsletter';
import { Signature } from './sections/Signature';
import { Footer } from './sections/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchOverlay } from './components/SearchOverlay';
import { WishlistOverlay } from './components/WishlistOverlay';
import { Chatbot } from './components/Chatbot';
import { AuthProvider } from './context/AuthContext';
import { siteConfig } from './config';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }
    if (siteConfig.language) {
      document.documentElement.lang = siteConfig.language;
    }

    // Global snap for pinned sections
    const setupGlobalSnap = () => {
      const allST = ScrollTrigger.getAll();
      const pinned = allST.filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      // Extract all start and end points of animations
      const snapPoints: number[] = [0]; // Include top
      
      allST.forEach(st => {
        if (st.trigger) {
          snapPoints.push(st.start / maxScroll);
          if (st.end) snapPoints.push(st.end / maxScroll);
        }
      });

      // Add actual section offsets as fallback
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        snapPoints.push(top / maxScroll);
      });

      // Unique and sorted
      const uniquePoints = Array.from(new Set(snapPoints))
        .filter(p => p >= 0 && p <= 1)
        .sort((a, b) => a - b);

      ScrollTrigger.create({
        snap: {
          snapTo: uniquePoints,
          duration: { min: 0.6, max: 1.2 },
          delay: 0.1,
          ease: 'power3.inOut',
        },
      });
    };

    // Refresh ScrollTrigger after initial render
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      // Only setup global snap if we are confident the layout is stable
      const setupSnapTimer = setTimeout(() => {
        setupGlobalSnap();
      }, 500);
      return () => clearTimeout(setupSnapTimer);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-[#0B0B0D] text-white overflow-x-hidden">
        {/* Noise texture overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-[200]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.03,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Custom cursor */}
        <CustomCursor />

        {/* Particle field */}
        <ParticleField />

        {/* Navigation */}
        <Navigation />

        {/* Cart Drawer */}
        <CartDrawer />

        {/* Auth Modal */}
        <AuthModal />

        {/* Quick View Modal */}
        <QuickViewModal />

        {/* Search Overlay */}
        <SearchOverlay />

        {/* Wishlist Overlay */}
        <WishlistOverlay />

        {/* AI Chatbot */}
        <Chatbot />

        {/* Main content */}
        <main>
          <Hero />
          <About />
          <CityMotion />
          <PortraitStudy />
          <DayNight />
          <AllProducts />
          <CraftSection />
          <FinalScene />
          <Newsletter />
          <Signature />
          <Footer />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
