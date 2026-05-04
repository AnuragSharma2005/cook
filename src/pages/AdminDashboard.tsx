import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, LogOut, Plus, Shield, UserPlus, Users as UsersIcon, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appScriptApi, CollaboratorInput, CreatorInput, RecipeInput } from '../lib/appScriptApi';
import { storage } from '../lib/storage';
import { AppUser, Creator, Recipe } from '../types';

const emptyForm: CollaboratorInput = {
  email: '',
  password: '',
  name: '',
  bio: '',
  avatarUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  threadsUrl: '',
  twitterUrl: '',
  isActive: true,
};

const emptyCreatorForm: CreatorInput = {
  name: '',
  avatarUrl: '',
  bio: '',
  youtubeUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  threadsUrl: '',
  twitterUrl: '',
};

const emptyRecipeForm: RecipeInput = {
  title: '',
  category: 'Other',
  description: '',
  ingredients: [],
  steps: [],
  images: [],
  prepTime: '',
  cookTime: '',
  imageUrl: '',
  featured: false,
  creatorId: '',
};

const AdminDashboard = () => {
  const { session, user, logout } = useAuth();
  const [tab, setTab] = useState<'collaborators' | 'creators' | 'recipes'>('collaborators');
  const [collaborators, setCollaborators] = useState<AppUser[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<CollaboratorInput>(emptyForm);
  const [creatorForm, setCreatorForm] = useState<CreatorInput>(emptyCreatorForm);
  const [recipeForm, setRecipeForm] = useState<RecipeInput>(emptyRecipeForm);

  useEffect(() => {
    if (!session?.token || user?.role !== 'admin') return;

    const load = async () => {
      setLoading(true);
      try {
        const [collaboratorsData, creatorsData, recipesData] = await Promise.all([
          appScriptApi.listCollaborators(session.token),
          appScriptApi.listCreators(),
          appScriptApi.listRecipes(),
        ]);
        setCollaborators(collaboratorsData);
        setCreators(creatorsData);
        setRecipes(recipesData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.token, user?.role]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/studio" replace />;
  }

  const refreshData = async () => {
    if (!session?.token) return;
    const [collaboratorsData, creatorsData, recipesData] = await Promise.all([
      appScriptApi.listCollaborators(session.token),
      appScriptApi.listCreators(),
      appScriptApi.listRecipes(),
    ]);
    setCollaborators(collaboratorsData);
    setCreators(creatorsData);
    setRecipes(recipesData);
  };

  const handleCreateCollaborator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.token) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.email || !form.password || !form.name) {
        throw new Error('Name, email, and password are required.');
      }

      await appScriptApi.createCollaborator(session.token, { ...form, role: 'creator' as any });
      setSuccess('Creator account created successfully. Share the email and password with them.');
      setForm(emptyForm);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create collaborator.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCreator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.token) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!creatorForm.name) {
        throw new Error('Creator name is required.');
      }

      await appScriptApi.createCreator(session.token, creatorForm);
      setSuccess('Creator added successfully!');
      setCreatorForm(emptyCreatorForm);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create creator.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRecipe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.token) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!recipeForm.title) {
        throw new Error('Recipe title is required.');
      }
      if (!Array.isArray((recipeForm as any).images) || (recipeForm as any).images.length === 0) {
        throw new Error('At least one image URL is required.');
      }

      const payload = {
        ...recipeForm,
        ingredients: Array.isArray(recipeForm.ingredients) ? recipeForm.ingredients : JSON.stringify(recipeForm.ingredients || []),
        steps: Array.isArray(recipeForm.steps) ? recipeForm.steps : JSON.stringify(recipeForm.steps || []),
        images: Array.isArray((recipeForm as any).images) ? JSON.stringify((recipeForm as any).images) : undefined,
        imageUrl: (recipeForm as any).images && (recipeForm as any).images.length > 0 ? (recipeForm as any).images[0] : recipeForm.imageUrl,
      };

      await appScriptApi.createRecipe(session.token, payload as any);
      setSuccess('Recipe added successfully!');
      setRecipeForm(emptyRecipeForm);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create recipe.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCollaborator = async (collaborator: AppUser) => {
    if (!session?.token) return;

    await appScriptApi.updateCollaborator(session.token, {
      id: collaborator.id,
      email: collaborator.email,
      name: collaborator.name,
      bio: collaborator.bio,
      avatarUrl: collaborator.avatarUrl,
      youtubeUrl: collaborator.youtubeUrl,
      instagramUrl: collaborator.instagramUrl,
      facebookUrl: collaborator.facebookUrl,
      threadsUrl: collaborator.threadsUrl,
      twitterUrl: collaborator.twitterUrl,
      isActive: !collaborator.isActive,
    });

    await refreshData();
  };

  const renderCollaborators = () => (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Create Creator Account</h2>
        </div>

        <form onSubmit={handleCreateCollaborator} className="grid md:grid-cols-2 gap-4">
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Temporary password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-28" placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Instagram URL" value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="YouTube URL" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Facebook URL" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="X / Twitter URL" value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Threads URL" value={form.threadsUrl} onChange={(e) => setForm({ ...form, threadsUrl: e.target.value })} />

          <div className="md:col-span-2 flex items-center gap-3 rounded-2xl bg-brand-bg px-4 py-3">
            <input id="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="isActive" className="font-semibold text-sm">Account is active</label>
          </div>

          {error && <p className="md:col-span-2 text-sm font-bold text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
          {success && <p className="md:col-span-2 text-sm font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={14} /> {success}</p>}

          <button disabled={saving} className="md:col-span-2 w-full rounded-2xl bg-primary text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
            <Plus size={18} /> {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </motion.section>

      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Live Accounts</h2>
        </div>

        {loading ? (
          <p className="text-muted">Loading accounts...</p>
        ) : collaborators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-muted">No accounts yet.</div>
        ) : (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="rounded-2xl border border-gray-100 p-4 bg-brand-bg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{collaborator.name}</h3>
                    <p className="text-sm text-muted">{collaborator.email}</p>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2 text-primary">{collaborator.role}</p>
                  </div>
                  <button
                    onClick={() => toggleCollaborator(collaborator)}
                    className={`text-xs font-bold px-3 py-2 rounded-full ${collaborator.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                  >
                    {collaborator.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{collaborator.bio || 'No bio set.'}</p>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );

  const renderCreators = () => (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <UsersIcon size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Add New Creator</h2>
        </div>

        <form onSubmit={handleCreateCreator} className="grid md:grid-cols-2 gap-4">
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Creator name" value={creatorForm.name} onChange={(e) => setCreatorForm({ ...creatorForm, name: e.target.value })} required />
          <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-20" placeholder="Bio" value={creatorForm.bio} onChange={(e) => setCreatorForm({ ...creatorForm, bio: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Avatar URL" value={creatorForm.avatarUrl} onChange={(e) => setCreatorForm({ ...creatorForm, avatarUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="YouTube URL" value={creatorForm.youtubeUrl} onChange={(e) => setCreatorForm({ ...creatorForm, youtubeUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Instagram URL" value={creatorForm.instagramUrl} onChange={(e) => setCreatorForm({ ...creatorForm, instagramUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Facebook URL" value={creatorForm.facebookUrl} onChange={(e) => setCreatorForm({ ...creatorForm, facebookUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Threads URL" value={creatorForm.threadsUrl} onChange={(e) => setCreatorForm({ ...creatorForm, threadsUrl: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Twitter URL" value={creatorForm.twitterUrl} onChange={(e) => setCreatorForm({ ...creatorForm, twitterUrl: e.target.value })} />

          {error && <p className="md:col-span-2 text-sm font-bold text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
          {success && <p className="md:col-span-2 text-sm font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={14} /> {success}</p>}

          <button disabled={saving} className="md:col-span-2 w-full rounded-2xl bg-primary text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
            <Plus size={18} /> {saving ? 'Adding...' : 'Add Creator'}
          </button>
        </form>
      </motion.section>

      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <UsersIcon size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Creators</h2>
        </div>

        {loading ? (
          <p className="text-muted">Loading creators...</p>
        ) : creators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-muted">No creators yet.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {creators.map((creator) => (
              <div key={creator.id} className="rounded-2xl border border-gray-100 p-3 bg-brand-bg">
                <div className="flex items-start gap-2">
                  {creator.avatarUrl && <img src={creator.avatarUrl} alt={creator.name} className="w-8 h-8 rounded-full" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{creator.name}</h3>
                    <p className="text-xs text-muted line-clamp-1">{creator.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );

  const renderRecipes = () => (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Utensils size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Add New Recipe</h2>
        </div>

        <form onSubmit={handleCreateRecipe} className="grid md:grid-cols-2 gap-4">
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Recipe title" value={recipeForm.title} onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })} required />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Category" value={recipeForm.category} onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })} />
          <select className="rounded-2xl bg-brand-bg px-4 py-3.5" value={recipeForm.creatorId} onChange={(e) => setRecipeForm({ ...recipeForm, creatorId: e.target.value })}>
            <option value="">Select Creator</option>
            {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Prep time (e.g. 15 mins)" value={(recipeForm as any).prepTime || ''} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value } as any)} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Cook time (e.g. 30 mins)" value={(recipeForm as any).cookTime || ''} onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value } as any)} />
          <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-20" placeholder="Description" value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} />
          <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Image URL" value={recipeForm.imageUrl} onChange={(e) => setRecipeForm({ ...recipeForm, imageUrl: e.target.value })} />
          <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-20" placeholder='Ingredients (one per line or JSON array)' value={Array.isArray(recipeForm.ingredients) ? recipeForm.ingredients.join('\n') : recipeForm.ingredients} onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value.split('\n').filter(i => i.trim()) })} />
          <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-20" placeholder='Steps (one per line or JSON array)' value={Array.isArray(recipeForm.steps) ? recipeForm.steps.join('\n') : recipeForm.steps} onChange={(e) => setRecipeForm({ ...recipeForm, steps: e.target.value.split('\n').filter(s => s.trim()) })} />

          <div className="md:col-span-2 flex items-center gap-3 rounded-2xl bg-brand-bg px-4 py-3">
            <input id="featured" type="checkbox" checked={recipeForm.featured} onChange={(e) => setRecipeForm({ ...recipeForm, featured: e.target.checked })} />
            <label htmlFor="featured" className="font-semibold text-sm">Featured recipe</label>
          </div>

          {error && <p className="md:col-span-2 text-sm font-bold text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
          {success && <p className="md:col-span-2 text-sm font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={14} /> {success}</p>}

          <button disabled={saving} className="md:col-span-2 w-full rounded-2xl bg-primary text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
            <Plus size={18} /> {saving ? 'Adding...' : 'Add Recipe'}
          </button>
        </form>
      </motion.section>

      <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Utensils size={20} className="text-primary" />
          <h2 className="text-2xl font-bold">Recipes ({recipes.length})</h2>
        </div>

        {loading ? (
          <p className="text-muted">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-muted">No recipes yet.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recipes.slice(0, 10).map((recipe) => (
              <div key={recipe.id} className="rounded-2xl border border-gray-100 p-2 bg-brand-bg text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{recipe.title}</h4>
                    <p className="text-muted text-xs">{recipe.category}</p>
                  </div>
                  {recipe.featured && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold whitespace-nowrap">Featured</span>}
                </div>
              </div>
            ))}
            {recipes.length > 10 && <p className="text-xs text-muted text-center pt-2">...and {recipes.length - 10} more</p>}
          </div>
        )}
      </motion.section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF7F8] pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-2">Admin Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900">Content Management</h1>
            <p className="text-gray-500 mt-2">Manage collaborators, creators, and recipes from one place.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-red-500 shadow-sm border border-gray-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-3xl p-2 md:p-4">
          {(['collaborators', 'creators', 'recipes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-2xl font-bold transition-colors capitalize ${tab === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          {tab === 'collaborators' && renderCollaborators()}
          {tab === 'creators' && renderCreators()}
          {tab === 'recipes' && renderRecipes()}
        </div>

        <div className="text-sm text-muted">
          All data is stored in Google Sheets and synced with the website in real-time.
        </div>
        <Link to="/" className="inline-flex text-primary font-bold hover:underline">Back to site</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
