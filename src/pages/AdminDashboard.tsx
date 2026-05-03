import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, LogOut, Plus, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appScriptApi, CollaboratorInput } from '../lib/appScriptApi';
import { AppUser } from '../types';

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

const AdminDashboard = () => {
  const { session, user, logout } = useAuth();
  const [collaborators, setCollaborators] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<CollaboratorInput>(emptyForm);

  useEffect(() => {
    if (!session?.token || user?.role !== 'admin') return;

    const load = async () => {
      setLoading(true);
      try {
        const items = await appScriptApi.listCollaborators(session.token);
        setCollaborators(items);
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

  const refreshCollaborators = async () => {
    if (!session?.token) return;
    const items = await appScriptApi.listCollaborators(session.token);
    setCollaborators(items);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.token) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.email || !form.password || !form.name) {
        throw new Error('Name, email, and password are required.');
      }

      await appScriptApi.createCollaborator(session.token, form);
      setSuccess('Collaborator created successfully. Share the email and password with them.');
      setForm(emptyForm);
      await refreshCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create collaborator.');
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

    await refreshCollaborators();
  };

  return (
    <div className="min-h-screen bg-[#FDF7F8] pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-2">Admin Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900">Collaborator Access Control</h1>
            <p className="text-gray-500 mt-2">Create accounts that only you can issue, then manage who can publish posts.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-red-500 shadow-sm border border-gray-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <motion.section className="rounded-4xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus size={20} className="text-primary" />
              <h2 className="text-2xl font-bold">Create Collaborator Account</h2>
            </div>

            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
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
              <p className="text-muted">Loading collaborators...</p>
            ) : collaborators.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-muted">No collaborators yet.</div>
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

        <div className="text-sm text-muted">
          The login page only accepts accounts stored by Apps Script. Any invalid email or password is rejected server-side.
        </div>
        <Link to="/" className="inline-flex text-primary font-bold hover:underline">Back to site</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
