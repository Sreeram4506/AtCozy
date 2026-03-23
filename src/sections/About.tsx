import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aboutConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        onLeaveBack: () => {
          gsap.set(leftImageRef.current, { x: 0, opacity: 1 });
          gsap.set(rightImageRef.current, { x: 0, opacity: 1 });
          gsap.set(headlineRef.current, { y: 0, opacity: 1 });
          gsap.set(lineRef.current, { scaleY: 1 });
          gsap.set(ctaRef.current, { y: 0, opacity: 1 });
        },
      },
    });

    if (scrollTl.scrollTrigger) {
      triggersRef.current.push(scrollTl.scrollTrigger);
    }

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(
      leftImageRef.current,
      { x: '-60vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      rightImageRef.current,
      { x: '60vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      headlineRef.current,
      { y: '10vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.05
    );

    scrollTl.fromTo(
      lineRef.current,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none' },
      0.1
    );

    scrollTl.fromTo(
      ctaRef.current,
      { y: '4vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.2
    );

    // EXIT (70% - 100%)
    scrollTl.fromTo(
      leftImageRef.current,
      { x: 0, opacity: 1 },
      { x: '-18vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      rightImageRef.current,
      { x: 0, opacity: 1 },
      { x: '18vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      headlineRef.current,
      { y: 0, opacity: 1 },
      { y: '-10vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      lineRef.current,
      { scaleY: 1 },
      { scaleY: 0, ease: 'power2.in' },
      0.75
    );

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const scrollToAbout = () => {
    const craftSection = document.getElementById('craft');
    if (craftSection) {
      craftSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Left image panel */}
      <div
        ref={leftImageRef}
        className="absolute left-0 top-0 w-1/2 h-full z-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={aboutConfig.image1}
          alt={aboutConfig.image1Alt}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.9)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      {/* Right image panel */}
      <div
        ref={rightImageRef}
        className="absolute right-0 top-0 w-1/2 h-full z-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={aboutConfig.image2}
          alt={aboutConfig.image2Alt}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.85)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
      </div>

      {/* Center vertical line */}
      <div
        ref={lineRef}
        className="absolute left-1/2 top-[10vh] h-[80vh] w-px bg-white/20 z-10"
        style={{ 
          transform: 'translateX(-50%)',
          transformOrigin: 'center',
          willChange: 'transform'
        }}
      />

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8">
        <h2
          ref={headlineRef}
          className="text-[clamp(44px,6vw,96px)] font-bold text-white leading-[0.92] tracking-tight text-center max-w-[70vw]"
          style={{ willChange: 'transform, opacity' }}
        >
          {aboutConfig.titleLine1}{' '}
          <span className="text-[#D4A24F]">{aboutConfig.titleLine2}</span>
        </h2>

        <button
          ref={ctaRef}
          onClick={scrollToAbout}
          className="mt-8 text-white text-lg font-medium group flex items-center gap-2"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="relative">
            {aboutConfig.ctaText}
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
