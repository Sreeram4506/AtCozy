import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X,
  Loader2,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // In a real app, you'd use api.categories.getAll()
      // But since we have specific admin routes in the backend, let's use them
      const resp = await fetch('/api/categories');
      const data = await resp.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const resp = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isFeatured: formData.get('isFeatured') === 'on'
        }),
      });
      
      if (!resp.ok) throw new Error('Failed to create category');
      
      const newCat = await resp.json();
      setCategories([newCat, ...categories]);
      toast.success('Category created successfully');
      setIsAdding(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditing) return;
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const resp = await fetch(`/api/categories/${isEditing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isFeatured: formData.get('isFeatured') === 'on'
        }),
      });
      
      if (!resp.ok) throw new Error('Failed to update category');
      
      const updatedCat = await resp.json();
      setCategories(categories.map(c => c._id === isEditing._id ? updatedCat : c));
      toast.success('Category updated successfully');
      setIsEditing(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!resp.ok) throw new Error('Failed to delete category');
      
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Category deleted');
      setIsDeleting(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search categories..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm placeholder:text-white/20 focus:border-[#D4A24F]/50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto h-14 px-8 rounded-2xl bg-[#D4A24F] text-black text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#D4A24F]/20"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-4 text-white/20">
             <Loader2 className="w-10 h-10 animate-spin text-[#D4A24F]" />
             <p className="text-xs uppercase tracking-widest font-bold">Organizing Taxonomy...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-40 text-center text-white/20 italic">No categories found.</div>
        ) : filteredCategories.map((category) => (
          <div key={category._id} className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:border-[#D4A24F]/50 transition-all duration-500 shadow-2xl backdrop-blur-sm">
             <div className="relative h-48 overflow-hidden bg-black/50">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 italic">
                     <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white tracking-tight">{category.name}</h3>
                      {category.isFeatured && (
                        <span className="bg-[#D4A24F] text-black text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Featured</span>
                      )}
                   </div>
                </div>
             </div>
             <div className="p-6 space-y-4">
                <p className="text-white/40 text-xs line-clamp-2 min-h-[32px] leading-relaxed">
                   {category.description || 'No description provided for this collection category.'}
                </p>
                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#D4A24F]">
                      <Tag size={12} /> {category.slug}
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditing(category)}
                        className="p-3 bg-white/5 rounded-xl hover:bg-[#D4A24F] hover:text-black transition-all"
                      >
                         <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(category._id)}
                        className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#121215] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-bold">{isAdding ? 'Design New Category' : `Refine Category: ${isEditing?.name}`}</h2>
                 <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={isAdding ? handleCreate : handleUpdate} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Name</label>
                       <input name="name" defaultValue={isEditing?.name} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#D4A24F]/50 transition-all" placeholder="e.g. European Dresses" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Slug</label>
                       <input name="slug" defaultValue={isEditing?.slug} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#D4A24F]/50 transition-all" placeholder="e.g. european-dresses" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Description</label>
                       <textarea name="description" defaultValue={isEditing?.description} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#D4A24F]/50 transition-all min-h-[100px] resize-none" placeholder="A brief summary of this collection..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Cover Image URL</label>
                       <input name="image" defaultValue={isEditing?.image} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#D4A24F]/50 transition-all" placeholder="https://..." />
                    </div>
                 </div>

                 <label className="flex items-center gap-4 cursor-pointer group w-fit">
                    <div className="relative">
                       <input type="checkbox" name="isFeatured" defaultChecked={isEditing?.isFeatured} className="sr-only peer" />
                       <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:bg-[#D4A24F] transition-all" />
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-black" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-[#D4A24F] transition-colors">Featured on Homepage</span>
                 </label>

                 <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 h-16 bg-[#D4A24F] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#D4A24F]/20">
                       {isAdding ? 'Establish Category' : 'Save Adjustments'}
                    </button>
                    <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="px-10 h-16 border border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                       Cancel
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#121215] border border-white/10 rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Abolish Category?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">This will remove the category permanently. Products assigned to this category will remain, but lose their categorization.</p>
              <div className="flex flex-col gap-4">
                 <button onClick={() => handleDelete(isDeleting)} className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all uppercase tracking-widest text-xs">Confirm Dissolution</button>
                 <button onClick={() => setIsDeleting(null)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs">Retain Category</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
