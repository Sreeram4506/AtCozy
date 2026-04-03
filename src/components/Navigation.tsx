import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { navigationConfig } from '../config';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

export function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems, toggleCart, wishlist } = useCartStore();
  const { openSearch, openWishlist } = useUIStore();
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = getTotalItems();
  const wishlistCount = wishlist.length;

  if (!navigationConfig.logo) return null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: '100px top',
        end: 'max',
        onUpdate: (self) => {
          setIsScrolled(self.progress > 0);
        },
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label?: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // If it's a category link (not 'About'), navigate to home with category param
    const categoryItems = ['Shop All', 'Dresses', 'Tops', 'Boots', 'Heels', 'Shirts', 'Blouse', 'Sneakers'];
    if (label && categoryItems.includes(label)) {
      const category = label === 'Shop All' ? 'All' : label;
      navigate(`/?category=${encodeURIComponent(category)}`);
      return;
    }

    // For anchor links like #about, scroll to the element
    const target = (href === '#hero' || href === '#')
      ? document.body
      : document.querySelector(href);

    if (target) {
      const st = ScrollTrigger.getAll().find(s => s.trigger === target);
      const scrollPos = st ? st.start : (target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY);
      gsap.to(window, { scrollTo: scrollPos, duration: 1.5, ease: 'power4.inOut' });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[5000] transition-all duration-500 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                handleNavClick(e as any, '#hero');
              }
            }}
            className="text-xl font-medium text-white hover:text-[#D4A24F] transition-colors duration-300"
          >
            {navigationConfig.logo}
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navigationConfig.items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.label)}
                className="text-sm text-white/70 hover:text-white transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4A24F] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Admin Dashboard Link */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-[#D4A24F]/50 text-[#D4A24F] rounded-full hover:bg-[#D4A24F] hover:text-black transition-all"
              >
                Dashboard
              </Link>
            )}

            {/* Search */}
            <button 
              onClick={openSearch}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            {/* ... */}

            {/* Wishlist */}
            <button 
              onClick={openWishlist}
              className="p-2 text-white/70 hover:text-white transition-colors relative"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-[#D4A24F] text-[#D4A24F]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4A24F] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user?.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal('login')}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Cart */}
            <button 
              onClick={toggleCart}
              className="p-2 text-white/70 hover:text-white transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A24F] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[4900] bg-black transition-all duration-500 lg:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navigationConfig.items.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.label)}
              className="text-3xl text-white hover:text-[#D4A24F] transition-colors duration-300"
              style={{
                transform: isMobileMenuOpen
                  ? 'translateY(0)'
                  : 'translateY(20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
              }}
            >
              {item.label}
            </a>
          ))}
          
          {/* Mobile actions */}
          <div 
            className="flex flex-col items-center gap-8 mt-12 w-full px-8"
            style={{
              transform: isMobileMenuOpen
                ? 'translateY(0)'
                : 'translateY(20px)',
              opacity: isMobileMenuOpen ? 1 : 0,
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s`,
            }}
          >
            <div className="flex items-center gap-8">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openWishlist();
                }}
                className="p-3 text-white/70 hover:text-white transition-colors relative"
              >
                <Heart className={`w-7 h-7 ${wishlistCount > 0 ? 'fill-[#D4A24F] text-[#D4A24F]' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A24F] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Mobile Account Action */}
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Optionally navigate to profile or just show sign out below
                  }}
                  className="p-3 text-[#D4A24F] transition-colors relative flex flex-col items-center gap-1"
                >
                  <User className="w-7 h-7" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="p-3 text-white/70 hover:text-white transition-colors relative"
                >
                  <User className="w-7 h-7" />
                </button>
              )}

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleCart();
                }}
                className="p-3 text-white/70 hover:text-white transition-colors relative"
              >
                <ShoppingBag className="w-7 h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A24F] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Logout/Admin link for Mobile */}
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10 w-full max-w-[200px]">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#D4A24F] text-xs font-bold uppercase tracking-[0.2em]"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-white/40 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
