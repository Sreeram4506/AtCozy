import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X, Mail, Lock, User, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, authMode, closeAuthModal, switchAuthMode, login, signup } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Enhanced Modal Animations
// ... (keep animations as they were)
  useGSAP(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      
      const tl = gsap.timeline();
      
      if (overlayRef.current) {
        tl.to(overlayRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
      }

      if (modalRef.current) {
        tl.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 40, rotateX: 10 },
          { opacity: 1, scale: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'expo.out' },
          '-=0.3'
        );
      }

      if (glowRef.current) {
        // Subtle glow pulse
        gsap.to(glowRef.current, {
          opacity: 0.6,
          scale: 1.1,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    } else {
      document.body.style.overflow = '';
      
      if (modalRef.current) {
        gsap.to(modalRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 20,
          duration: 0.3,
          ease: 'power3.in',
        });
      }
      
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          delay: 0.1
        });
      }
    }
  }, { dependencies: [isAuthModalOpen] });

  // Mode Switch Animation
  useGSAP(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current.children, 
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, { dependencies: [authMode], scope: modalRef });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSwitchMode = () => {
    resetForm();
    switchAuthMode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 perspective-container">
      {/* ... (keep the redesigned UI) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-[12px]"
        onClick={closeAuthModal}
        style={{ opacity: 0 }}
      />

      <div 
        ref={glowRef}
        className="absolute w-[500px] h-[500px] bg-[#D4A24F]/10 rounded-full blur-[120px] pointer-events-none z-0"
        style={{ opacity: 0 }}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#0D0D0F] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] z-10"
        style={{ opacity: 0 }}
      >
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 z-50 border border-white/5 active:scale-95"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div className="relative p-10 pt-14">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 rounded-full bg-[#D4A24F]/10 border border-[#D4A24F]/20 mb-4">
              <span className="text-[#D4A24F] text-[10px] font-bold uppercase tracking-[0.3em]">
                {authMode === 'login' ? 'Authentication' : 'Membership'}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {authMode === 'login' ? 'Welcome Back' : 'Join the Universe'}
            </h2>
            <p className="text-white/40 text-[13px] leading-relaxed max-w-[280px] mx-auto">
              {authMode === 'login'
                ? 'Sign in to your account to continue your bespoke journey.'
                : 'Experience luxury at your fingertips. Create your account today.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-red-400 text-xs text-center font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/30 group-focus-within:text-[#D4A24F] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A24F]/50 focus:bg-white/[0.05] transition-all duration-300"
                  required
                />
              </div>
            )}

            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/30 group-focus-within:text-[#D4A24F] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A24F]/50 focus:bg-white/[0.05] transition-all duration-300"
                required
              />
            </div>

            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/30 group-focus-within:text-[#D4A24F] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A24F]/50 focus:bg-white/[0.05] transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#D4A24F] text-black text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(212,162,79,0.2)] mt-4 overflow-hidden group/btn"
            >
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Enter Boutique' : 'Begin Journey'}</span>
                )}
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-white/20 text-[10px] font-medium uppercase tracking-[0.2em]">Or Connect Via</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  try {
                    await loginSocial('google');
                  } catch (err: any) {
                    setError(err.message || 'Google sign-in failed.');
                  }
                }}
                className="flex-1 flex items-center justify-center gap-3 py-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group/social duration-300"
              >
                <Chrome className="w-4 h-4 text-white/40 group-hover/social:text-white transition-colors" />
                <span className="text-xs text-white/40 group-hover/social:text-white">Google</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    await loginSocial('github');
                  } catch (err: any) {
                    setError(err.message || 'GitHub sign-in failed.');
                  }
                }}
                className="flex-1 flex items-center justify-center gap-3 py-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group/social duration-300"
              >
                <Github className="w-4 h-4 text-white/40 group-hover/social:text-white transition-colors" />
                <span className="text-xs text-white/40 group-hover/social:text-white">Github</span>
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-white/30 text-[12px]">
              {authMode === 'login' ? "New to the universe?" : 'Already a member?'}
              <button
                onClick={handleSwitchMode}
                className="ml-2 text-[#D4A24F] font-bold hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                {authMode === 'login' ? 'Request Access' : 'Sign In Now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
