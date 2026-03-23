import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Animate in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(drawerRef.current, {
        x: 0,
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.fromTo(
        contentRef.current?.children || [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.2 }
      );
    } else {
      document.body.style.overflow = '';
      
      // Animate out
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isOpen]);

  const { isAuthenticated, openAuthModal } = useAuth();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCartOpen(false);
      openAuthModal('login');
      return;
    }

    try {
      // In a real app, we'd call api.orders.create({ items, totalPrice: getTotalPrice() }, token);
      // For now, let's simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1500));
      clearCart();
      setCartOpen(false);
      alert('Order placed successfully! Thank you for shopping with AtCozy.');
    } catch (err) {
      alert('Checkout failed. Please try again.');
    }
  };

  if (!isOpen && items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1100] pointer-events-none">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
        style={{ opacity: 0 }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0B0B0D] pointer-events-auto flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#D4A24F]" />
            <h2 className="text-xl font-medium text-white">Your Bag</h2>
            <span className="text-sm text-white/50">({items.length} items)</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/60 text-lg mb-2">Your bag is empty</p>
              <p className="text-white/40 text-sm">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 p-4 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors"
                >
                  {/* Image */}
                  <div className="w-20 h-24 bg-white/10 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium truncate pr-2">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                    {item.size && (
                      <p className="text-white/50 text-sm mt-0.5">Size: {item.size}</p>
                    )}
                    <p className="text-[#D4A24F] font-medium mt-1">${item.price}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white text-xl font-medium">${getTotalPrice()}</span>
            </div>
            <p className="text-white/40 text-xs">Shipping calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#D4A24F] text-black font-medium rounded-lg hover:bg-[#c49345] transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
