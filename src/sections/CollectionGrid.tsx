import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, ShoppingBag, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { collectionConfig } from '../config';
import { useCartStore } from '../store/cartStore';

gsap.registerPlugin(ScrollTrigger);

export function CollectionGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart, toggleWishlist, isInWishlist } = useCartStore();

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;
    if (!section || !header || !grid) return;

    const gridItems = grid.children;

    // Header reveal
    gsap.fromTo(
      header,
      { y: 16, opacity: 0 },
      {
        y: 0,
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

    // Grid items stagger reveal
    gsap.fromTo(
      gridItems,
      { y: 40, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const handleAddToCart = (item: typeof collectionConfig.items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="collection"
      className="relative py-[10vh] bg-[#F4F4F2] z-[80]"
    >
      <div className="max-w-7xl mx-auto px-[6vw]">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
        >
          <h2 className="text-[clamp(34px,4vw,64px)] font-bold text-[#0B0B0D] tracking-tight">
            {collectionConfig.title}
          </h2>
          
          {/* Filter/Sort buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#0B0B0D]/10 rounded-lg text-[#0B0B0D] hover:bg-[#0B0B0D] hover:text-white transition-colors text-sm">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#0B0B0D]/10 rounded-lg text-[#0B0B0D] hover:bg-[#0B0B0D] hover:text-white transition-colors text-sm">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {collectionConfig.items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-3 bg-white rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#D4A24F]"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#0B0B0D]" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    className="p-3 bg-white rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 hover:bg-[#D4A24F]"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isInWishlist(item.id) ? 'fill-[#D4A24F] text-[#D4A24F]' : 'text-[#0B0B0D]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-[#0B0B0D] font-medium text-lg mb-1">{item.name}</h3>
                <p className="text-[#0B0B0D]/60 font-semibold">${item.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border-2 border-[#0B0B0D] text-[#0B0B0D] font-medium rounded-lg hover:bg-[#0B0B0D] hover:text-white transition-colors">
            Load More
          </button>
        </div>
      </div>
    </section>
  );
}
