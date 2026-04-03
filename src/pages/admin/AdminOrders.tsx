import { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Clock, 
  Filter,
  Box,
  LayoutGrid,
  List,
  Edit2,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber?: string;
  userId: string;
  items: Array<{ productId: number; name: string; quantity: number; price: number; image?: string; size?: string }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isEditing, setIsEditing] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.admin.orders.getAll();
      setOrders(Array.isArray(data) ? data : (data.orders || []));
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async (id: string, updates: any) => {
      try {
        await api.admin.orders.updateStatus(id, updates);
        setOrders(orders.map(o => o._id === id ? { ...o, ...updates } : o));
        toast.success('Order logistics updated');
        setIsEditing(null);
      } catch (err: any) {
        toast.error(err.message || 'Update failed');
      }
  };

  const generatePDF = async (order: Order) => {
    const element = document.getElementById(`receipt-${order._id}`);
    if (!element) return;
    
    toast.info("Generating PDF Invoice...");
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#121215'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AtCozy-Invoice-${order.orderNumber || order._id.slice(-8)}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:px-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3">
              <Filter size={16} /> Filter
           </button>
           <div className="flex items-center bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#D4A24F] text-black shadow-lg shadow-[#D4A24F]/20' : 'text-white/40'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#D4A24F] text-black shadow-lg shadow-[#D4A24F]/20' : 'text-white/40'}`}
              >
                <List size={18} />
              </button>
           </div>
        </div>

        <div className="relative w-full md:w-[350px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
           <input 
              type="text" 
              placeholder="Search by Order ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm placeholder:text-white/20 focus:border-[#D4A24F]/40 outline-none transition-all"
           />
        </div>
      </div>

      {/* Orders List / Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 py-4' : 'space-y-6'}>
        {isLoading ? (
           <div className="col-span-full py-32 text-center text-white/20 italic flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-2 border-[#D4A24F] border-t-transparent rounded-full animate-spin" />
             Synchronizing order logistics...
           </div>
        ) : orders.length === 0 ? (
           <div className="col-span-full py-32 text-center text-white/20 italic">No incoming orders at the moment.</div>
        ) : orders.map((order) => (
          <div 
             key={order._id}
             className={`group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-[#D4A24F]/30 transition-all duration-500 overflow-hidden ${
               viewMode === 'list' ? 'flex flex-col md:flex-row md:items-center justify-between gap-8' : ''
             }`}
          >
             {/* Info block */}
             <div className="flex-1 flex flex-col gap-5">
                <div className="flex items-center justify-between md:justify-start gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-[#D4A24F]/10 text-[#D4A24F] flex items-center justify-center">
                      <Box size={22} />
                   </div>
                   <div>
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none">Order ID</p>
                      <h4 className="font-bold text-lg mt-1 tracking-tight">#{order._id.slice(-8).toUpperCase()}</h4>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <p className="flex items-center gap-2 text-white/30 text-xs font-medium"> <User size={12} /> Customer </p>
                      <p className="text-sm font-bold truncate">UID: {order.userId.slice(-6).toUpperCase()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="flex items-center gap-2 text-white/30 text-xs font-medium"> <Clock size={12} /> Date Ordered </p>
                      <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
             </div>

             {/* Items snapshot */}
             <div className={`flex flex-col gap-4 ${viewMode === 'list' ? 'md:w-[250px]' : ''}`}>
                <div className="flex -space-x-3 overflow-hidden">
                   {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0D] bg-[#D4A24F]/20 flex items-center justify-center text-[10px] font-bold text-[#D4A24F]">
                        {item.name[0]}
                      </div>
                   ))}
                   {order.items.length > 3 && (
                     <div className="w-10 h-10 rounded-full border-2 border-[#0B0B0D] bg-white/20 flex items-center justify-center text-[10px] font-bold">
                        +{order.items.length-3}
                     </div>
                   )}
                </div>
                <p className="text-xs text-white/40 font-medium">{order.items.length} items • ${order.totalPrice}</p>
                {order.trackingNumber && (
                   <p className="text-[10px] text-green-400 font-bold uppercase tracking-[0.2em]">Track: {order.trackingNumber}</p>
                )}
             </div>

             {/* Actions */}
             <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'md:w-[150px] justify-end' : ''}`}>
                <button 
                  onClick={() => setIsEditing(order)}
                  className="p-3 bg-white/5 rounded-xl hover:bg-[#D4A24F] hover:text-black transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Edit2 size={16} /> Manage
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Manage Order Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#121215] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-2xl font-bold">Manage Order Logistics</h3>
                   <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">ID: #{isEditing._id.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setIsEditing(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 handleUpdateOrder(isEditing._id, {
                    status: formData.get('status'),
                    trackingNumber: formData.get('trackingNumber'),
                    notes: formData.get('notes')
                 });
              }}>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Shipment Status</label>
                       <select name="status" defaultValue={isEditing.status} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4A24F] transition-all cursor-pointer">
                          <option value="pending">Pending Settlement</option>
                          <option value="confirmed">Order Confirmed</option>
                          <option value="processing">Processing Shipment</option>
                          <option value="shipped">Dispatched / Shipped</option>
                          <option value="delivered">Successfully Delivered</option>
                          <option value="cancelled">Transaction Cancelled</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Tracking Identifier</label>
                       <input 
                         name="trackingNumber" 
                         defaultValue={isEditing.trackingNumber} 
                         placeholder="UPS / FedEx Tracking #" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4A24F] transition-all" 
                       />
                    </div>
                 </div>

                  <div className="space-y-6">
                    <div className="space-y-2 h-full">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Fulfillment Notes</label>
                       <textarea 
                         name="notes" 
                         defaultValue={isEditing.notes} 
                         placeholder="Special instructions or internal logs..." 
                         className="w-full h-[154px] bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4A24F] transition-all resize-none font-medium text-white/80" 
                       />
                    </div>
                  </div>

                  {/* Order Overview Summary */}
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#D4A24F]">Customer & Shipping</h4>
                          <div className="text-sm space-y-1">
                             <p className="font-bold">{isEditing.shippingAddress?.fullName || 'N/A'}</p>
                             <p className="text-white/60">{isEditing.shippingAddress?.addressLine1}</p>
                             <p className="text-white/60">{isEditing.shippingAddress?.city}, {isEditing.shippingAddress?.zipCode}</p>
                             <p className="text-white/40 text-xs pt-1">{isEditing.shippingAddress?.email} • {isEditing.shippingAddress?.phone}</p>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#D4A24F]">Item Summary</h4>
                          <div className="space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
                             {isEditing.items.map((item: any, i: number) => (
                                 <div key={i} className="flex justify-between items-center text-xs">
                                    <div className="flex flex-col">
                                       <span className="text-white/80">{item.quantity}x {item.name}</span>
                                       <span className="text-[9px] uppercase tracking-widest text-[#D4A24F]/70">{item.category}</span>
                                    </div>
                                    <span className="font-mono text-[#D4A24F]">${(item.price * item.quantity).toFixed(2)}</span>
                                 </div>
                             ))}
                          </div>
                          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                             <span className="text-[10px] uppercase font-bold text-white/30">Total Value</span>
                             <span className="font-bold text-[#D4A24F]">${isEditing.totalPrice.toFixed(2)}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6 flex flex-wrap gap-4">
                     <button type="submit" className="flex-1 min-w-[200px] py-5 bg-[#D4A24F] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#D4A24F]/20">
                        Commit Logistics Updates
                     </button>
                     <button 
                        type="button" 
                        onClick={() => generatePDF(isEditing)}
                        className="px-8 py-5 bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                     >
                        <Download size={16} /> PDF Invoice
                     </button>
                     <button type="button" onClick={() => setIsEditing(null)} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">
                        Discard
                     </button>
                  </div>
               </form>

               {/* Hidden Receipt for PDF Export */}
               <div className="fixed left-[-9999px] top-0">
                  <div id={`receipt-${isEditing._id}`} className="p-10 bg-[#121215] text-white w-[800px]">
                     <div className="text-center border-b border-white/10 pb-8 mb-8">
                        <h2 className="text-4xl font-serif font-bold text-[#D4A24F] mb-3">AtCozy Boutique</h2>
                        <p className="text-white/60 tracking-widest text-sm font-mono uppercase">Order Invoice #{isEditing.orderNumber || isEditing._id.slice(-8).toUpperCase()}</p>
                        <p className="text-white/40 text-xs mt-2">{new Date(isEditing.createdAt).toLocaleString()}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-8 mb-10 border-b border-white/10 pb-10">
                        <div className="space-y-4">
                           <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F]">Customer Info</h4>
                           <div>
                              <p className="font-medium text-white">{isEditing.shippingAddress?.fullName}</p>
                              <p className="text-white/60 text-sm">{isEditing.shippingAddress?.email}</p>
                              <p className="text-white/60 text-sm">{isEditing.shippingAddress?.phone}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F]">Shipping Address</h4>
                           <div>
                              <p className="font-medium text-white/80">{isEditing.shippingAddress?.addressLine1}</p>
                              <p className="text-white/60 text-sm">{isEditing.shippingAddress?.city}, {isEditing.shippingAddress?.state} {isEditing.shippingAddress?.zipCode}</p>
                              <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">
                                Status: <span className="text-[#D4A24F]">{isEditing.status}</span>
                              </p>
                           </div>
                        </div>
                     </div>

                     <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4A24F] mb-6">Items Breakdowns</h4>
                     <div className="space-y-4 mb-8">
                        {isEditing.items.map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center bg-white/5 rounded-xl p-4">
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

                     <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                        <div className="flex justify-between items-center text-white/60">
                           <span>Subtotal</span>
                           <span>${(isEditing.subtotal || isEditing.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-white/60">
                           <span>Total Amount</span>
                           <span className="text-[#D4A24F] font-bold text-xl">${isEditing.totalPrice.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
