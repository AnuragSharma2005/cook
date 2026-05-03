import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { storage } from '../lib/storage';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Save, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Recipe, Category } from '../types';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Healthy' as Category,
    imageUrl: '',
    youtubeId: '',
    instagramUrl: '',
    ingredients: [''],
    steps: [''],
    featured: false
  });

  useEffect(() => {
    // Basic local "session" check
    const session = localStorage.getItem('kaju_admin_session');
    if (session === 'true') {
      setIsLoggedIn(true);
      loadRecipesData();
    }
  }, []);

  const loadRecipesData = () => {
    const data = storage.getRecipes();
    setRecipes(data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use "kaju" / "kaju123" for testing
    if (email === 'kaju@test.com' && password === 'kaju123') {
      setIsLoggedIn(true);
      localStorage.setItem('kaju_admin_session', 'true');
      setError('');
      loadRecipesData();
    } else {
      setError('Invalid admin credentials. Use kaju@test.com / kaju123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kaju_admin_session');
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    storage.saveRecipe({
      ...formData,
      slug,
      id: editingId || undefined
    } as any);

    resetForm();
    loadRecipesData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      storage.deleteRecipe(id);
      loadRecipesData();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Healthy',
      imageUrl: '',
      youtubeId: '',
      instagramUrl: '',
      ingredients: [''],
      steps: [''],
      featured: false
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-primary/10 w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 font-serif">Admin Login</h1>
          <p className="text-muted text-center text-sm mb-8">Testing Mode: kaju@test.com / kaju123</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Email</label>
              <input 
                type="email" 
                className="w-full bg-brand-bg rounded-2xl px-5 py-4 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Password</label>
              <input 
                type="password" 
                className="w-full bg-brand-bg rounded-2xl px-5 py-4 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform">
              Login to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold font-serif">Kaju's Command Center</h1>
            <p className="text-muted text-sm">Manage your awesome recipes (Testing Mode)</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl font-bold text-sm text-red-500 shadow-sm border border-gray-100 hover:bg-red-50"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        {isAdding || editingId ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl mb-12"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Recipe' : 'Add New Recipe'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg text-muted"><X /></button>
            </div>
            
            <form onSubmit={handleSaveRecipe} className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Category</label>
                  <select 
                    className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                  >
                    <option>Healthy</option>
                    <option>Drinks</option>
                    <option>Shakes</option>
                    <option>Fast Food</option>
                    <option>Desserts</option>
                    <option>Traditional</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Description</label>
                  <textarea 
                    className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Image URL</label>
                   <div className="flex gap-2">
                    <input 
                      type="url" 
                      className="flex-1 bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      required
                    />
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
                      {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon />}
                    </div>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Ingredients (Comma separated)</label>
                  <textarea 
                    className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none h-24"
                    placeholder="2 cups flour, 1 tsp salt..."
                    value={formData.ingredients.join(', ')}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value.split(',').map(s => s.trim())})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Youtube ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. dQw4w9WgXcQ"
                      className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none"
                      value={formData.youtubeId}
                      onChange={(e) => setFormData({...formData, youtubeId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Insta Link</label>
                    <input 
                      type="url" 
                      placeholder="Instagram URL"
                      className="w-full bg-brand-bg rounded-xl px-5 py-3.5 focus:outline-none"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    className="w-5 h-5 accent-primary rounded"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  <label htmlFor="featured" className="font-bold text-sm cursor-pointer">Feature on Homepage</label>
                </div>
                <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <Save size={20} /> Save Recipe
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Your Recipes ({recipes.length})</h3>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={20} /> Add Recipe
                </button>
            </div>

            <div className="grid gap-4">
                {recipes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] text-muted font-medium border-2 border-dashed">
                      No recipes found. Start by adding one!
                  </div>
                ) : (
                  recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white p-6 rounded-3xl flex items-center justify-between shadow-sm border border-gray-50 hover:shadow-md transition-all">
                        <div className="flex items-center gap-6">
                            <img src={recipe.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                            <div>
                                <h4 className="font-bold text-lg">{recipe.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted font-bold uppercase tracking-wider">
                                    <span>{recipe.category}</span>
                                    <span>•</span>
                                    <span>{recipe.likes} Likes</span>
                                    {recipe.featured && <span className="text-primary flex items-center gap-1"><CheckCircle2 size={12} /> Featured</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                  setEditingId(recipe.id);
                                  setFormData({
                                    title: recipe.title,
                                    description: recipe.description,
                                    category: recipe.category,
                                    imageUrl: recipe.imageUrl,
                                    youtubeId: recipe.youtubeId || '',
                                    instagramUrl: recipe.instagramUrl || '',
                                    ingredients: recipe.ingredients,
                                    steps: recipe.steps,
                                    featured: recipe.featured
                                  });
                                }}
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                             >
                                <Edit3 size={18} />
                             </button>
                             <button 
                                onClick={() => handleDelete(recipe.id)}
                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                             >
                                <Trash2 size={18} />
                             </button>
                        </div>
                    </div>
                  ))
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
