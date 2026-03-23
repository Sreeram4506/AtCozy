import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const bottomLeftRef = useRef<HTMLSpanElement>(null);
  const bottomRightRef = useRef<HTMLSpanElement>(null);
  const [, setLoaded] = useState(false);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  if (!heroConfig.title) return null;

  useEffect(() => {
    // Entry animation on load
    const tl = gsap.timeline({ delay: 0.2 });

    // Image scale + fade
    tl.fromTo(
      imageRef.current,
      { scale: 1.08, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' }
    );

    // Title characters animation
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char');
      tl.fromTo(
        chars,
        { y: 40, opacity: 0, rotateX: -45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
        },
        '-=1.2'
      );
    }

    // Subtitle fade
    tl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );

    // CTA fade
    tl.fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    );

    // Bottom text fade
    tl.fromTo(
      [bottomLeftRef.current, bottomRightRef.current],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    setLoaded(true);

    // Scroll effects - EXIT only (entrance handled on load)
    const trigger1 = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '50% top',
      scrub: 1,
      onUpdate: (self) => {
        if (imageRef.current) {
          gsap.set(imageRef.current, {
            y: `${self.progress * 30}%`,
            opacity: 1 - self.progress * 0.5,
          });
        }
      },
    });
    triggersRef.current.push(trigger1);

    const trigger2 = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '40% top',
      scrub: 1,
      onUpdate: (self) => {
        if (titleRef.current) {
          gsap.set(titleRef.current, {
            y: -50 * self.progress,
            opacity: 1 - self.progress * 0.7,
          });
        }
      },
    });
    triggersRef.current.push(trigger2);

    return () => {
      tl.kill();
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const titleChars = heroConfig.title.split('');

  const scrollToCollection = () => {
    const collectionSection = document.getElementById('all-products');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Main background image */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0"
        style={{
          willChange: 'transform, opacity',
        }}
      >
        <img
          src={heroConfig.backgroundImage}
          alt="Hero"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.85)' }}
        />
      </div>

      {/* Content container */}
      <div
        className="relative z-20 h-full w-full flex flex-col justify-center items-center px-8"
      >
        {/* Main title */}
        <h1
          ref={titleRef}
          className="text-[clamp(80px,15vw,200px)] font-bold text-white tracking-tighter mb-2"
          style={{
            textShadow: '0 0 60px rgba(212, 162, 79, 0.2)',
            willChange: 'transform, opacity',
          }}
        >
          {titleChars.map((char, i) => (
            <span
              key={i}
              className="char inline-block"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl font-light text-white/70 tracking-[0.3em] uppercase mb-8"
          style={{ willChange: 'opacity' }}
        >
          {heroConfig.subtitle}
        </p>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          onClick={scrollToCollection}
          className="px-8 py-4 border border-white/30 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 group"
          style={{ willChange: 'opacity' }}
        >
          <span className="relative">
            {heroConfig.ctaText}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#D4A24F] group-hover:w-full transition-all duration-300" />
          </span>
        </button>
      </div>

      {/* Bottom left */}
      <span
        ref={bottomLeftRef}
        className="absolute left-[6vw] bottom-[6vh] z-30 text-white/50 text-sm"
        style={{ willChange: 'opacity' }}
      >
        {heroConfig.bottomLeft}
      </span>

      {/* Bottom right */}
      <span
        ref={bottomRightRef}
        className="absolute right-[6vw] bottom-[6vh] z-30 text-white/50 text-sm text-right"
        style={{ willChange: 'opacity' }}
      >
        {heroConfig.bottomRight}
      </span>
    </section>
  );
}
