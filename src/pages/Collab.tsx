import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, User, Mail, DollarSign, MessageSquare, Send, CheckCircle2, Star, Target, Globe } from 'lucide-react';
import { storage } from '../lib/storage';

const Collab = () => {
    const [formData, setFormData] = useState({ brandName: '', contactPerson: '', email: '', budget: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            storage.saveCollab(formData);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header Banner */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 rounded-b-[5rem] text-center mb-20 overflow-hidden relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto relative z-10"
                >
                    <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-8 block">Brand Partnerships</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-serif mb-8 leading-tight">Elevate Your Brand <br/> with <span className="text-primary italic">cookwithkitchen</span></h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                        Interested in showcasing your food product, appliance, or service? Let's create high-quality organic content together.
                    </p>
                </motion.div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            </div>

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
                <div className="col-span-1 space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-serif mb-6">Why Collab?</h3>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary flex-shrink-0">
                                <Target size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">Targeted Audience</h4>
                                <p className="text-xs text-muted leading-relaxed">Reach thousands of passionate home cooks and food enthusiasts daily.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary flex-shrink-0">
                                <Star size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">Authentic Reviews</h4>
                                <p className="text-xs text-muted leading-relaxed">We only promote products we truly love and believe in.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary flex-shrink-0">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-1">Omnichannel Reach</h4>
                                <p className="text-xs text-muted leading-relaxed">YouTube Reels, Instagram, and Website features all in one package.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl relative -mt-32 md:-mt-40 z-20 border-8 border-brand-bg/10"
                    >
                        {submitted ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 className="text-4xl font-black mb-4">Request Received!</h3>
                                <p className="text-muted mb-12 text-lg">Thank you for your interest. Kaju's team will reach out to you within 48 hours.</p>
                                <button onClick={() => setSubmitted(false)} className="bg-brand-dark text-white px-10 py-4 rounded-2xl font-bold">New Collaboration</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                                        <input 
                                            type="text" 
                                            placeholder="Brand Name" 
                                            className="w-full bg-brand-bg rounded-2xl py-5 pl-14 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                            value={formData.brandName}
                                            onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                                        <input 
                                            type="text" 
                                            placeholder="Contact Person" 
                                            className="w-full bg-brand-bg rounded-2xl py-5 pl-14 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                                        <input 
                                            type="email" 
                                            placeholder="Business Email" 
                                            className="w-full bg-brand-bg rounded-2xl py-5 pl-14 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
                                        <select 
                                            className="w-full bg-brand-bg rounded-2xl py-5 pl-14 pr-6 focus:outline-none appearance-none font-medium"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Budget Range</option>
                                            <option>$500 - $1,000</option>
                                            <option>$1,000 - $5,000</option>
                                            <option>$5,000 - $10,000</option>
                                            <option>$10,000+</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="relative">
                                    <MessageSquare size={16} className="absolute left-6 top-6 text-muted" />
                                    <textarea 
                                        placeholder="Tell us about the project..." 
                                        className="w-full bg-brand-bg rounded-2xl py-6 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all h-40"
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        required
                                    />
                                </div>
                                <button 
                                    className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.01] transition-all disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : <>Submit Request <Send size={20} /></>}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Collab;
