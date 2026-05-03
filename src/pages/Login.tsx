import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const destination = (location.state as { from?: string } | null)?.from || '/';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await login(email.trim().toLowerCase(), password);
      if (session.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/studio', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login. Only admin-created accounts can sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[3rem] bg-white p-8 md:p-10 shadow-2xl shadow-primary/10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Lock size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-black font-serif text-center mb-3">Account Login</h1>
        <p className="text-center text-sm text-muted mb-8">Only admin-created collaborator or admin accounts can log in.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                className="w-full bg-brand-bg rounded-2xl pl-12 pr-4 py-4 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Password</label>
            <input
              type="password"
              className="w-full bg-brand-bg rounded-2xl px-4 py-4 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <Link to={destination} className="text-primary font-bold hover:underline">Back</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
