import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { shopConfig, collectionConfig } from '../config';

export function WishlistOverlay() {
  const { isWishlistOpen, closeWishlist, openQuickView } = useUIStore();
  const { wishlist, toggleWishlist, addToCart } = useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => [
    ...shopConfig.products,
    ...collectionConfig.items
  ], []);

  const wishlistProducts = useMemo(() => {
    return allProducts.filter(p => wishlist.includes(p.id));
  }, [wishlist, allProducts]);

  useEffect(() => {
    if (isWishlistOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.4,
        ease: 'power3.out'
      });
      gsap.to(panelRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power4.out'
      });
    } else {
      gsap.to(panelRef.current, {
        x: 40,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in'
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power3.in'
      });
    }
  }, [isWishlistOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm opacity-0 invisible flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWishlist();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg h-full bg-[#0B0B0D] border-l border-white/10 p-10 flex flex-col shadow-[-10px_0_50px_rgba(0,0,0,0.5)] translate-x-10 opacity-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-[#D4A24F] fill-[#D4A24F]" />
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
              Wishlist
            </h2>
          </div>
          <button
            onClick={closeWishlist}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white/20" />
              </div>
              <div>
                <p className="text-white text-lg font-medium mb-2">Your wishlist is empty</p>
                <p className="text-white/40 text-sm max-w-[240px]">
                  Save your favorite European designs to view them later.
                </p>
              </div>
              <button
                onClick={closeWishlist}
                className="px-8 py-3 bg-[#D4A24F] text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-lg"
              >
                Go to Boutique
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex gap-6 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative overflow-hidden"
                >
                  <div 
                    className="w-24 h-32 overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer"
                    onClick={() => openQuickView(product as any)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <span className="text-[#D4A24F] text-[10px] uppercase tracking-widest">
                      {product.category}
                    </span>
                    <h3 
                      className="text-white text-lg font-medium group-hover:text-[#D4A24F] transition-colors cursor-pointer"
                      onClick={() => openQuickView(product as any)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-white/90 text-lg font-light">
                      ${product.price}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <button 
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          });
                        }}
                        className="flex items-center gap-2 text-xs text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-[#D4A24F] hover:text-black transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Move to Bag
                      </button>
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="text-xs text-white/30 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <button
              onClick={closeWishlist}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-xl transition-all"
            >
              Continue Browsing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
