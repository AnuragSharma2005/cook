import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Star, ArrowLeft, Grid, TrendingUp, Youtube, Instagram, Facebook, Twitter } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FDF7F8] md:bg-white pb-24 pt-20">
      {/* Header Section */}
      <div className="bg-[#FFE4E8]/30 pt-12 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={20} /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
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
            >
              <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-4">{creator.name}</h1>
              <p className="text-lg text-gray-600 max-w-xl">{creator.bio}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E93C70]">{recipes.length}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipes</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E93C70]">
                    {recipes.reduce((acc, curr) => acc + curr.likes, 0)}
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Likes</div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                {creator.youtubeUrl && (
                  <a href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                    <Youtube size={20} />
                  </a>
                )}
                {creator.instagramUrl && (
                  <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors shadow-sm">
                    <Instagram size={20} />
                  </a>
                )}
                {creator.facebookUrl && (
                  <a href={creator.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                    <Facebook size={20} />
                  </a>
                )}
                {creator.twitterUrl && (
                  <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors shadow-sm">
                    <Twitter size={20} />
                  </a>
                )}
                {creator.threadsUrl && (
                  <a href={creator.threadsUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors shadow-sm">
                     <span className="font-bold text-lg leading-none -mt-0.5">@</span>
                  </a>
                )}
              </div>
            </motion.div>
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
