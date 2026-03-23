import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { X, Search, ArrowRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { shopConfig, collectionConfig } from '../config';

export function SearchOverlay() {
  const { isSearchOpen, closeSearch, openQuickView } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => [
    ...shopConfig.products,
    ...collectionConfig.items
  ], []);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allProducts]);

  useEffect(() => {
    if (isSearchOpen) {
      setSearchQuery('');
      gsap.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.5,
        ease: 'power3.out'
      });
      
      gsap.fromTo(inputRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power4.out' }
      );
      
      const timeout = setTimeout(() => inputRef.current?.focus(), 500);
      return () => clearTimeout(timeout);
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.4,
        ease: 'power3.in'
      });
    }
  }, [isSearchOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl opacity-0 invisible flex flex-col p-[10vw]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <span className="text-[#D4A24F] text-sm tracking-[0.4em] uppercase font-bold">
          Search Boutique
        </span>
        <button
          onClick={closeSearch}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Input */}
      <div className="relative mb-20 max-w-4xl mx-auto w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="What are you looking for?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-b-2 border-white/10 py-8 text-4xl md:text-6xl text-white placeholder-white/20 focus:outline-none focus:border-[#D4A24F] transition-all font-light"
        />
        <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 text-white/20" />
      </div>

      {/* Results */}
      <div 
        ref={resultsRef}
        className="flex-1 overflow-y-auto hide-scrollbar max-w-4xl mx-auto w-full"
      >
        {searchQuery && results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-xl font-light italic">
              No products found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  openQuickView(product as any);
                  closeSearch();
                }}
                className="group flex gap-6 cursor-pointer hover:bg-white/5 p-4 transition-all rounded-xl"
              >
                <div className="w-24 h-32 overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[#D4A24F] text-[10px] uppercase tracking-widest mb-2 block">
                    {product.category}
                  </span>
                  <h3 className="text-white text-xl font-medium mb-1 group-hover:translate-x-1 transition-transform">
                    {product.name}
                  </h3>
                  <p className="text-white/50 text-base font-light">
                    ${product.price}
                  </p>
                </div>
                <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-[#D4A24F]" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Popular Tags */}
        {!searchQuery && (
          <div className="mt-20">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Popular Categories</p>
            <div className="flex flex-wrap gap-4">
              {['Dresses', 'Tops', 'Footwear', 'Accessories', 'Evening Wear'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/70 hover:bg-[#D4A24F] hover:text-black hover:border-[#D4A24F] transition-all text-sm tracking-wide"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
