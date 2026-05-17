import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChefHat, Timer, Gauge, Filter, Loader2, X, Search, Video, ChevronRight, Play, Globe, WifiOff, Wand2, Sparkles } from 'lucide-react';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  cookingTime: number;
  difficulty: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    cookingTime: 30,
    difficulty: 'Medium',
    category: 'Lunch',
    imageUrl: '',
    videoUrl: ''
  });

  const fetchRecipes = async (category = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = category ? `/api/recipes?category=${category}` : '/api/recipes';
      const res = await fetch(url);
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
      
      // Check online status
      const statusRes = await fetch('/api/status');
      const statusData = await statusRes.json();
      setIsOnline(statusData.isOnline);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError('Mode: Offline Archive');
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(filter);
  }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      let finalImageUrl = newRecipe.imageUrl;
      
      // Auto-generate image if missing
      if (!finalImageUrl) {
        try {
          const aiRes = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newRecipe.title, category: newRecipe.category })
          });
          if (aiRes.ok) {
            const { imageUrl } = await aiRes.json();
            finalImageUrl = imageUrl;
          }
        } catch (err) {
          console.error('AI Image Gen error:', err);
        }
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecipe,
          imageUrl: finalImageUrl,
          ingredients: newRecipe.ingredients.split(',').map(i => i.trim()).filter(i => i)
        })
      });
      if (res.ok) {
        setIsAdding(false);
        setNewRecipe({ title: '', ingredients: '', instructions: '', cookingTime: 30, difficulty: 'Medium', category: 'Lunch', imageUrl: '', videoUrl: '' });
        fetchRecipes(filter);
      }
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleManualImageGen = async () => {
    if (!newRecipe.title) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRecipe.title, category: newRecipe.category })
      });
      if (res.ok) {
        const { imageUrl } = await res.json();
        setNewRecipe({ ...newRecipe, imageUrl });
      }
    } catch (err) {
      console.error('Manual Image Gen error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRecipes(filter);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.instructions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-paper font-sans text-coal selection:bg-zest/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-zest/10">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-zest rounded-full flex items-center justify-center shadow-lg shadow-zest/10 relative">
                <ChefHat className="text-paper w-6 h-6 md:w-7 md:h-7" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-paper flex items-center justify-center ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
                   {isOnline ? <Globe size={8} className="text-white" /> : <WifiOff size={8} className="text-white" />}
                </div>
              </div>
              <div>
                <h1 className="flex flex-col font-display font-black uppercase tracking-tighter leading-none">
                  <span className="text-zest text-[8px] md:text-[10px] tracking-[0.2em]">THE</span>
                  <span className="text-lg md:text-2xl -mt-0.5">GLOBAL KITCHEN</span>
                </h1>
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-coal/40">
                      {isOnline ? 'Cloud Synced' : 'Offline Archive'}
                   </span>
                </div>
              </div>
            </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(!isAdding)}
            className="bg-zest text-paper px-5 py-2 md:px-8 md:py-3 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl shadow-zest/20 transition-all hover:bg-zest/90"
          >
            ADD
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Minimal Hero */}
        <section className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-9xl font-display font-black text-coal leading-[0.85] tracking-tighter uppercase">
              BRENDA'S<br/>
              <span className="text-zest">ARCHIVE</span>
            </h2>
          </motion.div>

          <div className="relative group w-full max-w-sm">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-coal/20 group-focus-within:text-zest transition-colors" size={20} />
            <input 
              type="text"
              placeholder="SEARCH COLLECTION..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-coal/5 rounded-3xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-zest/10 focus:border-zest outline-none transition-all shadow-xl shadow-coal/5"
            />
          </div>
        </section>

        {/* Filters - More Compact */}
        <div className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-2">
            {['', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === cat 
                    ? 'bg-coal text-paper shadow-xl shadow-coal/20' 
                    : 'bg-dust text-coal/40 hover:text-coal'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid - Adaptive columns */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zest/30">
            <Loader2 className="animate-spin" size={32} strokeWidth={3} />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-coal/5 rounded-[40px] gap-4 bg-dust/30">
            <Sparkles className="text-zest/20" size={32} />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-coal/30">Archive empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredRecipes.map((recipe) => (
                <motion.div
                  key={recipe._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white rounded-[32px] border border-coal/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col overflow-hidden cursor-pointer active:scale-[0.98]"
                >
                  {recipe.imageUrl && (
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-coal/60 via-transparent to-transparent opacity-60" />
                      {recipe.videoUrl && (
                        <div className="absolute top-4 right-4 bg-paper/90 backdrop-blur-md p-3 rounded-full shadow-xl transform transition-all group-hover:scale-110 group-hover:rotate-12">
                          <Play size={16} className="text-zest fill-zest" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-8 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zest bg-zest/5 px-3 py-1 rounded-full border border-zest/10">
                          {recipe.category}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(e, recipe._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full text-coal/20 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-display font-black text-coal mb-6 uppercase tracking-tight leading-tight group-hover:text-zest transition-colors">
                        {recipe.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-coal text-[10px] font-black tracking-widest">
                          <Timer size={14} className="text-zest" />
                          {recipe.cookingTime}<span className="opacity-40">M</span>
                        </div>
                        <div className="flex items-center gap-2 text-coal text-[10px] font-black tracking-widest">
                          <Gauge size={14} className="text-zest" />
                          {recipe.difficulty.toUpperCase()}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-zest opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coal/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-6 overflow-y-auto"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              layoutId={selectedRecipe._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-paper rounded-[48px] w-full max-w-4xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-8 right-8 z-10">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="p-4 bg-coal text-paper hover:bg-zest rounded-full transition-all shadow-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-[400px] lg:h-full min-h-[500px] bg-coal/5">
                  {selectedRecipe.videoUrl ? (
                    <div className="w-full h-full relative group/player">
                      <video 
                        autoPlay 
                        loop 
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                        src={selectedRecipe.videoUrl}
                        onError={(e) => {
                          // Fallback to image if video fails (e.g. placeholder text file)
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const img = document.createElement('img');
                            img.src = selectedRecipe.imageUrl || '';
                            img.className = 'w-full h-full object-cover';
                            parent.appendChild(img);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <img 
                      src={selectedRecipe.imageUrl} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
                  <div className="absolute bottom-12 left-12 right-12">
                    <span className="text-zest font-black uppercase tracking-[0.3em] text-xs mb-4 block">{selectedRecipe.category}</span>
                    <h2 className="text-5xl md:text-7xl font-display font-black text-coal uppercase tracking-tighter leading-[0.85]">{selectedRecipe.title}</h2>
                  </div>
                </div>

                <div className="p-12 lg:p-16 max-h-[90vh] overflow-y-auto no-scrollbar">
                  <div className="flex gap-8 mb-16 border-b border-coal/5 pb-8">
                    <div>
                      <span className="text-[10px] font-black text-coal/30 uppercase tracking-[0.2em] block mb-2">Duration</span>
                      <div className="flex items-center gap-2 font-black text-xl">
                        <Timer size={20} className="text-zest" />
                        {selectedRecipe.cookingTime} MIN
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-coal/30 uppercase tracking-[0.2em] block mb-2">Complexity</span>
                      <div className="flex items-center gap-2 font-black text-xl uppercase italic">
                        <Gauge size={20} className="text-zest" />
                        {selectedRecipe.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h4 className="text-[10px] font-black text-coal uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                        <span className="w-8 h-1 bg-zest rounded-full" />
                        Ingredients
                      </h4>
                      <ul className="grid grid-cols-1 gap-4">
                        {selectedRecipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-coal/60 font-bold uppercase text-xs tracking-widest border-b border-coal/5 pb-2">
                            <span className="text-zest">{idx + 1}.</span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-coal uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                        <span className="w-8 h-1 bg-zest rounded-full" />
                        Process
                      </h4>
                      <p className="text-base font-display font-medium leading-relaxed text-coal/80 uppercase tracking-tight">
                        {selectedRecipe.instructions}
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zest/20 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-paper rounded-[32px] md:rounded-[40px] p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative"
            >
              <div className="sticky top-0 float-right z-10">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 bg-paper/80 backdrop-blur-sm hover:bg-zest/10 rounded-full text-zest transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10 flex justify-between items-end">
                <h2 className="text-5xl font-display font-extrabold text-coal uppercase tracking-tighter">NEW</h2>
                {generating && <Loader2 className="animate-spin text-zest mb-2" size={24} />}
              </div>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em]">Title</label>
                  </div>
                  <input
                    required
                    type="text"
                    value={newRecipe.title}
                    onChange={e => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    className="w-full bg-white border-2 border-coal/5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest focus:border-transparent outline-none transition-all font-display font-bold text-xl uppercase tracking-tight"
                    placeholder="E.G. FIRECRACKER"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    Visual Artifacts
                    <Sparkles size={12} className="text-zest" />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-white border-2 border-dashed border-coal/5 rounded-[32px] overflow-hidden flex flex-col items-center justify-center relative group">
                      {newRecipe.imageUrl ? (
                        <>
                          <img src={newRecipe.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => setNewRecipe({ ...newRecipe, imageUrl: '' })}
                            className="absolute top-4 right-4 bg-coal text-paper p-2 rounded-full focus:ring-4 ring-coal/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          type="button"
                          onClick={handleManualImageGen}
                          disabled={generating}
                          className="flex flex-col items-center gap-3 text-coal/20 hover:text-zest transition-all p-8 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-dust flex items-center justify-center group-hover:bg-zest/10 transition-colors">
                            <Wand2 size={32} className="group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
                            {generating ? 'CONSULTING AI...' : 'GENERATE MASTERPIECE'}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="space-y-4">
                         <div>
                          <label className="block text-[8px] font-black text-coal/30 uppercase tracking-[0.2em] mb-2">Image Source</label>
                          <input
                            type="text"
                            value={newRecipe.imageUrl}
                            onChange={e => setNewRecipe({ ...newRecipe, imageUrl: e.target.value })}
                            className="w-full bg-white border border-zest/10 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:ring-2 focus:ring-zest outline-none transition-all"
                            placeholder="PASTE URL IF NOT AUTO-GENERATING"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-coal/30 uppercase tracking-[0.2em] mb-2">Video Motion</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newRecipe.videoUrl}
                              onChange={e => setNewRecipe({ ...newRecipe, videoUrl: e.target.value })}
                              className="w-full bg-white border border-zest/10 rounded-xl px-4 py-3 pl-10 text-xs font-bold uppercase focus:ring-2 focus:ring-zest outline-none transition-all"
                              placeholder="E.G. /assets/videos/prep.mp4"
                            />
                            <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zest/40" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-2">Collection</label>
                  <select
                    value={newRecipe.category}
                    onChange={e => setNewRecipe({ ...newRecipe, category: e.target.value })}
                    className="w-full bg-white border border-zest/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest outline-none transition-all text-sm font-bold uppercase"
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Dessert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-2">Level</label>
                  <select
                    value={newRecipe.difficulty}
                    onChange={e => setNewRecipe({ ...newRecipe, difficulty: e.target.value })}
                    className="w-full bg-white border border-zest/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest outline-none transition-all text-sm font-bold uppercase"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-2">Ingredients</label>
                  <textarea
                    required
                    value={newRecipe.ingredients}
                    onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    className="w-full bg-white border border-zest/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest outline-none h-24 transition-all font-display font-bold text-base uppercase"
                    placeholder="LIST HERE"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-2">Process</label>
                  <textarea
                    required
                    value={newRecipe.instructions}
                    onChange={e => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    className="w-full bg-white border border-zest/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest outline-none h-32 transition-all font-display font-bold text-base uppercase"
                    placeholder="DESCRIBE..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-coal uppercase tracking-[0.2em] mb-2">Time (MIN)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newRecipe.cookingTime}
                    onChange={e => setNewRecipe({ ...newRecipe, cookingTime: parseInt(e.target.value) })}
                    className="w-full bg-white border border-zest/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zest outline-none transition-all text-sm font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-zest text-paper py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-zest/20 hover:bg-zest/90"
                  >
                    SAVE ENTRY
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
