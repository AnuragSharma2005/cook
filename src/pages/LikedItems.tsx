import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Search, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { appScriptApi } from '../lib/appScriptApi';
import { Recipe } from '../types';

const LikedItems = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const allRecipes = await storage.getRecipesAsync();
      setRecipes(allRecipes);
      setLikedIds(storage.getLikedRecipeIds());
    };

    loadData();
  }, []);

  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const likedRecipes = likedIds
    .map((id) => recipeMap.get(id))
    .filter((recipe): recipe is Recipe => Boolean(recipe));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecipes = likedRecipes.filter((recipe) => {
    if (!normalizedQuery) return true;

    return [recipe.title, recipe.description, recipe.category, recipe.ingredients.join(' ')].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });

  const handleUnlike = async (id: string) => {
    await appScriptApi.adjustRecipeLikes(id, -1);
    storage.unlikeRecipe(id);
    const nextIds = storage.removeLikedRecipe(id);
    setLikedIds(nextIds);
    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => (recipe.id === id ? { ...recipe, likes: Math.max(0, recipe.likes - 1) } : recipe)),
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF7F8] pb-24 pt-0 md:pb-20">
      <section className="px-6 pt-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-semibold">
              <ArrowLeft size={18} /> Back
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">Liked Items</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] border border-gray-100 p-5 md:p-6"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search your liked recipes..."
                className="w-full rounded-[1.4rem] border border-gray-200 bg-[#FFF8F3] pl-11 pr-4 py-4 text-sm font-medium text-gray-800 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          {likedRecipes.length === 0 ? (
            <div className="rounded-4xl bg-white p-10 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#FFF0F4] text-primary flex items-center justify-center">
                <Heart size={28} fill="currentColor" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">No liked items yet.</p>
              <p className="text-gray-500 mb-6">Tap the heart on a recipe to collect it here.</p>
              <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20">
                Explore recipes
              </Link>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="rounded-4xl bg-white p-10 text-center shadow-sm border border-gray-100">
              <p className="text-lg font-bold text-gray-900 mb-2">No saved recipes match your search.</p>
              <p className="text-gray-500">Try another keyword or clear the field.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link to={`/cook/${recipe.slug}`} className="group block">
                    <div className="aspect-4/5 rounded-3xl overflow-hidden relative mb-3 shadow-lg shadow-black/5 bg-white">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                      <button
                        onClick={async (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          await handleUnlike(recipe.id);
                        }}
                        className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-md"
                        aria-label={`Remove ${recipe.title} from liked items`}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                        {recipe.category}
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
                    <p className="mt-1 text-[10px] md:text-xs text-gray-500 font-medium line-clamp-2">{recipe.description}</p>
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

export default LikedItems;
