import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowRight,
  Activity,
  CreditCard,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.admin.getStats();
        setStats(statsData);
        
        // Fetch low stock items for alerts
        const productsData = await api.admin.products.getAll();
        const lowStock = (productsData.products || []).filter((p: any) => p.stock < 10).slice(0, 3);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4A24F]" />
        <p className="text-white/40 uppercase tracking-[0.3em] font-bold text-xs">Synchronizing Global Analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`, change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Product Sales', value: stats?.totalOrders?.toLocaleString() || '0', change: '+8.2%', icon: ShoppingBag, trend: 'up' },
    { label: 'Active Users', value: stats?.totalUsers?.toLocaleString() || '0', change: '-2.4%', icon: Users, trend: 'down' },
    { label: 'Inventory Items', value: stats?.totalProducts?.toLocaleString() || '0', change: '0%', icon: Package, trend: 'stable' },
  ];
  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="group relative h-40 overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-[#D4A24F]/10 hover:border-[#D4A24F]/40 transition-all duration-500"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                <div className={`p-3 rounded-full bg-white/5 group-hover:bg-[#D4A24F] group-hover:text-black transition-colors duration-500`}>
                   <stat.icon size={18} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-white/40'
                }`}>
                  {stat.trend === 'up' && <TrendingUp size={14} />}
                  {stat.trend === 'down' && <TrendingDown size={14} />}
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         {/* Detailed Table (Recent Activity) */}
         <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h4 className="text-lg font-bold tracking-tight">Recent Activity</h4>
              <button className="text-[#D4A24F] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                View All <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Item</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Status</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Date</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(stats?.recentOrders || []).map((order: any) => (
                    <tr key={order._id} className="group hover:bg-white/5 transition-colors duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D4A24F]">
                             <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <span className="text-xs text-white/30 truncate">Sold to {order.shippingAddress?.fullName || 'Guest'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                           order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                         }`}>
                            {order.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-bold">${order.totalPrice}</td>
                    </tr>
                  ))}
                  {(stats?.recentOrders?.length === 0 || !stats?.recentOrders) && (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-white/20 italic">No recent transactions recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>

         {/* Sidebar Widget (Stock Alerts) */}
         <div className="space-y-8">
            <div className="px-4">
              <h4 className="text-lg font-bold tracking-tight">Inventory Alerts</h4>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
               {lowStockProducts.map((product) => (
                 <div key={product.id} className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-[#D4A24F]/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                       <div className="p-3 rounded-xl bg-[#D4A24F]/10 text-[#D4A24F]">
                          <Activity size={18} />
                       </div>
                       <span className="text-[10px] text-red-400 font-bold uppercase py-1 px-2 bg-red-400/10 rounded-full border border-red-400/20">
                         {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                       </span>
                    </div>
                    <div>
                      <h5 className="font-medium group-hover:text-[#D4A24F] transition-colors">{product.name}</h5>
                      <p className="text-xs text-white/30">Stock levels reached below {product.stock} units.</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${product.stock === 0 ? 'bg-red-500' : 'bg-red-400'}`} 
                         style={{ width: `${Math.max(5, (product.stock / 20) * 100)}%` }} 
                       />
                    </div>
                 </div>
               ))}
               {lowStockProducts.length === 0 && (
                 <div className="p-10 text-center text-white/20 italic text-sm">
                    No critical stock alerts. All inventory levels are stable.
                 </div>
               )}

               <button className="w-full py-4 rounded-2xl bg-[#D4A24F] text-black font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all">
                  Restock All
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
