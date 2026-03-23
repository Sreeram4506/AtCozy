import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { finalSceneConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function FinalScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        onLeaveBack: () => {
          gsap.set(imageRef.current, { scale: 1, y: 0, opacity: 1 });
          gsap.set(headlineRef.current, { x: 0, opacity: 1 });
          gsap.set(ctaRef.current, { y: 0, opacity: 1 });
        },
      },
    });

    if (scrollTl.scrollTrigger) {
      triggersRef.current.push(scrollTl.scrollTrigger);
    }

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(
      imageRef.current,
      { scale: 1.08, opacity: 0.7 },
      { scale: 1, opacity: 1, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      headlineRef.current,
      { x: '-18vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0.05
    );

    scrollTl.fromTo(
      ctaRef.current,
      { y: '6vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.12
    );

    // EXIT (70% - 100%)
    scrollTl.fromTo(
      imageRef.current,
      { scale: 1, y: 0 },
      { scale: 1.04, y: '-8vh', ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      headlineRef.current,
      { x: 0, opacity: 1 },
      { x: '-10vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      ctaRef.current,
      { y: 0, opacity: 1 },
      { y: '4vh', opacity: 0, ease: 'power2.in' },
      0.75
    );

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const scrollToShop = () => {
    const shopSection = document.getElementById('all-products');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="final-scene"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background image */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={finalSceneConfig.backgroundImage}
          alt="Final scene"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.75)' }}
        />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-[18vh] px-[6vw]">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-[clamp(44px,6vw,96px)] font-bold text-white leading-[0.92] tracking-tight max-w-[60vw]"
          style={{ willChange: 'transform, opacity' }}
        >
          Your{' '}
          <span className="text-[#D4A24F]">next</span>{' '}
          chapter.
        </h2>

        {/* CTA */}
        <button
          ref={ctaRef}
          onClick={scrollToShop}
          className="mt-8 text-white text-lg font-medium group flex items-center gap-2 w-fit"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="relative">
            {finalSceneConfig.ctaText}
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
