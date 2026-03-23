import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const portraitStudyConfig = {
  backgroundImage: '/images/portrait-study.jpg',
  ctaText: 'View the collection',
};

gsap.registerPlugin(ScrollTrigger);

export function PortraitStudy() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const darkFieldRef = useRef<HTMLDivElement>(null);
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
          gsap.set(imageRef.current, { x: 0, opacity: 1 });
          gsap.set(darkFieldRef.current, { x: 0, opacity: 1 });
          gsap.set(headlineRef.current, { y: 0, opacity: 1 });
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
      { x: '-70vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      darkFieldRef.current,
      { x: '45vw' },
      { x: 0, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      headlineRef.current,
      { y: '12vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.08
    );

    scrollTl.fromTo(
      ctaRef.current,
      { y: '6vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.15
    );

    // EXIT (70% - 100%)
    scrollTl.fromTo(
      imageRef.current,
      { x: 0, opacity: 1 },
      { x: '-18vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      darkFieldRef.current,
      { x: 0, opacity: 1 },
      { x: '10vw', opacity: 0.6, ease: 'power2.in' },
      0.7
    );

    scrollTl.fromTo(
      headlineRef.current,
      { y: 0, opacity: 1 },
      { y: '-8vh', opacity: 0, ease: 'power2.in' },
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

  const scrollToCollection = () => {
    const collectionSection = document.getElementById('all-products');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="portrait-study"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Left portrait image */}
      <div
        ref={imageRef}
        className="absolute left-0 top-0 w-[55vw] h-full z-0"
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={portraitStudyConfig.backgroundImage || '/images/portrait-study.jpg'}
          alt="Portrait study"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.9)' }}
        />
      </div>

      {/* Right dark field */}
      <div
        ref={darkFieldRef}
        className="absolute right-0 top-0 w-[45vw] h-full bg-[#0B0B0D] z-10"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Content on right */}
      <div className="absolute right-0 top-0 w-[45vw] h-full flex flex-col justify-center px-[6vw] z-20">
        <h2
          ref={headlineRef}
          className="text-[clamp(34px,4.5vw,72px)] font-bold text-white leading-[0.92] tracking-tight"
          style={{ willChange: 'transform, opacity' }}
        >
          Details that{' '}
          <span className="text-[#D4A24F]">speak.</span>
        </h2>

        <button
          ref={ctaRef}
          onClick={scrollToCollection}
          className="mt-8 text-white text-lg font-medium group flex items-center gap-2 w-fit"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="relative">
            View the collection
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

      {/* Vertical line separator */}
      <div className="absolute left-[55vw] top-[10vh] h-[80vh] w-px bg-white/10 z-20" />
    </section>
  );
}
