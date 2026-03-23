import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { signatureConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function Signature() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const bottomLeftRef = useRef<HTMLSpanElement>(null);
  const bottomRightRef = useRef<HTMLSpanElement>(null);
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
          gsap.set(headlineRef.current, { scale: 1, opacity: 1 });
          gsap.set(subtitleRef.current, { y: 0, opacity: 1 });
          gsap.set(bottomLeftRef.current, { opacity: 1 });
          gsap.set(bottomRightRef.current, { opacity: 1 });
        },
      },
    });

    if (scrollTl.scrollTrigger) {
      triggersRef.current.push(scrollTl.scrollTrigger);
    }

    // ENTRANCE (0% - 30%)
    scrollTl.fromTo(
      headlineRef.current,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'none' },
      0
    );

    scrollTl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.1
    );

    scrollTl.fromTo(
      [bottomLeftRef.current, bottomRightRef.current],
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.15
    );

    // EXIT (70% - 100%)
    scrollTl.fromTo(
      headlineRef.current,
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
      0.85
    );

    scrollTl.fromTo(
      subtitleRef.current,
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
      0.88
    );

    scrollTl.fromTo(
      [bottomLeftRef.current, bottomRightRef.current],
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
      0.9
    );

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="signature"
      className="relative h-screen w-full overflow-hidden bg-[#0B0B0D] flex items-center justify-center"
    >
      {/* Content */}
      <div className="text-center">
        <h2
          ref={headlineRef}
          className="text-[clamp(80px,15vw,200px)] font-bold text-white tracking-tighter leading-none"
          style={{ willChange: 'transform, opacity' }}
        >
          {signatureConfig.title}
        </h2>
        <p
          ref={subtitleRef}
          className="mt-6 text-white/50 text-lg tracking-wide"
          style={{ willChange: 'transform, opacity' }}
        >
          {signatureConfig.subtitle}
        </p>
      </div>

      {/* Bottom left */}
      <span
        ref={bottomLeftRef}
        className="absolute left-[6vw] bottom-[6vh] text-white/40 text-sm"
        style={{ willChange: 'opacity' }}
      >
        {signatureConfig.bottomLeft}
      </span>

      {/* Bottom right */}
      <span
        ref={bottomRightRef}
        className="absolute right-[6vw] bottom-[6vh] text-white/40 text-sm"
        style={{ willChange: 'opacity' }}
      >
        {signatureConfig.bottomRight}
      </span>
    </section>
  );
}
