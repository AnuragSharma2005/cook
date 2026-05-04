import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, Plus, LogOut, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appScriptApi } from '../lib/appScriptApi';

const CollaboratorStudio = () => {
  const { session, user, logout, setSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    youtubeUrl: user?.youtubeUrl || '',
    instagramUrl: user?.instagramUrl || '',
    facebookUrl: user?.facebookUrl || '',
    threadsUrl: user?.threadsUrl || '',
    twitterUrl: user?.twitterUrl || '',
  });

  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    category: 'Other',
    description: '',
    ingredients: [] as string[],
    steps: [] as string[],
    images: [] as string[],
    imageUrl: '',
    prepTime: '',
    cookTime: '',
    featured: false,
  });
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      youtubeUrl: user.youtubeUrl || '',
      instagramUrl: user.instagramUrl || '',
      facebookUrl: user.facebookUrl || '',
      threadsUrl: user.threadsUrl || '',
      twitterUrl: user.twitterUrl || '',
    });
  }, [user]);

  useEffect(() => {
    if (!session?.token) return;

    const load = async () => {
      setLoading(true);
      try {
        try {
          const allRecipes = await appScriptApi.listRecipes();
          const mine = allRecipes.filter((r: any) => String(r.creatorId) === String(user?.id));
          setRecipes(mine);
        } catch (e) {
          // ignore recipe load errors
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.token, user?.id]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'collaborator' && user?.role !== 'admin' && user?.role !== 'creator') {
    return <Navigate to="/login" replace />;
  }

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    setSavingProfile(true);
    try {
      const updated = await appScriptApi.updateCollaborator(session.token, {
        id: user?.id,
        email: user?.email || '',
        name: profileForm.name,
        bio: profileForm.bio,
        avatarUrl: profileForm.avatarUrl,
        youtubeUrl: profileForm.youtubeUrl,
        instagramUrl: profileForm.instagramUrl,
        facebookUrl: profileForm.facebookUrl,
        threadsUrl: profileForm.threadsUrl,
        twitterUrl: profileForm.twitterUrl,
      });

      if (session) {
        setSession({ ...session, user: updated });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRecipeSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    setSavingRecipe(true);
    setRecipeError('');
    try {
      if (!recipeForm.title) throw new Error('Recipe title is required.');
      if (!recipeForm.images || recipeForm.images.length === 0) throw new Error('At least one image URL is required.');
      const saved = await appScriptApi.createRecipe(session.token, {
        title: recipeForm.title,
        category: recipeForm.category,
        description: recipeForm.description,
        ingredients: recipeForm.ingredients,
        steps: recipeForm.steps,
        images: recipeForm.images,
        imageUrl: recipeForm.images[0] || recipeForm.imageUrl,
        prepTime: recipeForm.prepTime,
        cookTime: recipeForm.cookTime,
        featured: recipeForm.featured,
      });
      setRecipes((cur) => [saved, ...cur]);
      setRecipeForm({ title: '', category: 'Other', description: '', ingredients: [], steps: [], images: [], imageUrl: '', prepTime: '', cookTime: '', featured: false });
    } catch (err) {
      setRecipeError(err instanceof Error ? err.message : 'Unable to save recipe.');
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F8] pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-2">Creator Studio</p>
            <h1 className="text-4xl font-black font-serif text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-500 mt-2">Update your profile links and publish recipes from your own account.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-red-500 shadow-sm border border-gray-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Settings2 size={20} className="text-primary" />
              <h2 className="text-2xl font-bold">Profile Settings</h2>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Display name" />
              <textarea className="w-full rounded-2xl bg-brand-bg px-4 py-3.5 h-28" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Bio" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.avatarUrl} onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })} placeholder="Avatar URL" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.instagramUrl} onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })} placeholder="Instagram URL" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.youtubeUrl} onChange={(e) => setProfileForm({ ...profileForm, youtubeUrl: e.target.value })} placeholder="YouTube URL" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.facebookUrl} onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })} placeholder="Facebook URL" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.twitterUrl} onChange={(e) => setProfileForm({ ...profileForm, twitterUrl: e.target.value })} placeholder="X / Twitter URL" />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={profileForm.threadsUrl} onChange={(e) => setProfileForm({ ...profileForm, threadsUrl: e.target.value })} placeholder="Threads URL" />
              <button disabled={savingProfile} className="w-full rounded-2xl bg-primary text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                <Save size={18} /> {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </motion.div>

          <motion.div className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Plus size={20} className="text-primary" />
              <h2 className="text-2xl font-bold">Create Recipe</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              This section now focuses only on recipes. The legacy daily post composer has been removed from the UI.
            </p>
          </motion.div>
        </div>

        <motion.div className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Plus size={20} className="text-primary" />
            <h2 className="text-2xl font-bold">Create Recipe</h2>
          </div>
          <form onSubmit={handleRecipeSave} className="grid md:grid-cols-2 gap-4">
            <input className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2" placeholder="Recipe title" value={recipeForm.title} onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })} required />
            <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Category" value={recipeForm.category} onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })} />
            <textarea className="rounded-2xl bg-brand-bg px-4 py-3.5 md:col-span-2 h-20" placeholder="Description" value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Images (first image is primary)</label>
              <div className="flex flex-col gap-2">
                {recipeForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input className="flex-1 rounded-2xl bg-brand-bg px-4 py-3.5" placeholder={`Image URL ${idx + 1}`} value={img} onChange={(e) => {
                      const copy = [...recipeForm.images]; copy[idx] = e.target.value; setRecipeForm({ ...recipeForm, images: copy });
                    }} />
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, images: recipeForm.images.filter((_, i) => i !== idx) })} className="text-sm text-red-600">Remove</button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input placeholder="Add image URL" className="flex-1 rounded-2xl bg-brand-bg px-4 py-3.5" onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { setRecipeForm({ ...recipeForm, images: [...recipeForm.images, val] }); (e.target as HTMLInputElement).value = ''; } }
                  }} />
                  <span className="text-xs text-gray-500">Press Enter to add</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {recipeForm.images.map((img, i) => (
                    <img key={i} src={img} alt={`preview-${i}`} className="w-full h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Ingredients</label>
              <div className="flex gap-2 mb-2">
                <input id="new-ingredient" placeholder="Add ingredient" className="flex-1 rounded-2xl bg-brand-bg px-4 py-3.5" />
                <button type="button" onClick={() => { const el = document.getElementById('new-ingredient') as HTMLInputElement; const v = el?.value?.trim(); if (v) { setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, v] }); el.value = ''; } }} className="rounded-2xl bg-primary text-white px-4">Add</button>
              </div>
              <ul className="space-y-1">
                {recipeForm.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between bg-white/30 px-3 py-2 rounded-lg">
                    <span>{ing}</span>
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, idx) => idx !== i) })} className="text-xs text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Steps</label>
              <div className="flex gap-2 mb-2">
                <input id="new-step" placeholder="Add step" className="flex-1 rounded-2xl bg-brand-bg px-4 py-3.5" />
                <button type="button" onClick={() => { const el = document.getElementById('new-step') as HTMLInputElement; const v = el?.value?.trim(); if (v) { setRecipeForm({ ...recipeForm, steps: [...recipeForm.steps, v] }); el.value = ''; } }} className="rounded-2xl bg-primary text-white px-4">Add</button>
              </div>
              <ol className="list-decimal list-inside space-y-1">
                {recipeForm.steps.map((s, i) => (
                  <li key={i} className="flex items-center justify-between bg-white/30 px-3 py-2 rounded-lg">
                    <span>{s}</span>
                    <button type="button" onClick={() => setRecipeForm({ ...recipeForm, steps: recipeForm.steps.filter((_, idx) => idx !== i) })} className="text-xs text-red-600">Remove</button>
                  </li>
                ))}
              </ol>
            </div>

            <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Prep time (e.g. 15 mins)" value={recipeForm.prepTime} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })} />
            <input className="rounded-2xl bg-brand-bg px-4 py-3.5" placeholder="Cook time (e.g. 30 mins)" value={recipeForm.cookTime} onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })} />

            <div className="md:col-span-2 flex items-center gap-3 rounded-2xl bg-brand-bg px-4 py-3">
              <input id="featured" type="checkbox" checked={recipeForm.featured} onChange={(e) => setRecipeForm({ ...recipeForm, featured: e.target.checked })} />
              <label htmlFor="featured" className="font-semibold text-sm">Featured recipe</label>
            </div>

            {recipeError && <p className="md:col-span-2 text-sm font-bold text-red-500">{recipeError}</p>}
            <button disabled={savingRecipe} className="md:col-span-2 w-full rounded-2xl bg-primary text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
              <Plus size={18} /> {savingRecipe ? 'Adding...' : 'Add Recipe'}
            </button>
          </form>
        </motion.div>

        <div className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">My Recipes</h2>
            <span className="text-sm text-muted font-bold">{recipes.length} total</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-muted">
              No recipes yet. Create your first one above.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <article key={recipe.id} className="rounded-2xl border border-gray-100 p-4 bg-brand-bg">
                  {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-44 object-cover rounded-2xl mb-4" /> : <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4"><Settings2 /></div>}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">{recipe.title}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-green-100 text-green-600">recipe</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-4">{recipe.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-muted">
          Public likes are browser-based only, so a visitor's liked items stay on their device without sign-in.
        </div>
        <Link to="/" className="inline-flex text-primary font-bold hover:underline">Back to site</Link>
      </div>
    </div>
  );
};

export default CollaboratorStudio;
