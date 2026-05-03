import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Youtube, Instagram, Facebook, Twitter, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#D32F52] text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#D32F52]">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xl font-extrabold font-serif">Cook With <span className="text-white/80 italic">Kaju</span></span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Bringing the kitchen to life with easy, delicious, and healthy recipes. Let's cook something amazing together!
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#D32F52] transition-all"><Youtube size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#D32F52] transition-all"><Instagram size={16} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#D32F52] transition-all"><Facebook size={16} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/90">Explore</h4>
            <ul className="space-y-4 text-white/70 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Recipes</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Cooking Tips</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/collab" className="hover:text-white transition-colors">Collaboration</Link></li>
            </ul>
          </div>

          {/* <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/90">Categories</h4>
            <ul className="space-y-4 text-white/70 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Healthy Recipes</li>
              <li className="hover:text-white cursor-pointer transition-colors">Summer Shakes</li>
              <li className="hover:text-white cursor-pointer transition-colors">Dessert Bliss</li>
              <li className="hover:text-white cursor-pointer transition-colors">Street Food</li>
            </ul>
          </div> */}

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/90">Stay Updated</h4>
            <p className="text-white/70 text-xs mb-4">Subscribe to get the latest recipe updates directly in your inbox.</p>
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
              <input type="email" placeholder="Email address" className="bg-transparent border-none text-xs px-3 focus:outline-none flex-1 placeholder-white/50 text-white" />
              <button className="bg-white text-[#D32F52] px-3 py-2 rounded-md text-xs font-bold hover:bg-gray-100 transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/60 font-medium uppercase tracking-widest">
          <p>© 2024 Cook With Kaju. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
