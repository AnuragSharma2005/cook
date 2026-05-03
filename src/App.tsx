import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlobalMobileDock from './components/GlobalMobileDock';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const CollaboratorStudio = lazy(() => import('./pages/CollaboratorStudio'));
const Contact = lazy(() => import('./pages/Contact'));
const Collab = lazy(() => import('./pages/Collab'));
const Creators = lazy(() => import('./pages/Creators'));
const LikedItems = lazy(() => import('./pages/LikedItems'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg">
    <motion.div 
      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
    />
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

function AppShell() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="grow pt-20 pb-24 md:pb-0">
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cook/:slug" element={<RecipeDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/studio" element={<CollaboratorStudio />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/liked" element={<LikedItems />} />
                <Route path="/creator/:id" element={<CreatorProfile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/collab" element={<Collab />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      <GlobalMobileDock
        isSearchOpen={isSearchOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
        onCloseSearch={() => setIsSearchOpen(false)}
      />
      <Footer />
    </div>
  );
}
