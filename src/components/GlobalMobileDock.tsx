import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Heart, Search, Star, Utensils } from 'lucide-react';
import { storage } from '../lib/storage';

interface GlobalMobileDockProps {
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
}

const GlobalMobileDock = ({ isSearchOpen, onOpenSearch, onCloseSearch }: GlobalMobileDockProps) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const recipes = useMemo(() => storage.getRecipes(), []);
  const creators = useMemo(() => storage.getCreators(), []);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const creatorById = useMemo(() => new Map(creators.map((creator) => [creator.id, creator])), [creators]);

  const recipeResults = recipes.filter((recipe) => {
    if (!normalizedQuery) return false;

    const creatorName = creatorById.get(recipe.creatorId || '')?.name.toLowerCase() || '';
    return [recipe.title, recipe.description, recipe.category, recipe.ingredients.join(' '), creatorName].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });

  const creatorResults = creators.filter((creator) => {
    if (!normalizedQuery) return false;
    return [creator.name, creator.bio].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  return (
    <>
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm md:hidden"
              onClick={onCloseSearch}
            />
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed left-0 right-0 top-16 z-60 md:top-20"
            >
              <div className="mx-3 md:mx-auto md:max-w-4xl rounded-b-4xl rounded-t-none bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)] border border-white/80 overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search recipes, creators, ingredients..."
                      className="w-full rounded-[1.4rem] border border-gray-200 bg-[#FFF8F3] pl-11 pr-11 py-4 text-sm font-medium text-gray-800 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    />
                    <button
                      onClick={onCloseSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
                      aria-label="Close search"
                    >
                      <span className="text-lg leading-none">×</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-5 space-y-5">
                  {normalizedQuery ? (
                    <>
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">Recipes</h3>
                          <span className="text-xs font-bold text-gray-400">{recipeResults.length}</span>
                        </div>
                        <div className="space-y-3">
                          {recipeResults.length > 0 ? recipeResults.slice(0, 4).map((recipe) => (
                            <Link
                              key={recipe.id}
                              to={`/cook/${recipe.slug}`}
                              onClick={onCloseSearch}
                              className="flex items-center gap-3 rounded-[1.3rem] border border-gray-100 bg-white p-2.5 shadow-sm"
                            >
                              <img src={recipe.imageUrl} alt={recipe.title} className="h-14 w-14 rounded-2xl object-cover" />
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate font-bold text-gray-900">{recipe.title}</h4>
                                <p className="truncate text-xs font-medium text-gray-500">{recipe.category}</p>
                              </div>
                              <ArrowRight size={16} className="text-gray-300" />
                            </Link>
                          )) : (
                            <p className="rounded-[1.3rem] bg-gray-50 px-4 py-5 text-sm text-gray-500">No recipes match this search.</p>
                          )}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">Creators</h3>
                          <span className="text-xs font-bold text-gray-400">{creatorResults.length}</span>
                        </div>
                        <div className="space-y-3">
                          {creatorResults.length > 0 ? creatorResults.slice(0, 4).map((creator) => (
                            <Link
                              key={creator.id}
                              to={`/creator/${creator.id}`}
                              onClick={onCloseSearch}
                              className="flex items-center gap-3 rounded-[1.3rem] border border-gray-100 bg-white p-2.5 shadow-sm"
                            >
                              <img src={creator.avatarUrl} alt={creator.name} className="h-14 w-14 rounded-2xl object-cover" />
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate font-bold text-gray-900">{creator.name}</h4>
                                <p className="truncate text-xs font-medium text-gray-500">{creator.bio}</p>
                              </div>
                              <ArrowRight size={16} className="text-gray-300" />
                            </Link>
                          )) : (
                            <p className="rounded-[1.3rem] bg-gray-50 px-4 py-5 text-sm text-gray-500">No creators match this search.</p>
                          )}
                        </div>
                      </section>
                    </>
                  ) : (
                    <div className="rounded-[1.3rem] bg-[#FFF8F3] px-4 py-5 text-sm text-gray-500">
                      Search recipes or creators.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 md:hidden">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-[#E93C70]' : 'text-gray-400'}`}>
          <Utensils size={20} />
          <span className="text-[10px] font-bold">Recipes</span>
        </Link>
        <Link to="/creators" className={`flex flex-col items-center gap-1 ${location.pathname === '/creators' ? 'text-[#E93C70]' : 'text-gray-400'}`}>
          <Star size={20} />
          <span className="text-[10px] font-bold">Creators</span>
        </Link>
        <button
          onClick={onOpenSearch}
          className={`flex flex-col items-center gap-1 ${isSearchOpen ? 'text-[#E93C70]' : 'text-gray-400'}`}
        >
          <Search size={20} />
          <span className="text-[10px] font-bold">Search</span>
        </button>
        <Link to="/liked" className={`flex flex-col items-center gap-1 ${location.pathname === '/liked' ? 'text-[#E93C70]' : 'text-gray-400'}`}>
          <Heart size={20} />
          <span className="text-[10px] font-bold">Liked</span>
        </Link>
      </div>
    </>
  );
};

export default GlobalMobileDock;
