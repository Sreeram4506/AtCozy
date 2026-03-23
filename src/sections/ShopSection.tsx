import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { shopConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function ShopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  
  const { addToCart, toggleWishlist, isInWishlist } = useCartStore();
  const { openQuickView } = useUIStore();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = cardsRef.current?.children;
    if (!cards) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 0.7,
        onLeaveBack: () => {
          gsap.set(imageRef.current, { scale: 1, opacity: 1 });
          gsap.set(headlineRef.current, { y: 0, opacity: 1 });
          gsap.set(cards, { y: 0, opacity: 1, rotateX: 0 });
          gsap.set(ctaRef.current, { y: 0, opacity: 1 });
        },
      },
    });

    if (scrollTl.scrollTrigger) {
      triggersRef.current.push(scrollTl.scrollTrigger);
    }

    // INSET / REVEAL (0% - 30%)
    scrollTl.fromTo(
      imageRef.current,
      { scale: 1.2, filter: 'brightness(0.3)' },
      { scale: 1, filter: 'brightness(0.7)', ease: 'none' },
      0
    );

    scrollTl.fromTo(
      headlineRef.current,
      { scale: 1.1, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, ease: 'power4.out' },
      0
    );

    // Staggered 3D reveal for cards (10% - 60%)
    Array.from(cards).forEach((card, i) => {
      const delay = 0.1 + i * 0.15;
      
      scrollTl.fromTo(
        card,
        { 
          y: '60vh', 
          opacity: 0, 
          rotateX: 60, 
          z: -400 
        },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          z: 0, 
          ease: 'power3.out' 
        },
        delay
      );
      
      // Add a subtle drift/parallax during the "stop" phase
      scrollTl.to(
        card,
        { 
          y: -40 - (i * 20), // Diferent parallax levels
          duration: 1,
          ease: 'none'
        },
        0.6
      );
    });

    scrollTl.fromTo(
      ctaRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power3.out' },
      0.5
    );

    // EXIT (85% - 100%)
    scrollTl.to(
      imageRef.current,
      { scale: 0.9, opacity: 0, y: -50, ease: 'power2.in' },
      0.85
    );

    scrollTl.to(
      headlineRef.current,
      { y: -80, opacity: 0, ease: 'power2.in' },
      0.85
    );

    Array.from(cards).forEach((card, i) => {
      scrollTl.to(
        card,
        { 
          y: '-80vh', 
          opacity: 0, 
          rotateX: -30, 
          z: 200,
          ease: 'power2.in' 
        },
        0.85 + (i * 0.05)
      );
    });

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleWishlist = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const scrollToCollection = () => {
    const collectionSection = document.getElementById('all-products');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="shop"
      className="relative h-screen w-full overflow-hidden z-[60]"
    >
      {/* Background image */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={shopConfig.backgroundImage}
          alt="Shop background"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.7)' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[6vw]">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-[clamp(34px,4vw,64px)] font-bold text-white tracking-tight mb-12"
          style={{ willChange: 'transform, opacity' }}
        >
          {shopConfig.title}
        </h2>

        {/* Product cards */}
        <div
          ref={cardsRef}
          className="flex flex-wrap justify-center gap-6 w-full max-w-6xl"
          style={{ perspective: '1000px' }}
        >
          {shopConfig.products.map((product) => (
            <div
              key={product.id}
              onClick={() => openQuickView(product)}
              className="group w-full sm:w-[280px] bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Image */}
              <div className="relative h-[320px] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Wishlist button */}
                <button
                  onClick={(e) => handleWishlist(product, e)}
                  className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'fill-[#D4A24F] text-[#D4A24F]' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="text-white font-medium text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[#D4A24F] font-semibold">${product.price}</span>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#D4A24F] hover:text-black text-white rounded-lg transition-all duration-300 text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          ref={ctaRef}
          onClick={scrollToCollection}
          className="mt-12 text-white text-lg font-medium group flex items-center gap-2"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="relative">
            {shopConfig.ctaText}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#D4A24F] group-hover:w-full transition-all duration-300" />
          </span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
