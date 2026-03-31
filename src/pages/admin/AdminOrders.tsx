import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight, 
  User, 
  Clock, 
  Filter,
  Box,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../../lib/api';

interface Order {
  _id: string;
  userId: string;
  items: Array<{ productId: number; quantity: number; price: number }>;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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

  const updateStatus = async (id: string, status: string) => {
     try {
       await api.admin.orders.updateStatus(id, { status });
       setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
     } catch (err) {
       console.error(err);
     }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
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
              placeholder="Search by Order ID or User..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm placeholder:text-white/20 focus:border-[#D4A24F]/40 outline-none transition-all"
           />
        </div>
      </div>

      {/* Orders List / Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 py-4' : 'space-y-6'}>
        {isLoading ? (
           <div className="col-span-full py-32 text-center text-white/20 italic">Synchronizing order logistics...</div>
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
                      <p className="text-sm font-bold truncate">User: {order.userId.slice(-6).toUpperCase()}</p>
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
                   {order.items.map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0D] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        P{i+1}
                      </div>
                   ))}
                   <div className="w-10 h-10 rounded-full border-2 border-[#0B0B0D] bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      +{order.items.length-1}
                   </div>
                </div>
                <p className="text-xs text-white/40 font-medium">{order.items.length} items included in shipment.</p>
                <h3 className="text-2xl font-bold tracking-tighter text-[#D4A24F]">${order.totalPrice}</h3>
             </div>

             {/* Actions */}
             <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'md:w-[150px] justify-end' : ''}`}>
                <select 
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  value={order.status}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none border-none cursor-pointer focus:bg-[#D4A24F] focus:text-black transition-all"
                >
                   <option value="pending">Pending</option>
                   <option value="shipped">Shipped</option>
                   <option value="completed">Completed</option>
                </select>
                <button className="p-3 bg-white/5 rounded-xl hover:bg-white text-black transition-all">
                  <ChevronRight size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
