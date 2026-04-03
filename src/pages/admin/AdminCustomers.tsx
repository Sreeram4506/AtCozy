import { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  Filter,
  UserCheck,
  UserX,
  Package,
  DollarSign,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export function AdminCustomers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.admin.users.getAll();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to synchronize customer directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setIsOrdersLoading(true);
    try {
      // Using the newly added userId filter in the admin API
      const data = await api.admin.orders.getAll({ userId });
      setUserOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve resident order history.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    fetchUserOrders(user._id);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full lg:w-auto">
           <div className="relative w-full lg:w-[400px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm placeholder:text-white/20 focus:border-[#D4A24F]/40 outline-none transition-all"
              />
           </div>
           <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              <Filter size={16} /> Filter
           </button>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
           <div className="px-6 py-2 rounded-xl bg-[#D4A24F]/10 border border-[#D4A24F]/20">
              <p className="text-[10px] uppercase font-bold text-[#D4A24F] tracking-widest leading-none mb-1">Total Residents</p>
              <h4 className="text-xl font-bold">{users.length}</h4>
           </div>
           <div className="px-6 py-2">
              <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest leading-none mb-1">New This Month</p>
              <h4 className="text-xl font-bold">+12</h4>
           </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-10 py-8 text-[10px] uppercase font-bold tracking-widest text-white/30">Resident identity</th>
              <th className="px-10 py-8 text-[10px] uppercase font-bold tracking-widest text-white/30">Security Access</th>
              <th className="px-10 py-8 text-[10px] uppercase font-bold tracking-widest text-white/30">Arrival Date</th>
              <th className="px-10 py-8 text-[10px] uppercase font-bold tracking-widest text-white/30 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
               <tr>
                 <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/20 italic">
                       <div className="w-8 h-8 border-2 border-[#D4A24F] border-t-transparent rounded-full animate-spin" />
                       Indexing global accounts...
                    </div>
                 </td>
               </tr>
            ) : filteredUsers.length === 0 ? (
               <tr>
                 <td colSpan={4} className="px-10 py-32 text-center text-white/20 italic">
                    No results found for your query.
                 </td>
               </tr>
            ) : filteredUsers.map((u) => (
              <tr 
                key={u._id} 
                className="group hover:bg-[#D4A24F]/[0.02] transition-colors duration-500 cursor-pointer"
                onClick={() => handleUserClick(u)}
              >
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#D4A24F] text-lg font-bold border border-white/10 group-hover:border-[#D4A24F]/30 transition-all duration-500">
                      {u.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-bold tracking-tight text-white group-hover:text-[#D4A24F] transition-colors">{u.name}</p>
                      <div className="flex items-center gap-2 text-white/30 text-[11px] font-medium">
                        <Mail size={12} /> {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    u.role === 'admin' 
                    ? 'bg-[#D4A24F]/10 text-[#D4A24F] border-[#D4A24F]/20 shadow-[0_0_15px_rgba(212,162,79,0.1)]' 
                    : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    <Shield size={10} /> {u.role}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3 text-white/40 font-medium text-sm">
                    <Calendar size={14} className="text-[#D4A24F]/30" />
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button className="p-3 bg-white/5 rounded-xl hover:bg-[#D4A24F] hover:text-black transition-all duration-300" title="Verify User">
                      <UserCheck size={16} />
                    </button>
                    <button className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-300" title="Restrict Access">
                      <UserX size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Placeholder */}
      <div className="flex items-center justify-between px-10 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
         <div className="flex items-center gap-8">
            <button className="hover:text-white transition-colors disabled:opacity-30" disabled>Previous Page</button>
            <div className="flex items-center gap-2">
               <span className="w-8 h-8 rounded-lg bg-[#D4A24F] text-black flex items-center justify-center">1</span>
               <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">2</span>
            </div>
            <button className="hover:text-white transition-colors">Next Page</button>
         </div>
         <p>Displaying {filteredUsers.length} of {users.length} results</p>
      </div>


      {/* Profile Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#0B0B0D] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
              {/* Modal Header */}
              <div className="relative p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                 <button 
                   onClick={() => setSelectedUser(null)}
                   className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                 >
                    <X size={20} />
                 </button>
                 
                 <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-28 h-28 rounded-3xl bg-[#D4A24F]/10 border-2 border-[#D4A24F]/20 flex items-center justify-center text-[#D4A24F] text-4xl font-light shadow-[0_0_40px_rgba(212,162,79,0.1)]">
                       {selectedUser.name[0].toUpperCase()}
                    </div>
                    <div className="text-center md:text-left">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                          <h2 className="text-4xl font-bold tracking-tight text-white">{selectedUser.name}</h2>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                            selectedUser.role === 'admin' 
                            ? 'bg-[#D4A24F] text-black border-[#D4A24F]' 
                            : 'bg-white/10 text-white/60 border-white/10'
                          }`}>
                            {selectedUser.role}
                          </span>
                       </div>
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/30 text-sm">
                          <div className="flex items-center gap-2"><Mail size={14} className="text-[#D4A24F]/40" /> {selectedUser.email}</div>
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-[#D4A24F]/40" /> Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                 {/* Quick Metrics */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                       <div className="flex items-center gap-3 text-[#D4A24F]/40 mb-4">
                          <Package size={18} />
                          <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Total Orders</span>
                       </div>
                       <h4 className="text-3xl font-bold">{userOrders.length}</h4>
                    </div>
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                       <div className="flex items-center gap-3 text-[#D4A24F]/40 mb-4">
                          <DollarSign size={18} />
                          <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Luxe Spending</span>
                       </div>
                       <h4 className="text-3xl font-bold">
                          ${userOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                       </h4>
                    </div>
                 </div>

                 {/* Order History */}
                 <div className="space-y-6">
                    <h3 className="text-sm uppercase font-black tracking-[0.2em] text-white/20">Resident Order History</h3>
                    <div className="border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
                       <table className="w-full text-left text-xs">
                          <thead>
                             <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30">Order Reference</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30">Date</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30">Value</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-white/30 text-right">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                             {isOrdersLoading ? (
                                <tr>
                                   <td colSpan={4} className="px-6 py-12 text-center text-white/10 italic">Retrieving transaction logs...</td>
                                </tr>
                             ) : userOrders.length === 0 ? (
                                <tr>
                                   <td colSpan={4} className="px-6 py-12 text-center text-white/10 italic">No historical data available.</td>
                                </tr>
                             ) : userOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                                   <td className="px-6 py-4 text-white/60">#{order._id.slice(-8).toUpperCase()}</td>
                                   <td className="px-6 py-4 text-white/40">{new Date(order.createdAt).toLocaleDateString()}</td>
                                   <td className="px-6 py-4 text-[#D4A24F]">${order.totalPrice.toFixed(2)}</td>
                                   <td className="px-6 py-4 text-right">
                                      <span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-black ${
                                        order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                        order.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-white/5 text-white/30'
                                      }`}>
                                         {order.status}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-wrap gap-4">
                 <button className="flex-1 min-w-[140px] py-4 bg-[#D4A24F] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#D4A24F]/10">
                    Dispatch Message
                 </button>
                 <button className="flex-1 min-w-[140px] py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all">
                    Reset Security Phrase
                 </button>
                 <button className="flex-1 min-w-[140px] py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-500/20 transition-all">
                    Revoke Residency
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
