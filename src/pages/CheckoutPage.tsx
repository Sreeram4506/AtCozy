import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, ChevronDown, Circle, Download, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import gsap from 'gsap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../components/checkout/StripePaymentForm';

// Initialize Stripe outside of component to avoid recreation
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    mobile: user?.phone || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    streetAddress: '',
    city: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [promoEmails, setPromoEmails] = useState(true);
  const [promoTexts, setPromoTexts] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = 3.99;
  const taxesAndFees = parseFloat((subtotal * 0.08).toFixed(2));
  const total = subtotal + deliveryFee + taxesAndFees;

  // Initialize PaymentIntent on load for Card payments
  useEffect(() => {
    if (items.length > 0 && isAuthenticated && paymentMethod === 'card' && !clientSecret) {
      const initPayment = async () => {
        try {
          const { clientSecret: secret } = await api.payments.createIntent({
            amount: total,
            currency: 'usd',
          });
          setClientSecret(secret);
        } catch (err) {
          console.error('Failed to init payment:', err);
          toast.error('Unable to initialize payment gateway. Please refresh.');
        }
      };
      initPayment();
    }
  }, [items, isAuthenticated, paymentMethod, total, clientSecret]);

  // Layout entrance animation
  useEffect(() => {
    gsap.fromTo('.checkout-element', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to continue to checkout');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting && !showSuccessModal) {
      navigate('/');
    }
  }, [items, navigate, isSubmitting, showSuccessModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    toast.info("Discovering your current location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error('Failed to fetch address');
          const data = await response.json();
          const addr = data.address;
          
          if (addr) {
            setFormData(prev => ({
              ...prev,
              streetAddress: addr.road || addr.pedestrian || addr.suburb || addr.house_number || '',
              city: addr.city || addr.town || addr.village || addr.municipality || '',
              zipCode: addr.postcode || ''
            }));
            toast.success("Delivery address updated successfully");
          } else {
            throw new Error('No address found for these coordinates');
          }
        } catch (error) {
          console.error(error);
          toast.error("Could not resolve address. Please enter it manually.");
        }
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    if (!formData.streetAddress || !formData.city || !formData.zipCode) {
      toast.error('Please complete your delivery details');
      return;
    }

    if (paymentMethod === 'card' && !clientSecret) {
      toast.error('Payment gateway not ready. Please try again.');
      return;
    }

    // Capture payment first if using card
    if (paymentMethod === 'card') {
      const submitBtn = document.getElementById('submit-payment');
      if (submitBtn) {
        submitBtn.click();
        return; // wait for StripePaymentForm to callback via handlePaymentSuccess
      }
    }

    // If COD, proceed immediately
    await processOrderCreation();
  };

  const handlePaymentSuccess = async (_paymentIntentId: string) => {
    await processOrderCreation('paid');
  };

  const processOrderCreation = async (paymentStatus: 'pending' | 'paid' = 'pending') => {
    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image,
          size: item.size
        })),
        subtotal,
        shippingCost: deliveryFee,
        tax: taxesAndFees,
        totalPrice: total,
        paymentMethod,
        paymentStatus,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobile,
          addressLine1: formData.streetAddress,
          city: formData.city,
          state: 'N/A',
          zipCode: formData.zipCode,
          country: 'US',
        }
      };

      const resultingOrder = await api.orders.create(orderData);
      
      setCompletedOrder({ 
        ...orderData, 
        orderId: resultingOrder.orderNumber || resultingOrder._id || 'ORD-AWAITING',
        paymentStatus // Ensure it reflects the status we just sent
      });
      
      setShowSuccessModal(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error creating order. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stripe Elements Options
  const stripeOptions = useMemo(() => ({
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#D4A24F',
        colorBackground: '#0F0F12',
        colorText: '#ffffff',
        borderRadius: '12px',
        spacingUnit: '4px',
      }
    }
  }), [clientSecret]);

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    toast.info("Generating PDF Receipt...");
    try {
      // Temporarily expand the element to ensure all content is captured
      const targetElement = receiptRef.current;
      
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#121215'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AtCozy-Receipt-${completedOrder.orderId}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  if (!isAuthenticated || (items.length === 0 && !showSuccessModal)) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white pt-24 pb-20 font-sans selection:bg-[#D4A24F] selection:text-black">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 checkout-element">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Boutique
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Secure Checkout</h1>
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full py-1.5 px-4 text-sm font-medium border border-white/10">
            <div className="w-6 h-6 rounded-full bg-[#D4A24F] text-black flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(212,162,79,0.3)]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            Logged in as <span className="text-[#D4A24F] tracking-wide">{user?.name}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Left Column - Form fields */}
          <div className="flex-1 space-y-12">
            
            {/* Delivery Details */}
            <section className="checkout-element relative before:absolute before:left-[-24px] lg:before:left-[-40px] before:top-0 before:h-full before:w-[2px] before:bg-white/5">
              <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#D4A24F] text-black flex items-center justify-center text-sm">1</span> 
                Delivery Details
              </h2>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-[#D4A24F] shrink-0 mt-3" />
                  <div className="flex-1 space-y-4">
                    <p className="font-medium text-white/80">Deliver to:</p>
                    <input 
                      type="text" 
                      name="streetAddress"
                      placeholder="Street address"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors placeholder:text-white/30"
                    />
                    <button 
                      type="button" 
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center justify-center gap-2 bg-[#D4A24F]/10 text-[#D4A24F] border border-[#D4A24F]/20 font-bold py-3 text-sm tracking-widest uppercase rounded-xl hover:bg-[#D4A24F]/20 transition-colors"
                    >
                      <MapPin className="w-4 h-4" /> USE CURRENT LOCATION
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors placeholder:text-white/30"
                      />
                      <input 
                        type="text" 
                        name="zipCode"
                        placeholder="Zip code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors placeholder:text-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Information */}
            <section className="checkout-element relative before:absolute before:left-[-24px] lg:before:left-[-40px] before:top-0 before:h-full before:w-[2px] before:bg-white/5">
              <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-[#D4A24F] text-black flex items-center justify-center text-sm">2</span> 
                 Your Information
              </h2>
              <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Mobile number</label>
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">First name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Last name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4A24F] transition-colors"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <button type="button" onClick={() => setPromoEmails(!promoEmails)} className="shrink-0 text-white">
                      {promoEmails ? <CheckCircle2 className="w-5 h-5 fill-[#D4A24F] text-black" /> : <Circle className="w-5 h-5 text-white/30 group-hover:text-[#D4A24F]" />}
                    </button>
                    <span className="text-sm font-light text-white/80 group-hover:text-white transition-colors">Get promotional emails from AtCozy</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <button type="button" onClick={() => setPromoTexts(!promoTexts)} className="shrink-0 text-white">
                      {promoTexts ? <CheckCircle2 className="w-5 h-5 fill-[#D4A24F] text-black" /> : <Circle className="w-5 h-5 text-white/30 group-hover:text-[#D4A24F]" />}
                    </button>
                    <span className="text-sm font-light text-white/80 group-hover:text-white transition-colors">Get promotional texts from AtCozy</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="checkout-element pb-10 relative before:absolute before:left-[-24px] lg:before:left-[-40px] before:top-0 before:h-full before:w-[2px] before:bg-white/5">
              <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-[#D4A24F] text-black flex items-center justify-center text-sm">3</span> 
                 Payment
              </h2>
              
              <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-[#D4A24F] text-black shadow-lg shadow-[#D4A24F]/20' : 'text-white/50 hover:text-white'}`}
                >
                  Stripe Payment
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMethod === 'cod' ? 'bg-[#D4A24F] text-black shadow-lg shadow-[#D4A24F]/20' : 'text-white/50 hover:text-white'}`}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  {clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={stripeOptions}>
                      <StripePaymentForm 
                        amount={total} 
                        onProcessing={setIsSubmitting}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  ) : (
                    <div className="h-48 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4">
                      <div className="w-8 h-8 border-2 border-[#D4A24F]/30 border-t-[#D4A24F] rounded-full animate-spin" />
                      <p className="text-xs text-white/40 tracking-widest uppercase">Connecting to Stripe...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#D4A24F]/5 border border-[#D4A24F]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="w-16 h-16 bg-[#D4A24F]/10 rounded-full flex items-center justify-center mb-2">
                     <CheckCircle2 className="w-8 h-8 text-[#D4A24F]" />
                   </div>
                   <h3 className="text-xl font-serif font-bold text-[#D4A24F]">Cash on Delivery</h3>
                   <p className="text-sm text-white/60 max-w-xs mx-auto">Pay directly at your doorstep once your luxurious items arrive.</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[420px] shrink-0 checkout-element">
            <div className="bg-[#121215] border border-white/10 rounded-3xl p-8 shadow-2xl sticky top-32">
              <h2 className="text-2xl font-serif font-bold mb-8 flex items-center justify-between">
                Order Summary
                <span className="text-xs font-sans font-normal uppercase tracking-widest text-[#D4A24F] border border-[#D4A24F]/30 bg-[#D4A24F]/10 px-3 py-1 rounded-full">Items: {items.length}</span>
              </h2>
              
              <div className="space-y-4 text-sm font-medium border-b border-white/10 pb-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group cursor-pointer">
                  <span className="text-white/60 flex items-center gap-1">Taxes & fees <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /></span>
                  <span>${taxesAndFees.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end text-3xl font-bold font-serif mb-8 border-b border-white/10 pb-6">
                <span className="text-lg text-white/80">Total</span>
                <span className="text-[#D4A24F] tracking-tight">${total.toFixed(2)}</span>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mask-image-b mb-8">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center justify-between bg-white/5 border border-white/5 hover:border-white/20 transition-colors rounded-xl p-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/10 rounded-lg overflow-hidden shrink-0">
                        <img src={item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[150px]">{item.name}</p>
                        {item.size && <p className="text-xs text-[#D4A24F]">Size: {item.size}</p>}
                        <p className="text-xs text-white/40 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-[#D4A24F]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6">
                <button 
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full bg-[#D4A24F] text-black py-5 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,162,79,0.3)]"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    `Place Order Total $${total.toFixed(2)}`
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Success Modal rendering the detailed receipt */}
      {showSuccessModal && completedOrder && (
         <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="bg-[#121215] border border-[#D4A24F]/30 shadow-[0_0_50px_rgba(212,162,79,0.15)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-500">
               <div ref={receiptRef} className="p-10 bg-[#121215] text-white">
                  
                  {/* Receipt Header */}
                  <div className="text-center border-b border-white/10 pb-8 mb-8">
                     <div className="w-20 h-20 bg-[#D4A24F]/10 border border-[#D4A24F]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[#D4A24F]" />
                     </div>
                     <h2 className="text-4xl font-serif font-bold text-[#D4A24F] mb-3">Order Confirmed</h2>
                     <p className="text-white/60 tracking-widest text-sm font-mono">ORDER #{completedOrder.orderId}</p>
                     <p className="text-white/40 text-xs mt-2">{new Date().toLocaleString()}</p>
                  </div>

                  {/* Receipt Info */}
                  <div className="grid grid-cols-2 gap-8 mb-10 border-b border-white/10 pb-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F]">Customer Details</h4>
                        <div>
                           <p className="font-medium text-white">{completedOrder.shippingAddress.fullName}</p>
                           <p className="text-white/60 text-sm">{completedOrder.shippingAddress.email}</p>
                           <p className="text-white/60 text-sm">{completedOrder.shippingAddress.phone}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F]">Delivery Destination</h4>
                        <div>
                           <p className="font-medium text-white/80">{completedOrder.shippingAddress.addressLine1}</p>
                           <p className="text-white/60 text-sm">{completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} {completedOrder.shippingAddress.zipCode}</p>
                           <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">
                             Method: <span className="text-[#D4A24F]">{completedOrder.paymentMethod}</span>
                           </p>
                           <p className="text-white/40 text-xs uppercase tracking-widest">
                             Status: <span className={completedOrder.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}>{completedOrder.paymentStatus}</span>
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Receipt Items */}
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F] mb-6">Purchased Items</h4>
                  <div className="space-y-4 mb-8">
                     {completedOrder.items.map((item: any) => (
                        <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center bg-white/5 rounded-xl p-4">
                           <div className="flex gap-4 items-center">
                              <span className="text-white/40 font-mono">{item.quantity}x</span>
                              <div>
                                 <p className="font-bold text-sm">{item.name}</p>
                                 {item.size && <p className="text-[10px] uppercase text-[#D4A24F] mt-1">Size: {item.size}</p>}
                              </div>
                           </div>
                           <p className="font-mono text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                     ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                     <div className="flex justify-between items-center text-white/60">
                        <span>Subtotal</span>
                        <span>${completedOrder.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-white/60">
                        <span>Delivery & Processing</span>
                        <span>${completedOrder.shippingCost.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-white/60">
                        <span>Taxes & Fees</span>
                        <span>${completedOrder.tax.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-xl font-bold font-serif pt-4 mt-4 border-t border-white/10 text-white">
                        <span>Total Checkout</span>
                        <span className="text-[#D4A24F]">${completedOrder.totalPrice.toFixed(2)}</span>
                     </div>
                  </div>
                  
                  <div className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] text-white/20 pt-10 border-t border-white/5">
                     Thank you for shopping at AtCozy Boutique
                  </div>
               </div>

               {/* Action Buttons (outside the receiptRef to prevent them from rendering into the PDF) */}
               <div className="p-8 pt-0 bg-[#121215] flex flex-col sm:flex-row gap-4">
                  <button 
                     onClick={generatePDF}
                     className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                     <Download className="w-4 h-4" /> Download PDF Receipt
                  </button>
                  <button 
                     onClick={() => navigate('/')}
                     className="flex-1 py-4 bg-[#D4A24F] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(212,162,79,0.2)]"
                  >
                     Return to Shop
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
