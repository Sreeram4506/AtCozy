import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, ShoppingBag, Heart, Minus, Plus } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';

export function QuickViewModal() {
  const { isQuickViewOpen, selectedProduct, closeQuickView } = useUIStore();
  const { addToCart, toggleWishlist, isInWishlist } = useCartStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (isQuickViewOpen && selectedProduct) {
      setQuantity(1);
      setSelectedSize(selectedProduct.sizes?.[0] || '');
      setSelectedColor(selectedProduct.colors?.[0] || '');

      gsap.to(modalRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.4,
        ease: 'power3.out'
      });
      
      gsap.fromTo(contentRef.current,
        { scale: 0.95, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power4.out' }
      );
    } else {
      gsap.to(modalRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power3.in'
      });
    }
  }, [isQuickViewOpen, selectedProduct]);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      size: selectedSize,
    });
    closeQuickView();
  };

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-[1500] flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 invisible`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuickView();
      }}
    >
      <div
        ref={contentRef}
        className="relative bg-[#0B0B0D] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-hidden md:rounded-2xl border border-white/10 flex flex-col md:flex-row shadow-[0_0_50px_rgba(212,162,79,0.1)]"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 h-1/2 md:h-[600px] overflow-hidden bg-white/5">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover transition-transform duration-1000"
          />
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-10 flex flex-col h-1/2 md:h-auto justify-center overflow-y-auto">
          <span className="text-[#D4A24F] text-xs tracking-widest uppercase mb-4 block">
            {selectedProduct.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {selectedProduct.name}
          </h2>
          <p className="text-2xl text-white/90 mb-6 font-light">
            ${selectedProduct.price}
          </p>
          <div className="h-px w-full bg-white/10 mb-8" />
          
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            {selectedProduct.description || "Crafted with the highest attention to detail, this piece represents our boutique's commitment to European elegance and style."}
          </p>

          {/* Color Selection */}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div className="mb-6">
              <span className="text-xs text-white/40 uppercase tracking-widest mb-3 block">Color</span>
              <div className="flex gap-3">
                {selectedProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                      selectedColor === color ? 'border-[#D4A24F]' : 'border-transparent'
                    }`}
                  >
                    <div 
                      className="w-full h-full rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div className="mb-8">
              <span className="text-xs text-white/40 uppercase tracking-widest mb-3 block">Size</span>
              <div className="flex gap-2">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-[44px] border transition-all text-sm font-medium ${
                      selectedSize === size 
                        ? 'border-[#D4A24F] bg-[#D4A24F] text-black' 
                        : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mt-auto">
            {/* Quantity */}
            <div className="flex items-center h-14 border border-white/10 rounded-lg px-4 gap-6">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-white/60 hover:text-white transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-medium min-w-[20px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Final CTA */}
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-[#D4A24F] hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3 rounded-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Wishlist/Cart
            </button>
            
            <button
              onClick={() => toggleWishlist(selectedProduct.id)}
              className={`w-14 h-14 border border-white/10 rounded-lg flex items-center justify-center transition-all ${
                isInWishlist(selectedProduct.id) ? 'bg-[#D4A24F]/10 border-[#D4A24F]' : 'hover:border-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(selectedProduct.id) ? 'fill-[#D4A24F] text-[#D4A24F]' : 'text-white/60'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
