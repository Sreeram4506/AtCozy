import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { newsletterConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function Newsletter() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!section || !left || !right) return;

    // Left column reveal
    gsap.fromTo(
      left,
      { x: '-4vw', opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Right column reveal
    gsap.fromTo(
      right,
      { x: '4vw', opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative pt-[12vh] pb-[8vh] bg-[#F4F4F2]"
    >
      <div className="max-w-7xl mx-auto px-[6vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Newsletter form */}
          <div ref={leftRef} style={{ willChange: 'transform, opacity' }}>
            <h2 className="text-[clamp(34px,4vw,64px)] font-bold text-[#0B0B0D] leading-tight tracking-tight mb-4">
              {newsletterConfig.title}
            </h2>
            <p className="text-[#0B0B0D]/60 text-lg mb-8">
              {newsletterConfig.description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-[#0B0B0D]/80 text-sm mb-2">
                  {newsletterConfig.emailLabel}
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 bg-white border border-[#0B0B0D]/10 rounded-lg text-[#0B0B0D] placeholder:text-[#0B0B0D]/40 focus:outline-none focus:border-[#D4A24F] transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#0B0B0D] text-white rounded-lg hover:bg-[#D4A24F] hover:text-black transition-colors flex items-center gap-2"
                  >
                    {newsletterConfig.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isSubmitted && (
                <p className="text-green-600 text-sm">Thank you for subscribing!</p>
              )}

              <p className="text-[#0B0B0D]/40 text-xs">
                {newsletterConfig.microcopy}
              </p>
            </form>
          </div>

          {/* Right - Contact info */}
          <div ref={rightRef} className="lg:pl-8" style={{ willChange: 'transform, opacity' }}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0B0B0D]/5 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#0B0B0D]" />
                </div>
                <div>
                  <p className="text-[#0B0B0D]/50 text-sm">Email</p>
                  <a
                    href={`mailto:${newsletterConfig.contactEmail}`}
                    className="text-[#0B0B0D] font-medium hover:text-[#D4A24F] transition-colors"
                  >
                    {newsletterConfig.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0B0B0D]/5 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#0B0B0D]" />
                </div>
                <div>
                  <p className="text-[#0B0B0D]/50 text-sm">Phone</p>
                  <a
                    href={`tel:${newsletterConfig.contactPhone}`}
                    className="text-[#0B0B0D] font-medium hover:text-[#D4A24F] transition-colors"
                  >
                    {newsletterConfig.contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0B0B0D]/5 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0B0B0D]" />
                </div>
                <div>
                  <p className="text-[#0B0B0D]/50 text-sm">Locations</p>
                  <p className="text-[#0B0B0D] font-medium">
                    {newsletterConfig.contactLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
