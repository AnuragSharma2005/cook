import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { storage } from '../lib/storage';
import { 
  Heart, 
  Share2, 
  Download, 
  ArrowLeft, 
  Clock, 
  Flame,
  Users, 
  Utensils,
  Play,
  Instagram,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { Recipe } from '../types';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

const RecipeDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'directions'>('ingredients');

  useEffect(() => {
    const loadRecipeData = () => {
      setLoading(true);
      const data = storage.getRecipes();
      const found = data.find(r => r.slug === slug);
      if (found) {
        setRecipe(found);
      }
      setLoading(false);
    };

    loadRecipeData();
    
    const localLikes = localStorage.getItem('kaju_likes_tracking');
    if (localLikes && JSON.parse(localLikes).includes(slug)) {
      setLiked(true);
    }
  }, [slug]);

  const handleLike = () => {
    if (liked || !recipe) return;
    storage.likeRecipe(recipe.id);
    setLiked(true);
    setRecipe({ ...recipe, likes: recipe.likes + 1 });
    const localLikes = JSON.parse(localStorage.getItem('kaju_likes_tracking') || '[]');
    localStorage.setItem('kaju_likes_tracking', JSON.stringify([...localLikes, slug]));
  };

  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = () => {
    if (!recipe) return;
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text(recipe.title, 20, 30);
    doc.setFontSize(12);
    doc.text(`Category: ${recipe.category}`, 20, 45);
    doc.text(`Ingredients:`, 20, 60);
    recipe.ingredients.forEach((ing, i) => {
      doc.text(`- ${ing}`, 25, 70 + (i * 7));
    });
    doc.save(`${recipe.slug}-recipe.pdf`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-gray-300">kaju's kitchen...</div>;
  if (!recipe) return <div className="p-40 text-center">Recipe not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDF7F8] md:bg-white">
      {/* Mobile-Only View (as requested) */}
      <div className="md:hidden bg-black min-h-screen">
        <div className="max-w-md mx-auto bg-white min-h-screen pb-10">
          <div className="relative aspect-[4/5] bg-gray-200">
              <img 
                 src={recipe.imageUrl} 
                 alt={recipe.title} 
                 className="w-full h-full object-cover shadow-inner"
                 referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="absolute top-6 right-6 flex gap-3">
                  <button onClick={handleShare} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><Share2 size={18} /></button>
                  <button onClick={handleDownloadPDF} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><Download size={18} /></button>
              </div>

              <div className="absolute bottom-10 left-8 right-8 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">fresh from kitchen</p>
                  <h1 className="text-3xl font-black">{recipe.title}</h1>
              </div>
          </div>

          <div className="px-8 -mt-8 relative z-10 bg-white rounded-t-[3rem] pt-8">
              <div className="flex items-center gap-6 mb-6 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Clock size={14} /> 15 mins</div>
                  <div className="flex items-center gap-2"><Flame size={14} /> 10 mins</div>
              </div>

              <div className="relative mb-8">
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                      "{recipe.description}"
                  </p>
              </div>

              <div className="flex gap-4 mb-10">
                  <button onClick={handleLike} className={`flex-1 ${liked ? 'bg-[#E93C70] text-white' : 'bg-[#FDF7F8] text-gray-800'} py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors`}>
                      <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Liked' : 'Like'}
                  </button>
                  <button onClick={handleShare} className="flex-1 bg-[#FDF7F8] text-gray-800 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-gray-100">
                      <Share2 size={14} /> Share
                  </button>
              </div>

              <div className="flex bg-[#FDF7F8] rounded-2xl p-1 mb-8">
                  <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ingredients' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>Ingredients</button>
                  <button onClick={() => setActiveTab('directions')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directions' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>Directions</button>
              </div>

              <div className="bg-[#FDF7F8] rounded-[2.5rem] p-8">
                  <h4 className="text-md font-black text-gray-800 mb-6 capitalize">{activeTab}</h4>
                  {activeTab === 'ingredients' ? (
                    <ul className="space-y-4">
                      {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-4 text-xs font-bold text-gray-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              {ing}
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-8">
                      {(recipe.steps && recipe.steps.length > 0 ? recipe.steps : ['Enjoy your perfect creation!']).map((step, i) => (
                          <div key={i} className="flex gap-6">
                              <span className="text-xl font-black text-gray-800">{i + 1}</span>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">{step}</p>
                          </div>
                      ))}
                    </div>
                  )}
              </div>
          </div>
        </div>
      </div>

      {/* Desktop-Only View */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-10 font-bold"
        >
          <ArrowLeft size={18} /> Back to Exploration
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-6">
                 <span className="bg-primary/10 text-primary text-[10px] uppercase font-black px-4 py-1.5 rounded-full tracking-widest">{recipe.category}</span>
                 <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                    <Heart size={14} className="text-red-500 fill-red-500" /> {recipe.likes} people favorites
                 </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold font-serif mb-8 leading-tight text-gray-900">{recipe.title}</h1>
            <p className="text-muted text-lg mb-12 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                "{recipe.description}"
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-[#FDF7F8] p-6 rounded-[2rem] flex items-center gap-4 border border-primary/5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        <Utensils size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900">Ingredients</h4>
                        <p className="text-xs text-muted font-bold">{recipe.ingredients.length} Items</p>
                    </div>
                </div>
                <div className="bg-[#FDF7F8] p-6 rounded-[2rem] flex items-center gap-4 border border-primary/5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900">Time</h4>
                        <p className="text-xs text-muted font-bold">15-30 Mins</p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 max-w-sm">
                    <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'ingredients' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}>Ingredients</button>
                    <button onClick={() => setActiveTab('directions')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'directions' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}>Instructions</button>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    {activeTab === 'ingredients' ? (
                        <ul className="space-y-4">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary">
                                        <CheckCircle2 size={12} fill="white" />
                                    </div>
                                    <span className="text-muted font-medium">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="space-y-6">
                            {(recipe.steps && recipe.steps.length > 0 ? recipe.steps : ['Cook with passion and serve with love!']).map((step, i) => (
                                <div key={i} className="flex gap-6">
                                    <span className="text-3xl font-serif text-primary/20 font-bold">{i + 1}</span>
                                    <p className="text-muted font-medium leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all ${liked ? 'bg-primary text-white scale-105' : 'bg-white text-brand-dark border-2 border-gray-100 hover:border-primary/30'}`}
                >
                    <Heart size={20} fill={liked ? 'white' : 'transparent'} /> {liked ? 'Liked!' : 'Like This'}
                </button>
                <button onClick={handleDownloadPDF} className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                    <Download size={20} /> PDF
                </button>
            </div>
          </motion.div>

          {/* Right Column: Media */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="sticky top-32">
            <div className="rounded-[4rem] overflow-hidden shadow-2xl relative mb-10 border-[12px] border-brand-bg bg-white">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
                {recipe.youtubeId && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <a href={`https://youtube.com/watch?v=${recipe.youtubeId}`} target="_blank" rel="noreferrer" className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                          <Play fill="white" size={32} />
                      </a>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {recipe.instagramUrl && (
                  <a href={recipe.instagramUrl} target="_blank" rel="noreferrer" className="bg-[#E4405F]/10 text-[#E4405F] p-6 rounded-[2.5rem] flex flex-col items-center gap-3 hover:scale-105 transition-all group">
                      <Instagram size={28} className="group-hover:rotate-12 transition-transform" />
                      <span className="font-bold text-xs uppercase tracking-widest">See Reel</span>
                  </a>
                )}
                <div className="bg-[#FDF7F8] p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border border-primary/5">
                    <QRCodeSVG value={window.location.href} size={28} />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-muted">Scan to Mobile</span>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
