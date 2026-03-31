import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';
import { craftConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function CraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Parallax for the image inside its container
      const img = imageRef.current?.querySelector('img');
      if (img) {
        gsap.to(img, {
          y: '-15%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Entry reveal for the image container
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 60,
          opacity: 0,
          scale: 0.98,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Entry reveal for the content
      if (contentRef.current) {
        gsap.from(contentRef.current, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Features stagger reveal
      if (featuresRef.current && featuresRef.current.children.length > 0) {
        gsap.from(featuresRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="craft"
      className="relative py-[20vh] bg-[#0B0B0D] overflow-hidden z-20 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-[6vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden group shadow-2xl bg-white/5"
          >
            <img
              src={craftConfig.image}
              alt="Craft detail"
              className="w-full h-full object-cover scale-110"
              onLoad={() => {
                // Refresh ScrollTrigger when image loads to ensure correct positions
                ScrollTrigger.refresh();
              }}
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
            
            {/* Floating badge for added detail */}
            <div className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-[#D4A24F] text-xs uppercase tracking-widest mb-1">Authentic Design</p>
              <h4 className="text-white text-lg font-medium">European Quality</h4>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="relative">
            <span className="text-[#D4A24F] text-sm tracking-[0.4em] uppercase mb-6 block font-medium">
              The Art of Style
            </span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold text-white leading-tight tracking-tight mb-8">
              {craftConfig.title}
            </h2>
            <p className="text-white/70 text-lg lg:text-xl leading-relaxed mb-12 max-w-xl">
              {craftConfig.description}
            </p>

            {/* Features list */}
            <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {craftConfig.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group/item"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A24F]/10 flex items-center justify-center flex-shrink-0 border border-[#D4A24F]/20 group-hover/item:bg-[#D4A24F]/20 transition-all duration-300">
                    <Check className="w-5 h-5 text-[#D4A24F]" />
                  </div>
                  <span className="text-white/80 text-base font-light tracking-wide">{feature}</span>
                </div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="mt-16 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-[#D4A24F] to-transparent opacity-30" />
              <div className="w-2 h-2 rounded-full bg-[#D4A24F] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
