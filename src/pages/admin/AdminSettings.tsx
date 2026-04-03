import { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Lock, 
  Globe, 
  Database, 
  Cpu, 
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function AdminSettings() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.auth.updateProfile({ name: formData.name, email: formData.email });
      toast.success('Admin profile updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const systemStatus = [
    { label: 'Core API Gateway', status: 'operational', version: 'v2.4.1', icon: Globe },
    { label: 'MongoDB Cluster', status: 'operational', lat: '12ms', icon: Database },
    { label: 'Background Workers', status: 'warning', load: '84%', icon: Cpu },
  ];

  return (
    <div className="max-w-5xl space-y-16 animate-fade-in pb-24">
      {/* Profile Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-[#D4A24F]/10 border border-[#D4A24F]/20 rounded-2xl flex items-center justify-center text-[#D4A24F]">
              <User size={24} />
           </div>
           <div>
              <h3 className="text-2xl font-serif font-bold">Admin Profile</h3>
              <p className="text-white/30 text-sm">Manage your administrative credentials and identity.</p>
           </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Full Identity</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-[#D4A24F]/40 outline-none transition-all"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-[#D4A24F]/40 outline-none transition-all"
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Access Tier</label>
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-sm font-bold text-[#D4A24F]">
                    <Shield size={18} /> GLOBAL ADMINISTRATOR
                 </div>
                 <p className="text-[10px] text-white/20 italic mt-2 px-2">Your account has full write access to inventory and fiscal data.</p>
              </div>
              <div className="flex items-end h-full pb-1">
                 <button 
                   type="submit" 
                   disabled={isUpdating}
                   className="w-full py-4 bg-[#D4A24F] text-black font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,162,79,0.3)]"
                 >
                    {isUpdating ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={16} />}
                    Update Identity
                 </button>
              </div>
           </div>
        </form>
      </section>

      {/* System Status Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <Activity size={24} />
           </div>
           <div>
              <h3 className="text-2xl font-serif font-bold">System Integrity</h3>
              <p className="text-white/30 text-sm">Real-time monitoring of backend infrastructure and services.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {systemStatus.map((service, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all group">
                <div className="flex items-center justify-between mb-6">
                   <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#D4A24F]/10 group-hover:text-[#D4A24F] transition-colors">
                      <service.icon size={20} />
                   </div>
                   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${
                     service.status === 'operational' ? 'text-green-400' : 'text-yellow-400'
                   }`}>
                      {service.status === 'operational' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {service.status}
                   </div>
                </div>
                <h4 className="font-bold text-sm mb-1">{service.label}</h4>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                   {service.version || service.lat || service.load} • STABLE
                </p>
             </div>
           ))}
        </div>
      </section>

      {/* Security & Danger Zone Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
              <Lock size={24} />
           </div>
           <div>
              <h3 className="text-2xl font-serif font-bold">Privacy & Purge</h3>
              <p className="text-white/30 text-sm">Manage sensitive operations and system-wide data clearing.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center justify-center space-y-6">
              <div className="p-5 bg-white/5 rounded-full">
                 <Bell size={24} className="text-white/40" />
              </div>
              <div>
                 <h4 className="font-bold">Notification Prefs</h4>
                 <p className="text-xs text-white/30 mt-2">Configure how you receive critical system alerts and order updates.</p>
              </div>
              <button className="px-10 py-4 border border-white/10 rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 transition-all">Configure Notifications</button>
           </div>
           
           <div className="bg-red-500/[0.02] border border-red-500/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center justify-center space-y-6">
              <div className="p-5 bg-red-500/10 rounded-full">
                 <Trash2 size={24} className="text-red-400" />
              </div>
              <div>
                 <h4 className="font-bold text-red-400">Purge Local Cache</h4>
                 <p className="text-xs text-white/30 mt-2">Clear all administrative cached and temporary session logs.</p>
              </div>
              <button className="px-10 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-red-500/20 transition-all">PURGE ALL CACHE</button>
           </div>
        </div>
      </section>
    </div>
  );
}

// Placeholder Activity Icon since I used simple string matching
const Activity = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);
