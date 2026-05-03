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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white rotate-[-5deg] group-hover:rotate-0 transition-transform">
            <UtensilsCrossed size={22} />
          </div>
          <span className="text-xl font-extrabold text-brand-dark font-serif">
            Cook With <span className="text-primary italic">Kaju</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-semibold hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-brand-dark'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-4">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-muted hover:text-[#FF0000] transition-colors"><Youtube size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted hover:text-[#E4405F] transition-colors"><Instagram size={20} /></a>
            <Link to="/admin" className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-brand-dark" onClick={() => setIsOpen(!isOpen)}>
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
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-lg font-bold">{link.name}</Link>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex items-center gap-6 mb-4">
                <Youtube className="text-[#FF0000]" />
                <Instagram className="text-[#E4405F]" />
                <Facebook className="text-[#1877F2]" />
              </div>
              <Link to="/admin" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-center">Admin Access</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
