import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, UtensilsCrossed, Youtube, Instagram, Facebook } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
    { name: 'Collaboration', path: '/collab' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#D32F52] shadow-md py-3' : 'bg-[#D32F52] py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#D32F52] rotate-[-5deg] group-hover:rotate-0 transition-transform">
            <UtensilsCrossed size={22} />
          </div>
          <span className="text-xl font-extrabold text-white font-serif">
            Cook With <span className="text-white/80 italic">Kaju</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-semibold hover:text-white transition-colors ${location.pathname === link.path ? 'text-white' : 'text-white/70'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="h-6 w-px bg-white/20" />
          
          <div className="flex items-center gap-4">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors"><Youtube size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors"><Instagram size={20} /></a>
            <Link to="/admin" className="bg-white text-[#D32F52] px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-black/10">
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#D32F52] border-t border-white/10 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4 text-white">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-lg font-bold">{link.name}</Link>
              ))}
              <div className="h-px bg-white/20 my-2" />
              <div className="flex items-center gap-6 mb-4 text-white">
                <Youtube />
                <Instagram />
                <Facebook />
              </div>
              <Link to="/admin" className="w-full bg-white text-[#D32F52] py-3 rounded-xl font-bold text-center">Admin Access</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
