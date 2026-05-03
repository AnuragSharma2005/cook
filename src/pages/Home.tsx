import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight, Play, Utensils, Star, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Recipe, Creator } from '../types';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const categories = ['All', 'Drinks', 'Healthy', 'Shakes', 'Fast Food', 'Desserts', 'Traditional'];

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const data = storage.getRecipes();
      const creatorData = storage.getCreators();
      setRecipes(data);
      setCreators(creatorData);
      setLoading(false);
    };
    loadData();

    setLikedIds(storage.getLikedRecipeIds());
  }, []);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedIds.includes(id)) return;

    storage.likeRecipe(id);
    const newLikedIds = storage.addLikedRecipe(id);
    setLikedIds(newLikedIds);

    // Update local state to show +1 immediately
    setRecipes(recipes.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
  };

  const filteredRecipes = recipes.filter((recipe) => activeCategory === 'All' || recipe.category === activeCategory);

  const featuredRecipes = recipes.filter(r => r.featured).slice(0, 4);
  const trendingRecipes = [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FDF7F8] md:bg-white pb-24 md:pb-0">
      {/* New Hero Section */}
      <section className="relative pt-6 pb-20 px-6 overflow-hidden">
        {/* Curved Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-[120%] h-full bg-[#FFE4E8] rounded-b-[50%] z-0"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] border-white shadow-xl bg-white mb-4"
          >
            <img
              src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop"
              alt="Cook"
              className="w-full h-full object-cover object-top"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-[3.5rem] font-black font-serif leading-[1.1] text-gray-900 uppercase tracking-tight mb-2"
          >
            Your free digital<br />
            <span className="inline-block border-4 border-gray-900 rounded-full px-6 md:px-8 py-2 md:py-3 mt-2 text-[#E93C70]">recipe box</span>
          </motion.h1>
        </div>
      </section>

      {/* Text Card below curved background */}
      <section className="relative z-20 px-6 -mt-12 pb-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-4xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-[#E93C70] text-center"
          >
            <p className="text-gray-600 mb-6 text-lg font-medium leading-relaxed">
              Your recipes, your style — <br className="block sm:hidden" />
              share every step.
            </p>
            <button className="bg-[#E93C70] text-white px-10 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-[#E93C70]/30 text-lg">
              Get Started
            </button>
          </motion.div>
        </div>
      </section>





      {/* Creators Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-8 md:mb-12">
            <div className="hidden md:block h-px bg-linear-to-r from-transparent to-[#8A5A44] w-32 opacity-50"></div>
            <h2 className="text-[1.3rem] sm:text-2xl md:text-4xl font-bold font-serif text-[#4A3B32] text-center whitespace-nowrap tracking-tight md:tracking-normal">
              The Creators Behind the Recipes
            </h2>
            <div className="hidden md:block h-px bg-linear-to-l from-transparent to-[#8A5A44] w-32 opacity-50"></div>
          </div>

          <div className="flex gap-4 md:gap-10 overflow-x-auto no-scrollbar pb-8 pt-4 snap-x snap-mandatory justify-start md:justify-center px-2 md:px-4">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                to={`/creator/${creator.id}`}
                className="flex flex-col items-center gap-3 shrink-0 snap-center group w-25 md:w-32"
              >
                <div className="w-22 h-22 md:w-28 md:h-28 rounded-2xl md:rounded-4xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 bg-gray-50 border border-gray-100 p-1">
                  <div className="w-full h-full rounded-[0.9rem] md:rounded-3xl overflow-hidden">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800 text-center line-clamp-2 leading-tight px-1">
                  {creator.name}
                </span>
              </Link>
            ))}
          </div>
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
                  <div className="aspect-4/5 rounded-xl overflow-hidden relative mb-3 shadow-lg shadow-black/5 md:shadow-xl md:shadow-gray-200/50">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
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
                  <p className="text-[10px] md:text-sm text-gray-400 font-bold tracking-tight">by cookwithkaju</p>

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
                <Link key={recipe.id} to={`/cook/${recipe.slug}`} className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row gap-8 items-center hover:shadow-xl transition-all group border border-gray-100">
                  <img src={recipe.imageUrl} className="w-40 h-40 rounded-lg object-cover" />
                  <div className="flex-1">
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{recipe.category}</span>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors text-gray-900">{recipe.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-bold">
                      <span className="flex items-center gap-1"><Heart size={14} /> {recipe.likes}</span>
                      <span className="text-muted">By cookwithkaju</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )} 
           <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-brand-bg relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#D32F52] to-[#D32F52] rounded-2xl sm:rounded-3xl md:rounded-[3rem] py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-16 relative overflow-hidden md:overflow-visible">
            
            {/* Mobile image on top */}
            <div className="block md:hidden mb-8">
              <div className="mx-auto w-[320px] h-[380px] rounded-[2rem] overflow-hidden shadow-2xl border-[10px] border-white">
                <img 
                  src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=600&fit=crop"
                  alt="Food Recipe"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 relative z-10 text-center md:text-left mx-auto md:mx-0">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 md:mb-1 leading-tight">
                Are You a Creator?
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-6 md:mb-10">
                Share Your Amazing Recipes!
              </p>
              <Link 
                to="/collab"
                className="inline-block bg-white text-[#D32F52] font-bold px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full hover:shadow-lg transition-all shadow-md text-xs sm:text-sm md:text-base"
              >
                Start Collaborating
              </Link>
            </div>

            {/* Right Side - Image with Tilt - Hidden on mobile, visible on md and above */}
            <div className="hidden md:block absolute left-1/2 md:left-auto md:right-0 top-full md:top-4/5 -translate-y-1/2 h-96 w-96">
              <div className="w-80 h-96 rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-white transform -rotate-12">
                <img 
                  src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=600&fit=crop"
                  alt="Food Recipe"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
