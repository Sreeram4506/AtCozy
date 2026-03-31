import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../../lib/api';

// Product type to match our backend
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  source: string;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.admin.products.getAll();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setProducts([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (product: Product, updates: Partial<Product>) => {
    try {
      await api.admin.products.update(product.id, updates);
      setProducts(products.map(p => p.id === product.id ? { ...p, ...updates } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or category..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm placeholder:text-white/20 focus:border-[#D4A24F]/50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-initial h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
              <Filter size={18} />
              Filters
           </button>
           <button className="flex-1 md:flex-initial h-14 px-8 rounded-2xl bg-[#D4A24F] text-black text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <Plus size={18} />
              Add Product
           </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/10">
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Product Name</th>
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Category</th>
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Source</th>
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Price</th>
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Stock Status</th>
                <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-white/20 italic">Loading inventory database...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-white/20 italic">No products found matching your search.</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-white/5 transition-colors duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#D4A24F] font-bold">
                        #{product.id}
                      </div>
                      <span className="font-bold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white/40 text-sm">{product.category}</span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        {product.source}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         defaultValue={product.price}
                         onBlur={(e) => handleUpdate(product, { price: parseInt(e.target.value) })}
                         className="w-20 bg-transparent border-none outline-none font-bold text-white focus:text-[#D4A24F] transition-colors"
                       />
                       <span className="text-[#D4A24F] font-bold">$</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <input 
                         type="number" 
                         defaultValue={product.stock}
                         onBlur={(e) => handleUpdate(product, { stock: parseInt(e.target.value) })}
                         className={`w-16 h-10 bg-white/5 border rounded-lg px-2 text-center text-sm font-bold outline-none transition-all ${
                           product.stock < 10 ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white'
                         } focus:border-[#D4A24F]`}
                       />
                       {product.stock > 0 ? (
                         <CheckCircle2 size={16} className="text-green-500" />
                       ) : (
                         <XCircle size={16} className="text-red-500" />
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <button className="p-3 bg-white/5 rounded-xl hover:bg-[#D4A24F] hover:text-black transition-all">
                          <Edit2 size={16} />
                       </button>
                       <button className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
