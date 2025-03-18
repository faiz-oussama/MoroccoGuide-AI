import { AuthContext } from '@/auth/AuthProvider';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogPanel
} from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import {
  Bell,
  Bookmark,
  HelpCircle,
  LogOut,
  Settings,
  Settings2,
  Sun,
  User
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      const success = await logoutUser();
      if (success) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {!isLoginPage && (
        <header className="sticky top-0 z-50 transition-all duration-300 bg-white">
          {/* Add gradient fade transition at the bottom */}
          <div 
            className="absolute inset-0 w-full transition-all duration-300
              WebkitBackdropFilter: 'blur(8px)'"
          />


          <nav className="relative mx-auto max-w-7xl h-16 px-4 lg:px-8">
            <div className="flex items-center justify-between h-full">
              {/* Left: Logo */}
              <div className="flex-shrink-0 w-32">
                <Link to="/" className="relative flex items-center">
                  <span className="sr-only">Maghreb Journey</span>
                  <div className="w-32 h-14 relative">
                    <img
                      alt="Company Logo"
                      src="/assets/logo.png"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </Link>
              </div>

              {/* Center: Navigation */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 
                            flex items-center space-x-1 shadow-lg shadow-indigo-500/10
                            border border-indigo-100/20">
                  {[
                    { to: "/", label: "Home" },
                    { to: "/explore", label: "Explore" },
                    { to: "/saved-trips", label: "My Itineraries" },
                    { to: "/about", label: "About" }
                  ].map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className={`relative px-4 py-2 text-sm font-medium rounded-xl
                                transition-all duration-200 ${
                                  location.pathname === link.to
                                    ? 'text-indigo-600 bg-indigo-50/80'
                                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                                }`}
                    >
                      {link.label}
                      {location.pathname === link.to && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r 
                                  from-indigo-500/10 to-violet-500/10"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-4">
                {/* Mobile menu button - only show on mobile */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600
                              hover:bg-slate-50 transition-all duration-200"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="size-6" />
                  </button>
                </div>

                {/* Desktop actions - hide on mobile */}
                <div className="hidden lg:flex items-center space-x-4">
                  {/* Theme toggle */}
                  {!user && (<motion.button 
                    whileHover={{ scale: 1.05, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600
                              hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </motion.button>)}


                  {/* Action buttons */}
                  <div className="flex items-center gap-x-4">
                    {!user && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/login"
                          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium
                                    bg-white/80 backdrop-blur-sm border border-slate-200
                                    text-slate-600 hover:text-indigo-600 hover:bg-slate-50
                                    shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Log in
                        </Link>
                      </motion.div>
                    )}
                    
                    {isHomePage && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          className="inline-flex items-center px-4 py-4 rounded-3xl text-sm font-medium
                                    bg-gradient-to-r from-indigo-600 to-violet-600
                                    text-white shadow-lg shadow-indigo-500/20
                                    hover:shadow-indigo-500/30 transition-all duration-200"
                          onClick={(e) => {
                            if (!user) {
                              e.preventDefault();
                              navigate('/login');
                            }
                            navigate('/create-trip');
                          }}
                        >
                          Start Planning
                        </Button>
                      </motion.div>
                    )}
                    <div className="flex items-center">
                      {user && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm
                                        px-3 py-1 rounded-full border border-indigo-100
                                        shadow-lg shadow-indigo-500/5 cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500
                                            flex items-center justify-center text-white">
                                <User className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600
                                            bg-clip-text text-transparent">
                                {user.displayName || 'Faiz'}
                              </span>
                            </motion.div>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2 mt-2 bg-white/80 backdrop-blur-md border-indigo-100">
                            <div className="grid gap-1">
                              {/* User Info */}
                              <div className="px-2 py-3">
                                <p className="text-sm font-medium text-slate-900">Signed in as</p>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                              </div>
                              
                              <div className="h-px bg-slate-200 my-1" />
                              
                              {/* Main Options */}
                              <button className="flex items-center space-x-2 px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <User className="h-4 w-4" />
                                <span>Your Profile</span>
                              </button>
                              
                              <Link to="/saved-trips" className="flex items-center space-x-2 px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <Bookmark className="h-4 w-4" />
                                <span>Saved Trips</span>
                              </Link>
                              
                              <button className="flex items-center space-x-2 px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <Bell className="h-4 w-4" />
                                <span>Notifications</span>
                              </button>
                              
                              <div className="h-px bg-slate-200 my-1" />
                              
                              {/* Settings & Support */}
                              <button className="flex items-center justify-between px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <div className="flex items-center space-x-2">
                                  <Settings2 className="h-4 w-4" />
                                  <span>Appearance</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Sun className="h-4 w-4" />
                                  <span className="text-xs text-slate-400">Light</span>
                                </div>
                              </button>
                              
                              <button className="flex items-center space-x-2 px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 px-2 py-2 text-sm text-slate-600 
                                              hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors">
                                <HelpCircle className="h-4 w-4" />
                                <span>Help & Support</span>
                              </button>
                              
                              <div className="h-px bg-slate-200 my-1" />
                              
                              {/* Logout */}
                              <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-2 py-2 text-sm text-red-600 
                                        hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile menu - preserving original functionality */}
          <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
            <div className="fixed inset-0 z-10 bg-slate-900/20 backdrop-blur-sm" />
            <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto 
                         bg-white/90 backdrop-blur-md px-6 py-6 sm:max-w-sm
                         shadow-2xl shadow-indigo-500/10">
              {/* Header */}
              <div className="flex items-center justify-between">
                <Link to="/" className="relative flex items-center group">
                  <span className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 
                                  bg-clip-text text-transparent">
                    Spectram
                  </span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100
                            transition-all duration-200"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="size-6" />
                </motion.button>
              </div>

              {/* Menu Content */}
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-slate-200/50">
                  {/* Navigation Links */}
                  <div className="space-y-1.5 py-6">
                    {[
                      { to: "/", label: "Home" },
                      { to: "/payment", label: "Payment" },
                      { to: "/analytics", label: "Analytics" },
                      { to: "/education", label: "Education" }
                    ].map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className={`block rounded-xl px-4 py-3 text-sm font-medium
                                   transition-all duration-200 ${
                                     location.pathname === link.to
                                       ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25'
                                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                   }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Auth Section */}
                  <div className="py-6">
                    {user ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleLogout}
                        className="w-full rounded-xl px-4 py-3 text-sm font-medium
                                 bg-gradient-to-r from-slate-100 to-slate-50
                                 text-slate-600 hover:text-slate-900
                                 border border-slate-200 shadow-sm
                                 transition-all duration-200"
                      >
                        Log out
                      </motion.button>
                    ) : (
                      <Link
                        to="/login"
                        className="block rounded-xl px-4 py-3 text-sm font-medium
                                 bg-gradient-to-r from-indigo-500 to-violet-500
                                 text-white shadow-lg shadow-indigo-500/25
                                 hover:shadow-indigo-500/40 transition-all duration-200"
                      >
                        Log in
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </DialogPanel>
          </Dialog>
        </header>
      )}
      <div 
        className="h-16 -mt-16 relative z-40 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            rgba(255,255,255,0.8) 0%,
            rgba(255,255,255,0) 100%)`
        }}
      />
    </>
  );
}