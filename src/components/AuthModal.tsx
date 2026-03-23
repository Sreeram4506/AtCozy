import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, authMode, closeAuthModal, switchAuthMode, login, signup } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
      
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.2,
        ease: 'power3.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success;
      if (authMode === 'login') {
        success = await login(email, password);
      } else {
        success = await signup(name, email, password);
      }

      if (!success) {
        setError('Authentication failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeAuthModal}
        style={{ opacity: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#0B0B0D] border border-white/10 rounded-2xl overflow-hidden"
        style={{ opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        <div ref={contentRef} className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-white mb-2">
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-white/50 text-sm">
              {authMode === 'login'
                ? 'Sign in to access your account and wishlist'
                : 'Join LUXE for exclusive access to new collections'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A24F] transition-colors"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A24F] transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A24F] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D4A24F] text-black font-medium rounded-lg hover:bg-[#c49345] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={handleSwitchMode}
                className="ml-1 text-[#D4A24F] hover:underline"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Social login (decorative) */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0B0B0D] text-white/40">Or continue with</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
              >
                Google
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
              >
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
