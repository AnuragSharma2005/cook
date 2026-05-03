import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, Plus, Image as ImageIcon, LogOut, PenSquare, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appScriptApi } from '../lib/appScriptApi';
import { CollaboratorPost } from '../types';

const CollaboratorStudio = () => {
  const { session, user, logout, setSession } = useAuth();
  const [posts, setPosts] = useState<CollaboratorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPost, setSavingPost] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [postError, setPostError] = useState('');

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

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
    status: 'published' as 'draft' | 'published',
  });

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
        const items = await appScriptApi.listMyPosts(session.token);
        setPosts(items);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.token]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'collaborator' && user?.role !== 'admin') {
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

  const handlePostSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    setSavingPost(true);
    setPostError('');
    try {
      const saved = await appScriptApi.savePost(session.token, postForm);
      setPosts((current) => [saved, ...current]);
      setPostForm({ title: '', content: '', imageUrl: '', status: 'published' });
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Unable to save post.');
    } finally {
      setSavingPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F8] pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-2">Collaborator Studio</p>
            <h1 className="text-4xl font-black font-serif text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-500 mt-2">Update your profile links and publish daily posts from your own account.</p>
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
              <h2 className="text-2xl font-bold">Create Daily Post</h2>
            </div>
            <form onSubmit={handlePostSave} className="space-y-4">
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="Post title" required />
              <textarea className="w-full rounded-2xl bg-brand-bg px-4 py-3.5 h-36" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder="Write your post" required />
              <input className="w-full rounded-2xl bg-brand-bg px-4 py-3.5" value={postForm.imageUrl} onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })} placeholder="Image URL" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setPostForm({ ...postForm, status: 'draft' })} className={`px-4 py-2 rounded-full text-sm font-bold ${postForm.status === 'draft' ? 'bg-brand-dark text-white' : 'bg-brand-bg text-gray-600'}`}>Draft</button>
                <button type="button" onClick={() => setPostForm({ ...postForm, status: 'published' })} className={`px-4 py-2 rounded-full text-sm font-bold ${postForm.status === 'published' ? 'bg-brand-dark text-white' : 'bg-brand-bg text-gray-600'}`}>Publish</button>
              </div>
              {postError && <p className="text-sm font-bold text-red-500">{postError}</p>}
              <button disabled={savingPost} className="w-full rounded-2xl bg-brand-dark text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                <PenSquare size={18} /> {savingPost ? 'Saving...' : 'Save Post'}
              </button>
            </form>
          </motion.div>
        </div>

        <div className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">My Posts</h2>
            <span className="text-sm text-muted font-bold">{posts.length} total</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-muted">
              No posts yet. Create your first daily update.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-gray-100 p-4 bg-brand-bg">
                  {post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="w-full h-44 object-cover rounded-2xl mb-4" /> : <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4"><ImageIcon /></div>}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">{post.title}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{post.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-4">{post.content}</p>
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
