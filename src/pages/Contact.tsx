import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, User, Send, CheckCircle2, Youtube, Instagram, Facebook } from 'lucide-react';
import { storage } from '../lib/storage';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save locally
      storage.saveContact(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-6 bg-[#FFE4E8]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center pt-6 md:pt-12">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest mb-6 block">Get In Touch</span>
            <h1 className="text-5xl font-extrabold font-serif mb-8 leading-tight">Love Recipes? <br /><span className="text-primary italic">Talk to me!</span></h1>
            <p className="text-muted text-lg mb-12 leading-relaxed">
                Whether you have a question about a recipe, want to share your results, or just want to say hi, I'm always listening!
            </p>
            
            <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Mail />
                    </div>
                    <div>
                        <h4 className="font-bold">Email Kaju</h4>
                        <p className="text-sm text-muted">hello@cookwithkaju.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Instagram />
                    </div>
                    <div>
                        <h4 className="font-bold">Instagram DM</h4>
                        <p className="text-sm text-muted">@cookwithkaju_official</p>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl relative"
        >
          {submitted ? (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                <p className="text-muted mb-8">Kaju will get back to you soon. Keep cooking amazing things!</p>
                <button onClick={() => setSubmitted(false)} className="text-primary font-bold underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-brand-bg rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-brand-bg rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-6 top-6 text-muted" />
                <textarea 
                  placeholder="Your Message..." 
                  className="w-full bg-brand-bg rounded-2xl py-6 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium h-48"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>
              <button 
                disabled={loading}
                className="w-full bg-primary text-white py-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : <>Send Message <Send size={20} /></>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
