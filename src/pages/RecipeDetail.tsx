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
        setLiked(storage.isRecipeLiked(found.id));
      }
      setLoading(false);
    };

    loadRecipeData();
  }, [slug]);

  const handleLike = () => {
    if (!recipe) return;

    if (liked) {
      storage.unlikeRecipe(recipe.id);
      storage.removeLikedRecipe(recipe.id);
      setLiked(false);
      setRecipe({ ...recipe, likes: Math.max(0, recipe.likes - 1) });
    } else {
      storage.likeRecipe(recipe.id);
      storage.addLikedRecipe(recipe.id);
      setLiked(true);
      setRecipe({ ...recipe, likes: recipe.likes + 1 });
    }
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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-gray-300">cookwithkaju</div>;
  if (!recipe) return <div className="p-40 text-center">Recipe not found.</div>;

  return (
    <div className="min-h-screen bg-white pb-0 md:pb-20">
      {/* Mobile-Only View (as requested, unchanged) */}
      <div className="md:hidden">
        {/* Top Half Image */}
        <div className="relative h-[50vh] w-full bg-gray-200">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Top Bar Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 pt-8 flex justify-between items-start bg-linear-to-b from-black/50 to-transparent">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button onClick={handleDownloadPDF} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"><Download size={18} /></button>
          </div>
        </div>

        {/* Content Card Overlapping the Image */}
        <div className="relative z-10 px-0 -mt-8">
          <div className="max-w-3xl mx-auto bg-[#F4ECF4] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 min-h-[50vh]">

            {/* Header */}
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">{recipe.title} 🥪</h1>
              <div className="text-gray-400 text-sm font-medium">
                Prep: 15 mins <span className="mx-1">|</span> Cook: 10 mins
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start justify-between gap-4 mb-6 cursor-pointer">
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {recipe.description}
              </p>
              <span className="text-gray-400 mt-1">&gt;</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleLike}
                className={`flex-1 py-3.5 rounded-3xl border text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${liked ? 'bg-[#F4ECF4] border-[#E93C70]/30 text-[#E93C70]' : 'bg-[#EBE0EC] border-[#E0D4E0] text-gray-700'}`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} className={liked ? '' : 'text-gray-500'} />
                {recipe.likes} {recipe.likes === 1 ? 'Like' : 'Likes'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3.5 rounded-3xl bg-[#EBE0EC] border border-[#E0D4E0] text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#E6DBE6] rounded-full p-1.5 mb-6">
              <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'ingredients' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>Ingredients</button>
              <button onClick={() => setActiveTab('directions')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'directions' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>Directions</button>
            </div>

            {/* Tab Content inside Pink Box */}
            <div className="bg-[#EBE0EC] rounded-4xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{activeTab}</h3>
              {activeTab === 'ingredients' ? (
                <ul className="flex flex-col">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className={`flex items-start gap-3 py-3 ${i !== recipe.ingredients.length - 1 ? 'border-b border-[#DBCADB]' : ''}`}>
                      <span className="text-gray-500 font-bold mt-0.5">•</span>
                      <span className="text-gray-500 text-sm font-medium leading-relaxed">{ing}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-4">
                  {(recipe.steps && recipe.steps.length > 0 ? recipe.steps : ['Enjoy your perfect creation!']).map((step, i) => (
                    <div key={i} className={`flex gap-4 py-3 ${i !== (recipe.steps?.length || 1) - 1 ? 'border-b border-[#DBCADB]' : ''}`}>
                      <span className="text-gray-500 font-bold">{i + 1}.</span>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Desktop-Only View */}
      <div className="hidden md:block bg-[#FDF7F8] min-h-screen pb-32">
        {/* Top Half Image (Banner) */}
        <div className="relative h-[40vh] w-full bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 bg-[#F4ECF4]/60 z-10 backdrop-blur-sm" />
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Top Bar Overlay */}
          <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20 max-w-6xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-800 font-bold hover:text-black transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={handleDownloadPDF} className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm"><Download size={18} /></button>
          </div>
        </div>

        {/* Content Grid Overlapping the Banner */}
        <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-32">
          <div className="grid grid-cols-12 gap-12 items-start">

            {/* Left Side Image (~30%) */}
            <div className="col-span-4 rounded-4xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white p-2">
              <img src={recipe.imageUrl} alt={recipe.title} className="w-full aspect-3/4 object-cover rounded-3xl" referrerPolicy="no-referrer" />
            </div>

            {/* Right Side Content Form/Data (~70%) */}
            <div className="col-span-8 bg-[#F4ECF4] rounded-[2.5rem] shadow-xl p-10 mt-12 border border-white/50">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-4xl font-semibold text-gray-800 mb-4">{recipe.title} 🥪</h1>
                <div className="text-gray-500 text-base font-medium">
                  Prep: 15 mins <span className="mx-2">|</span> Cook: 10 mins
                </div>
              </div>

              {/* Description */}
              <p className="text-base text-gray-600 leading-relaxed font-medium mb-10">
                {recipe.description}
              </p>

              {/* Buttons */}
              <div className="flex gap-4 mb-10 max-w-md">
                <button
                  onClick={handleLike}
                  className={`flex-1 py-4 rounded-3xl border text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${liked ? 'bg-[#F4ECF4] border-[#E93C70]/30 text-[#E93C70]' : 'bg-[#EBE0EC] border-[#E0D4E0] text-gray-700'}`}
                >
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} className={liked ? '' : 'text-gray-500'} />
                  {recipe.likes} {recipe.likes === 1 ? 'Like' : 'Likes'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-4 rounded-3xl bg-[#EBE0EC] border border-[#E0D4E0] text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Share2 size={18} /> Share
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#E6DBE6] rounded-full p-2 mb-8 max-w-md">
                <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-3 rounded-full text-base font-medium transition-all ${activeTab === 'ingredients' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>Ingredients</button>
                <button onClick={() => setActiveTab('directions')} className={`flex-1 py-3 rounded-full text-base font-medium transition-all ${activeTab === 'directions' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>Directions</button>
              </div>

              {/* Tab Content inside Pink Box */}
              <div className="bg-[#EBE0EC] rounded-[2.5rem] p-8 shadow-inner">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 capitalize">{activeTab}</h3>
                {activeTab === 'ingredients' ? (
                  <ul className="flex flex-col">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className={`flex items-start gap-4 py-4 ${i !== recipe.ingredients.length - 1 ? 'border-b border-[#DBCADB]' : ''}`}>
                        <span className="text-gray-500 font-bold mt-1">•</span>
                        <span className="text-gray-600 text-base font-medium leading-relaxed">{ing}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-6">
                    {(recipe.steps && recipe.steps.length > 0 ? recipe.steps : ['Enjoy your perfect creation!']).map((step, i) => (
                      <div key={i} className={`flex gap-5 py-4 ${i !== (recipe.steps?.length || 1) - 1 ? 'border-b border-[#DBCADB]' : ''}`}>
                        <span className="text-gray-500 font-bold text-lg">{i + 1}.</span>
                        <p className="text-gray-600 text-base font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
