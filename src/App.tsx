import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Navigation } from './components/Navigation';
import { CustomCursor } from './components/CustomCursor';
import { ParticleField } from './components/ParticleField';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchOverlay } from './components/SearchOverlay';
import { WishlistOverlay } from './components/WishlistOverlay';
import { Chatbot } from './components/Chatbot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { siteConfig } from './config';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

// Production-grade GSAP configuration for stability
ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  useGSAP(() => {
    // Global snap for pinned sections
    let snapTrigger: ScrollTrigger | null = null;
    let setupSnapTimer: any = null;

    if (siteConfig.title) document.title = siteConfig.title;
    if (siteConfig.language) document.documentElement.lang = siteConfig.language;

    const setupGlobalSnap = () => {
      if (snapTrigger) {
        snapTrigger.kill(true);
        snapTrigger = null;
      }

      const allST = ScrollTrigger.getAll();
      const pinned = allST.filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || maxScroll <= 0 || pinned.length === 0) return;

      const snapPoints: number[] = [0]; 
      
      allST.forEach(st => {
        if (st.trigger) {
          snapPoints.push(st.start / maxScroll);
          if (st.end) snapPoints.push(st.end / maxScroll);
        }
      });

      const sections = document.querySelectorAll('section[id]');
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        snapPoints.push(top / maxScroll);
      });

      const uniquePoints = Array.from(new Set(snapPoints))
        .filter(p => p >= 0 && p <= 1)
        .sort((a, b) => a - b);

      if (uniquePoints.length > 1) {
        snapTrigger = ScrollTrigger.create({
          snap: {
            snapTo: uniquePoints,
            duration: { min: 0.6, max: 1.2 },
            delay: 0.1,
            ease: 'power3.inOut',
          },
        });
      }
    };

    // Use a single delayed execution
    setupSnapTimer = gsap.delayedCall(1.2, () => {
      ScrollTrigger.refresh();
      setupGlobalSnap();
    });

    return () => {
      if (setupSnapTimer) setupSnapTimer.kill();
      // The global cleanup will handle snapTrigger and all other STs
    };
  }, { dependencies: [location.pathname], revertOnUpdate: true });

  // Global Route Cleanup - CRITICAL for GSAP/React stability
  useGSAP(() => {
    // This runs on EVERY route change
    return () => {
      console.log('Route change detected: Cleaning up all animations...');
      
      // 1. Revert and kill all ScrollTriggers immediately
      // kill(true) is essential - it restores the DOM to its pre-GSAP state
      const st = ScrollTrigger.getAll();
      st.forEach(t => {
        try {
          t.kill(true); // Reverts DOM and kills the trigger
        } catch (e) {
          console.warn('Silent failure during ScrollTrigger cleanup:', e);
        }
      });


      // 2. Kill all active GSAP tweens/timelines globally
      gsap.killTweensOf('*');
      
      // 3. Force a ScrollTrigger refresh to clear internal caches
      ScrollTrigger.refresh();
      
      console.log('Cleanup complete.');
    };
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#0B0B0D] text-white">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[200]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />

      {!location.pathname.startsWith('/admin') && (
        <>
          <CustomCursor />
          <ParticleField />
          <Navigation />
          <CartDrawer />
          <QuickViewModal />
          <SearchOverlay />
          <WishlistOverlay />
          <Chatbot />
        </>
      )}
      <AuthModal />
      <Toaster position="top-center" richColors />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Admin Routes with Basic Protection */}
          {isAuthenticated && user?.role === 'admin' ? (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}



function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

