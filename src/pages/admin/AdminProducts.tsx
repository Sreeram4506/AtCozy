import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Filter,
  CheckCircle2,
  XCircle,
  X,
  Loader2
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  source: string;
  image?: string;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

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

  const handleCreate = async (data: FormData) => {
    try {
      await api.admin.products.create(data);
      toast.success('Product created successfully');
      setIsAdding(false);
      setPreviewImage(null);
      // Re-fetch the full list so the dashboard always reflects true DB state
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    }
  };

  const handleUpdate = async (id: number, updates: FormData | Partial<Product>) => {
    try {
      const updatedProduct = await api.admin.products.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
      toast.success('Product updated successfully');
      const label = updates instanceof FormData ? updates.get('category')?.toString() : updates.category;
      const knownCategories = ['Dresses', 'Tops', 'Boots', 'Heels', 'Shop All', 'Blouse', 'Sneakers', 'Shirts'];
      if (label && knownCategories.includes(label)) {
        const category = label === 'Shop All' ? 'All' : label;
        window.dispatchEvent(new CustomEvent('filterProducts', { detail: category }));
      }
      setIsEditing(null);
      setPreviewImage(null);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.admin.products.delete(id);
      toast.success('Product removed from inventory');
      setIsDeleting(null);
      // Re-fetch so count and order are accurate after deletion
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
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
           <button 
             onClick={() => {
               setIsAdding(true);
               setPreviewImage(null);
             }}
             className="flex-1 md:flex-initial h-14 px-8 rounded-2xl bg-[#D4A24F] text-black text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
           >
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
                   <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 text-white/20 italic">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4A24F]" />
                        <span>Synchronizing inventory database...</span>
                      </div>
                   </td>
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
                         onBlur={(e) => handleUpdate(product.id, { price: parseInt(e.target.value) })}
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
                         onBlur={(e) => handleUpdate(product.id, { stock: parseInt(e.target.value) })}
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
                       <button 
                         onClick={() => {
                           setIsEditing(product);
                           setPreviewImage(product.image ? `http://localhost:5000${product.image}` : null);
                         }}
                         className="p-3 bg-white/5 rounded-xl hover:bg-[#D4A24F] hover:text-black transition-all"
                       >
                          <Edit2 size={16} />
                       </button>
                       <button 
                         onClick={() => setIsDeleting(product.id)}
                         className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all"
                       >
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

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold">Add New Product</h3>
               <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full">
                 <X size={20} />
               </button>
             </div>
             
             <form className="space-y-6" encType="multipart/form-data" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               formData.append('source', 'Manual Ad');
               handleCreate(formData);
             }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Product Name</label>
                   <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Category</label>
                   <input name="category" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Price ($)</label>
                   <input name="price" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Stock Units</label>
                   <input name="stock" type="number" required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Product Image</label>
                   <input onChange={handleImageChange} name="image" type="file" accept="image/*" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4A24F] file:text-black hover:file:bg-[#b58b43]" />
                 </div>
                 {previewImage && (
                   <div className="md:col-span-2 flex justify-center mt-4">
                     <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                       <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                     </div>
                   </div>
                 )}
               </div>
               
               <div className="pt-6 flex gap-4">
                 <button type="submit" className="flex-1 py-4 bg-[#D4A24F] text-black font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                    Create Product
                 </button>
                 <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold">
                    Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold">Edit Product: {isEditing.name}</h3>
               <button onClick={() => setIsEditing(null)} className="p-2 hover:bg-white/5 rounded-full">
                 <X size={20} />
               </button>
             </div>
             
             <form className="space-y-6" encType="multipart/form-data" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               // If no file is selected, remove the empty 'image' field so we don't overwrite existing image
               const imageFile = formData.get('image') as File;
               if (!imageFile || imageFile.size === 0) {
                 formData.delete('image');
               }
               handleUpdate(isEditing.id, formData);
             }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Product Name</label>
                   <input name="name" defaultValue={isEditing.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Category</label>
                   <input name="category" defaultValue={isEditing.category} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Price ($)</label>
                   <input name="price" type="number" defaultValue={isEditing.price} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Stock Units</label>
                   <input name="stock" type="number" defaultValue={isEditing.stock} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F]" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Update Image (Optional)</label>
                   <input onChange={handleImageChange} name="image" type="file" accept="image/*" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#D4A24F] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4A24F] file:text-black hover:file:bg-[#b58b43]" />
                 </div>
                 {previewImage && (
                   <div className="md:col-span-2 flex justify-center mt-4">
                     <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                       <img src={previewImage.startsWith('http') || previewImage.startsWith('blob:') ? previewImage : `http://localhost:5000${previewImage}`} alt="Preview" className="w-full h-full object-cover" />
                     </div>
                   </div>
                 )}
               </div>
               
               <div className="pt-6 flex gap-4">
                 <button type="submit" className="flex-1 py-4 bg-[#D4A24F] text-black font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                    Save Changes
                 </button>
                 <button type="button" onClick={() => setIsEditing(null)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold">
                    Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#121215] border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
              <p className="text-white/40 text-sm mb-8">This action cannot be undone. This product will be permanently removed from your inventory.</p>
              <div className="flex gap-4">
                 <button onClick={() => handleDelete(isDeleting)} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all">Delete</button>
                 <button onClick={() => setIsDeleting(null)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Keep It</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
