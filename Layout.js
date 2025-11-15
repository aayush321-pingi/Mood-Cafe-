import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, Menu, Calendar, Sparkles, User, LogOut, 
  ChevronDown, Heart, Coffee, X, Grid3x3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", icon: Home, path: "Home" },
    { name: "Menu", icon: Coffee, path: "Menu" },
    { name: "Zones", icon: Grid3x3, path: "Zones" },
    { name: "Events", icon: Calendar, path: "Events" },
    { name: "Gallery", icon: Sparkles, path: "Gallery" },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <style>{`
        :root {
          --primary: 260 100% 70%;
          --secondary: 45 100% 65%;
          --accent: 320 80% 65%;
          --background: 240 20% 5%;
          --foreground: 0 0% 98%;
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-xl">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                  MoodBox
                </h1>
                <p className="text-xs text-purple-300">Café & Experience</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === createPageUrl(item.path)
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to={createPageUrl("Dashboard")} className="hidden md:block">
                    <Button 
                      variant="outline" 
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
                      >
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-purple-500/30">
                      <div className="p-3 border-b border-purple-500/20">
                        <p className="font-medium text-white">{user.full_name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10"
            >
              <nav className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      location.pathname === createPageUrl(item.path)
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                {user && (
                  <Link
                    to={createPageUrl("Dashboard")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-white">MoodBox Café</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Experience the future of dining with mood-based menus, immersive zones, 
                and unforgettable moments.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-purple-400">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-purple-400">IG</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-purple-400">FB</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to={createPageUrl("Menu")} className="text-gray-400 hover:text-purple-400 transition-colors">Menu</Link></li>
                <li><Link to={createPageUrl("Zones")} className="text-gray-400 hover:text-purple-400 transition-colors">Zones</Link></li>
                <li><Link to={createPageUrl("Events")} className="text-gray-400 hover:text-purple-400 transition-colors">Events</Link></li>
                <li><Link to={createPageUrl("Gallery")} className="text-gray-400 hover:text-purple-400 transition-colors">Gallery</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Experience Avenue</li>
                <li>Downtown District</li>
                <li>contact@moodbox.cafe</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2025 MoodBox Café. All rights reserved. Crafted with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
