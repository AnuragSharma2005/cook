import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Heart, ArrowRight, Play, Utensils, Star, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Recipe } from '../types';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const categories = ['All', 'Drinks', 'Healthy', 'Shakes', 'Fast Food', 'Desserts', 'Traditional'];

  useEffect(() => {
    const loadRecipesData = () => {
      setLoading(true);
      const data = storage.getRecipes();
      setRecipes(data);
      setLoading(false);
    };
    loadRecipesData();
    
    // Local storage for anonymous likes
    const localLikes = localStorage.getItem('kaju_likes_tracking');
    if (localLikes) setLikedIds(JSON.parse(localLikes));
  }, []);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedIds.includes(id)) return;

    storage.likeRecipe(id);
    const newLikedIds = [...likedIds, id];
    setLikedIds(newLikedIds);
    localStorage.setItem('kaju_likes_tracking', JSON.stringify(newLikedIds));
    
    // Update local state to show +1 immediately
    setRecipes(recipes.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredRecipes = recipes.filter(r => r.featured).slice(0, 4);
  const trendingRecipes = [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FDF7F8] md:bg-white pb-24 md:pb-0">
      {/* Desktop Hero Section (Hidden on mobile) */}
      <section className="hidden md:block relative pt-12 pb-20 px-6 hero-pattern">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
            >
              Cooking with Love & Joy
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold font-serif mb-8 leading-tight text-gray-900"
            >
              Master the Craft <br />
              with <span className="text-primary italic">Kaju's</span> Recipes
            </motion.h1>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="relative max-w-xl mx-auto md:mx-0 mb-10"
            >
              <input 
                type="text" 
                placeholder="Search favorite recipes..." 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-primary/30 transition-all shadow-xl shadow-gray-200/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center md:justify-start gap-4"
            >
              <a href="#recipes-grid" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/30">
                Explore All Recipes <ArrowRight size={20} />
              </a>
              <button className="flex items-center gap-3 font-semibold group px-6 py-4 rounded-2xl hover:bg-white transition-all">
                <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={16} fill="currentColor" />
                </div>
                <span>Watch Tutorials</span>
              </button>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="relative z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&h=800&fit=crop" 
                alt="Main dish" 
                className="w-full h-auto rounded-[3rem] shadow-[-20px_20px_60px_rgba(0,0,0,0.1)] rotate-[-2deg]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-10 -right-10 glass-morphism p-5 rounded-3xl shadow-2xl animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center text-white">
                    <Flame />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Trending Now</h4>
                    <p className="text-[10px] text-muted">Most liked this week</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Bar for Desktop */}
      <section className="hidden md:block py-10 px-6 overflow-x-auto no-scrollbar bg-gray-50/50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 py-4 min-w-max">
            {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-muted hover:bg-white hover:text-primary border border-gray-100'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </section>

      {/* Mobile Top Header (Osta Style) */}
      <header className="md:hidden px-6 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-[#E93C70] tracking-tight">kaju</h1>
        <div className="flex items-center gap-4 text-gray-400">
          <button className="p-2 hover:bg-white rounded-full transition-colors"><Search size={24} /></button>
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kaju" alt="User" />
          </div>
        </div>
      </header>

      {/* Search Bar for Mobile */}
      <div className="md:hidden px-6 mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search saved recipes..." 
            className="w-full bg-[#F3EBEB] border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Folders Section for Mobile */}
      <section className="md:hidden px-6 mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Folders &gt;</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`w-20 h-20 rounded-[2rem] overflow-hidden border-2 transition-all ${activeCategory === cat ? 'border-[#E93C70]' : 'border-transparent'}`}>
                <img 
                  src={`https://images.unsplash.com/photo-${cat === 'Healthy' ? '1512621776951-a57141f2eefd' : cat === 'Shakes' ? '1546173159-315724a31696' : '1504674900247-0877df9cc836'}?q=80&w=200&h=200&fit=crop`} 
                  alt={cat} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[10px] font-bold ${activeCategory === cat ? 'text-[#E93C70]' : 'text-gray-500'}`}>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recipes Section - Shared but with responsive grid */}
      <section id="recipes-grid" className="px-6 py-6 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="hidden md:flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                {activeCategory === 'All' ? 'Latest Recipes' : `Top ${activeCategory}`}
              </h2>
              <p className="text-muted text-sm">Browse our curated collection of deliciousness</p>
            </div>
          </div>
          
          <div className="md:hidden flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Recipes &gt;</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium">Cooking up your list...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
              {filteredRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/cook/${recipe.slug}`} className="block group">
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative mb-3 shadow-lg shadow-black/5 md:shadow-xl md:shadow-gray-200/50">
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <button 
                      onClick={(e) => handleLike(recipe.id, e)}
                      className={`absolute bottom-3 right-3 md:top-4 md:right-4 md:bottom-auto p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${likedIds.includes(recipe.id) ? 'bg-[#E93C70] text-white' : 'bg-white/90 text-gray-400 hover:bg-primary hover:text-white shadow-sm'}`}
                    >
                      <Heart size={likedIds.includes(recipe.id) ? 18 : 16} fill={likedIds.includes(recipe.id) ? 'currentColor' : 'none'} />
                    </button>
                    <div className="hidden md:block absolute bottom-4 left-4 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {recipe.category}
                    </div>
                  </div>
                  <h3 className="text-xs md:text-xl font-bold text-gray-800 mb-0.5 md:mb-2 line-clamp-1 md:line-clamp-2 md:group-hover:text-primary transition-colors">{recipe.title}</h3>
                  <p className="text-[10px] md:text-sm text-gray-400 font-bold tracking-tight">by kaju's kitchen</p>
                  
                  <div className="hidden md:flex items-center gap-1.5 mt-3 text-xs font-bold text-muted">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span>4.8</span>
                      <span>({recipe.likes} Likes)</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Section for Desktop */}
      {featuredRecipes.length > 0 && (
         <section className="hidden md:block py-20 px-6 bg-primary/5">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold font-serif mb-12 text-center text-gray-900">Featured Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuredRecipes.map((recipe) => (
                        <Link key={recipe.id} to={`/cook/${recipe.slug}`} className="bg-white rounded-[3rem] p-6 flex flex-col sm:flex-row gap-8 items-center hover:shadow-xl transition-all group border border-gray-100">
                            <img src={recipe.imageUrl} className="w-40 h-40 rounded-[2rem] object-cover" />
                            <div className="flex-1">
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{recipe.category}</span>
                                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors text-gray-900">{recipe.title}</h3>
                                <div className="flex items-center gap-4 text-sm font-bold">
                                    <span className="flex items-center gap-1"><Heart size={14} /> {recipe.likes}</span>
                                    <span className="text-muted">By Kaju's Kitchen</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
         </section>
      )}

      {/* Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50 md:hidden">
        <button className="text-[#E93C70] flex flex-col items-center gap-1">
          <Utensils size={20} />
          <span className="text-[10px] font-bold">Recipes</span>
        </button>
        <button className="text-gray-400 flex flex-col items-center gap-1">
          <Star size={20} />
          <span className="text-[10px] font-bold">Creators</span>
        </button>
        <button className="text-gray-400 flex flex-col items-center gap-1">
          <Search size={20} />
          <span className="text-[10px] font-bold">Groceries</span>
        </button>
        <button className="text-gray-400 flex flex-col items-center gap-1" onClick={() => window.location.href='/admin'}>
          <div className="w-5 h-5 rounded-full bg-gray-200" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
