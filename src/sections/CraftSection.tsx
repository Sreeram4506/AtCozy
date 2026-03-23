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
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const features = featuresRef.current;
    if (!section || !image || !content || !features) return;

    const featureItems = features.children;

    // Image parallax animation
    const imageTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(image, {
          y: -self.progress * 60,
        });
      },
    });
    triggersRef.current.push(imageTrigger);

    // Image reveal
    gsap.fromTo(
      image,
      { x: '-8vw', opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 45%',
          scrub: 1,
        },
      }
    );

    // Content reveal
    gsap.fromTo(
      content,
      { x: '6vw', opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'top 40%',
          scrub: 1,
        },
      }
    );

    // Features stagger reveal
    gsap.fromTo(
      featureItems,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: features,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="craft"
      className="relative py-[20vh] bg-[#0B0B0D]"
    >
      <div className="max-w-7xl mx-auto px-[6vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative aspect-[4/5] rounded-lg overflow-hidden"
            style={{ willChange: 'transform, opacity' }}
          >
            <img
              src={craftConfig.image}
              alt="Craft detail"
              className="w-full h-full object-cover"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:pl-8" style={{ willChange: 'transform, opacity' }}>
            <h2 className="text-[clamp(34px,4vw,64px)] font-bold text-white leading-tight tracking-tight mb-6">
              {craftConfig.title}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {craftConfig.description}
            </p>

            {/* Features list */}
            <div ref={featuresRef} className="space-y-4">
              {craftConfig.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4A24F]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A24F]/30 transition-colors">
                    <Check className="w-4 h-4 text-[#D4A24F]" />
                  </div>
                  <span className="text-white/80 text-base">{feature}</span>
                </div>
              ))}
            </div>

            {/* Decorative line */}
            <div className="mt-10 h-px w-24 bg-gradient-to-r from-[#D4A24F] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
