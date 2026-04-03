import { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ChevronDown,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to analyze business metrics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#D4A24F', '#A67E30', '#7A5B1B', '#4D3906', '#211702'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-2 border-[#D4A24F] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/20 uppercase tracking-[0.3em] font-bold text-xs">Generating Fiscal Insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 text-[#D4A24F] mb-3">
              <Sparkles size={16} />
              <span className="text-[10px] uppercase font-bold tracking-[0.4em]">Business Intelligence</span>
           </div>
           <h2 className="text-3xl font-serif font-bold tracking-tight">Performance Summary</h2>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              <Calendar size={14} /> Last 30 Days <ChevronDown size={14} />
           </button>
           <button className="flex items-center gap-2 bg-[#D4A24F] text-black px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,162,79,0.3)]">
              <Download size={14} /> EXPORT REPORT
           </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4 hover:border-[#D4A24F]/30 transition-colors group">
            <div className="flex items-center justify-between">
               <div className="p-3 bg-[#D4A24F]/10 rounded-xl text-[#D4A24F] group-hover:bg-[#D4A24F] group-hover:text-black transition-colors duration-500">
                  <DollarSign size={20} />
               </div>
               <span className="flex items-center gap-1 text-green-400 text-xs font-bold"> <ArrowUpRight size={14} /> +14% </span>
            </div>
            <div>
               <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Revenue Growth</p>
               <h4 className="text-3xl font-bold mt-1">${stats?.totalRevenue?.toLocaleString()}</h4>
            </div>
         </div>
         <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4 hover:border-[#D4A24F]/30 transition-colors group">
            <div className="flex items-center justify-between">
               <div className="p-3 bg-[#D4A24F]/10 rounded-xl text-[#D4A24F] group-hover:bg-[#D4A24F] group-hover:text-black transition-colors duration-500">
                  <ShoppingBag size={20} />
               </div>
               <span className="flex items-center gap-1 text-green-400 text-xs font-bold"> <ArrowUpRight size={14} /> +8% </span>
            </div>
            <div>
               <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Order Volume</p>
               <h4 className="text-3xl font-bold mt-1">{stats?.totalOrders}</h4>
            </div>
         </div>
         <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4 hover:border-[#D4A24F]/30 transition-colors group">
            <div className="flex items-center justify-between">
               <div className="p-3 bg-[#D4A24F]/10 rounded-xl text-[#D4A24F] group-hover:bg-[#D4A24F] group-hover:text-black transition-colors duration-500">
                  <Users size={20} />
               </div>
               <span className="flex items-center gap-1 text-red-400 text-xs font-bold"> <ArrowDownRight size={14} /> -2% </span>
            </div>
            <div>
               <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Conversion Rate</p>
               <h4 className="text-3xl font-bold mt-1">3.4%</h4>
            </div>
         </div>
      </div>

      {/* Revenue Trend Over Time */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-xl font-bold tracking-tight">Revenue Dynamics</h3>
               <p className="text-white/30 text-xs mt-1">Net sales evolution tracked over the current quarter.</p>
            </div>
            <div className="flex items-center gap-2 text-[#D4A24F] text-xs font-bold bg-[#D4A24F]/10 px-4 py-2 rounded-full border border-[#D4A24F]/20">
               <TrendingUp size={14} /> TRENDING UP
            </div>
         </div>
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stats?.salesOverTime || []}>
                  <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4A24F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4A24F" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="_id" stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#121215', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                     itemStyle={{ color: '#D4A24F' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4A24F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
         {/* Category Performance */}
         <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
            <h3 className="text-xl font-bold tracking-tight">Category Distribution</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={stats?.categoryDistribution || []}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={110}
                        paddingAngle={10}
                        dataKey="count"
                        nameKey="_id"
                     >
                        {(stats?.categoryDistribution || []).map((_: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#121215', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
               </ResponsiveContainer>
               <div className="space-y-4 px-6 shrink-0">
                  {(stats?.categoryDistribution || []).slice(0, 5).map((cat: any, i: number) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{cat._id}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Top Selling Products */}
         <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
            <h3 className="text-xl font-bold tracking-tight">Product Pinnacle</h3>
            <div className="space-y-6">
               {(stats?.topSellingProducts || []).map((product: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                     <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-[#D4A24F] font-bold rounded-2xl border border-white/5 group-hover:border-[#D4A24F]/30 transition-all">
                            {i + 1}
                         </div>
                         <div>
                            <p className="font-bold text-sm group-hover:text-[#D4A24F] transition-colors">{product.name}</p>
                            <p className="text-xs text-white/30 uppercase tracking-widest font-medium mt-0.5">{product.totalSold} sold</p>
                         </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold font-mono text-[#D4A24F]">${product.revenue?.toLocaleString()}</p>
                        <p className="text-[10px] text-green-400 font-bold tracking-widest">+12%</p>
                     </div>
                  </div>
               ))}
               {(stats?.topSellingProducts?.length === 0 || !stats?.topSellingProducts) && (
                  <div className="py-20 text-center text-white/20 italic text-sm">No sales data available yet.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
