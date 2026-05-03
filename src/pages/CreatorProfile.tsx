import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Star, ArrowLeft, Grid, TrendingUp } from 'lucide-react';
import { FaYoutube, FaInstagram, FaFacebook, FaXTwitter, FaThreads } from 'react-icons/fa6';
import { storage } from '../lib/storage';
import { Creator, Recipe } from '../types';

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const allCreators = storage.getCreators();
      const foundCreator = allCreators.find(c => c.id === id);

      if (foundCreator) {
        setCreator(foundCreator);
        const allRecipes = storage.getRecipes();
        const creatorRecipes = allRecipes.filter(r => r.creatorId === id);
        setRecipes(creatorRecipes);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading creator profile...</div>;
  }

  if (!creator) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Creator not found</h2>
        <Link to="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  const sortedByLikes = [...recipes].sort((a, b) => b.likes - a.likes);
  const topRecipes = sortedByLikes.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDF7F8] md:bg-white pb-24 pt-0">
      {/* Header Section */}
      <div className="bg-[#FFE4E8]/30 pt-6 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
            <ArrowLeft size={20} /> Back to Home
          </Link>

          <div className="grid grid-cols-[auto_1fr] items-start gap-6 text-left">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white"
            >
              <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-black font-serif text-gray-900 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">{creator.name}</h1>
              <p className="text-lg text-gray-600 max-w-xl">{creator.bio}</p>

              <div className="flex flex-wrap items-center justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E93C70]">{recipes.length}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipes</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E93C70]">
                    {recipes.reduce((acc, curr) => acc + curr.likes, 0)}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Likes</div>
                </div>
              </div>
            </motion.div>

            {/* Social Media Links */}
            <div className="col-span-full flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              {[
                { url: creator.youtubeUrl, icon: <FaYoutube size={18} />, activeClass: 'bg-[#FF0000] text-white' },
                { url: creator.instagramUrl, icon: <FaInstagram size={18} />, activeClass: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white' },
                { url: creator.facebookUrl, icon: <FaFacebook size={18} />, activeClass: 'bg-[#1877F2] text-white' },
                { url: creator.twitterUrl, icon: <FaXTwitter size={18} />, activeClass: 'bg-[#1D9BF0] text-white' },
                { url: creator.threadsUrl, icon: <FaThreads size={18} />, activeClass: 'bg-[#000000] text-white' },
              ].map((item, idx) => (
                item.url ? (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm ${item.activeClass}`}
                  >
                    {item.icon}
                  </a>
                ) : (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-full flex items-center justify-center opacity-60 ${item.activeClass} shadow-sm`}
                  >
                    {item.icon}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        {/* Most Viewed Recipes */}
        {topRecipes.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Most Viewed Recipes</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {topRecipes.map((recipe, idx) => (
                <Link key={recipe.id} to={`/cook/${recipe.slug}`} className="block group">
                  <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative mb-3 shadow-md md:shadow-xl shadow-gray-200/50">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Heart size={12} className="text-[#E93C70] fill-[#E93C70]" /> {recipe.likes}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-0.5">{recipe.title}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">{recipe.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Listings */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
              <Grid size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">All Listings</h2>
          </div>

          {recipes.length === 0 ? (
            <p className="text-gray-500 text-center py-10">This creator hasn't posted any recipes yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {recipes.map((recipe) => (
                <Link key={recipe.id} to={`/cook/${recipe.slug}`} className="block group">
                  <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative mb-3 shadow-md md:shadow-xl shadow-gray-200/50">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Heart size={12} className="text-[#E93C70]" /> {recipe.likes}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-0.5">{recipe.title}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">{recipe.category}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
