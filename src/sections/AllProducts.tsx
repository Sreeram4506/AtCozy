import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingBag, Search, LayoutGrid, List } from 'lucide-react';
import { shopConfig, collectionConfig } from '../config';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { api } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

export function AllProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCartStore();
  const { openQuickView } = useUIStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((p: any) => ({ ...p, source: 'Collection' })));
        } else {
          // Fallback to config if API fails or is empty
          const fallback = [
            ...shopConfig.products.map(p => ({ ...p, source: 'New Arrival' })),
            ...collectionConfig.items.map(p => ({ ...p, source: 'Collection', category: p.category || 'Essential' }))
          ];
          setProducts(fallback);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
        const fallback = [
          ...shopConfig.products.map(p => ({ ...p, source: 'New Arrival' })),
          ...collectionConfig.items.map(p => ({ ...p, source: 'Collection', category: p.category || 'Essential' }))
        ];
        setProducts(fallback);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleFilter = (e: any) => {
      setFilter(e.detail);
    };
    window.addEventListener('filterProducts', handleFilter);
    return () => window.removeEventListener('filterProducts', handleFilter);
  }, []);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter || p.source === filter);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Title reveal
    gsap.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        }
      }
    );

    // Staggered grid reveal
    const cards = gridRef.current?.children;
    if (cards) {
      gsap.fromTo(
        Array.from(cards),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          }
        }
      );
    }
  }, [filter, products]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="all-products"
      className="relative py-[20vh] bg-[#0B0B0D]"
    >
      <div className="max-w-7xl mx-auto px-[6vw]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
          <div className="max-w-[600px]">
            <span className="text-[#D4A24F] text-sm tracking-[0.3em] uppercase mb-4 block">
              Curated Excellence
            </span>
            <h2
              ref={titleRef}
              className="text-[clamp(44px,6vw,96px)] font-bold text-white leading-[0.92] tracking-tight"
            >
              Shop the <span className="text-[#D4A24F]">Whole</span> Universe.
            </h2>
          </div>

          {/* Filtering & Layout UI */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full overflow-x-auto hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 px-3 py-1 rounded-full ${
                    filter === cat 
                    ? 'bg-[#D4A24F] text-black' 
                    : 'text-white/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div
          ref={gridRef}
          className={`grid gap-x-8 gap-y-16 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          {filteredProducts.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className={`group relative ${viewMode === 'list' ? 'flex flex-row items-center gap-12 pb-12 border-b border-white/5' : ''}`}
            >
              {/* Image Container */}
              <div 
                className={`relative overflow-hidden bg-white/5 aspect-[3/4] cursor-pointer ${viewMode === 'list' ? 'w-[200px] flex-shrink-0' : 'w-full mb-6'}`}
                onClick={() => openQuickView(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Badge */}
                <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest text-white/80 border border-white/10">
                  {product.source}
                </span>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openQuickView(product); }}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#D4A24F] transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-12 h-12 rounded-full bg-[#D4A24F] text-black flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div 
                className={`cursor-pointer ${viewMode === 'list' ? 'flex-1' : ''}`}
                onClick={() => openQuickView(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[#D4A24F] text-[10px] uppercase tracking-[0.2em] mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-xl font-medium text-white group-hover:text-[#D4A24F] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <span className="text-lg font-light text-white/90">
                    ${product.price}
                  </span>
                </div>
                {viewMode === 'list' && (
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="mt-6 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 hover:border-[#D4A24F] text-white text-sm tracking-widest uppercase transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#D4A24F]" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
