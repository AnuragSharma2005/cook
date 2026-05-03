import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Search, Star, Users } from 'lucide-react';
import { storage } from '../lib/storage';
import { Creator, Recipe } from '../types';

const Creators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCreators(storage.getCreators());
    setRecipes(storage.getRecipes());
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCreators = creators.filter((creator) => {
    if (!normalizedQuery) return true;

    return [creator.name, creator.bio].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const getRecipeCount = (creatorId: string) => recipes.filter((recipe) => recipe.creatorId === creatorId).length;

  return (
    <div className="min-h-screen bg-[#FDF7F8] pb-24 pt-0 md:pb-20">
      <section className="px-6 pt-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors font-semibold">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] border border-gray-100 p-6 md:p-8"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-3">Creators</p>
                <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900">Meet the people behind the recipes</h1>
                <p className="mt-4 text-gray-500 max-w-2xl">Browse every creator in the app, then tap into their profile to see their recipes and socials.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-70">
                <div className="rounded-[1.4rem] bg-[#FFF8F3] p-4 border border-[#F4E6DC]">
                  <div className="flex items-center gap-2 text-primary font-black text-sm mb-1"><Users size={16} /> Total</div>
                  <div className="text-2xl font-black text-gray-900">{creators.length}</div>
                </div>
                <div className="rounded-[1.4rem] bg-[#FFF8F3] p-4 border border-[#F4E6DC]">
                  <div className="flex items-center gap-2 text-primary font-black text-sm mb-1"><Star size={16} /> Recipes</div>
                  <div className="text-2xl font-black text-gray-900">{recipes.length}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 relative max-w-2xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search creators by name or bio..."
                className="w-full rounded-[1.4rem] border border-gray-200 bg-[#FFF8F3] pl-11 pr-4 py-4 text-sm font-medium text-gray-800 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          {filteredCreators.length === 0 ? (
            <div className="rounded-4xl bg-white p-10 text-center shadow-sm border border-gray-100">
              <p className="text-lg font-bold text-gray-900 mb-2">No creators match your search.</p>
              <p className="text-gray-500">Try a different name or clear the search field.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {filteredCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/creator/${creator.id}`}
                    className="group block rounded-4xl bg-white border border-gray-100 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        className="h-20 w-20 rounded-3xl object-cover border border-gray-100"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-xl font-black text-gray-900 line-clamp-1">{creator.name}</h2>
                          <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{creator.bio}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-[1.2rem] bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700">
                      <span>{getRecipeCount(creator.id)} recipes</span>
                      <span className="text-primary">View profile</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Creators;
