import { AuthContext } from '@/auth/AuthProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { fetchPlacePhoto } from '@/utils/fetchPlacePhoto';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/utils/api'; // Import the API utility

// Add debugging code to check the API URL
console.log('API URL from environment:', import.meta.env.VITE_API_URL);
console.log('API URL used in api utility:', api.defaults.baseURL);

export default function SavedTrips() {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [cityImages, setCityImages] = useState({});
  const [filterActive, setFilterActive] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const filterRef = useRef(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [DeleteConfirmation, setDeleteConfirmation] = useState(false);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterActive(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Trigger animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      
      try {
        // Use the API utility instead of hardcoded URL
        const response = await api.get(`/user-trips/${user.uid}`);
        
        if (response.data && Array.isArray(response.data.data)) {
          setTrips(response.data.data);
          
          // Add more detailed logging
          console.log('Trips fetched:', response.data.data);
          
          // Fetch images for each destination
          const images = {};
          for (const trip of response.data.data) {
            if (!trip.tripData?.tripDetails?.destination) {
              console.warn('Trip missing destination:', trip);
              continue;
            }
            
            const destinationFull = trip.tripData.tripDetails.destination;
            const destination = destinationFull.split(",")[0];
            
            console.log(`Fetching image for destination: ${destination}`);
            
            if (!images[destination]) {
              try {
                const photoUrl = await fetchPlacePhoto(destination, destinationFull);
                
                console.log(`Photo URL for ${destination}:`, photoUrl);
                
                images[destination] = photoUrl || '/default-city.jpg';
              } catch (err) {
                console.error(`Error fetching image for ${destination}:`, err);
                images[destination] = '/default-city.jpg';
              }
            }
          }
          
          console.log('Fetched city images:', images);
          setCityImages(images);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load your saved trips: unexpected data format');
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load your saved trips');
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

  const handleViewTrip = (trip) => {
    navigate('/trip-results', { 
      state: { tripPlan: trip.tripData, savedTrip: true }
    });
  };

  const handleTripCardClick = (trip) => {
    setSelectedTrip(trip);
  };

  const closeDetailModal = () => {
    setSelectedTrip(null);
  };

  // Helper function to safely get trip details
  const getSafeValue = (value, defaultValue = '') => {
    // If value is an object with count and type, try to use count
    if (value && typeof value === 'object' && value.count !== undefined) {
      return value.count;
    }
    // If value is undefined or null, return default
    return value || defaultValue;
  };

  const getFilteredTrips = () => {
    if (!trips) return [];
    
    let filteredResults = [...trips];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(trip => {
        const destination = getSafeValue(trip.tripData?.tripDetails?.destination, "").toLowerCase();
        const origin = getSafeValue(trip.tripData?.tripDetails?.origin, "").toLowerCase();
        return destination.includes(query) || origin.includes(query);
      });
    }
    
    // Apply category filter
    const currentDate = new Date();
    
    if (filter === 'upcoming') {
      filteredResults = filteredResults.filter(trip => {
        const startDate = trip.tripData?.tripDetails?.dates?.start;
        return startDate && new Date(startDate) > currentDate;
      });
    }
    
    if (filter === 'past') {
      filteredResults = filteredResults.filter(trip => {
        const endDate = trip.tripData?.tripDetails?.dates?.end;
        return endDate && new Date(endDate) < currentDate;
      });
    }
    
    return filteredResults;
  };

  const toggleFilterMenu = () => {
    setFilterActive(!filterActive);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const deleteTrip = (tripId) => {
    console.log('Deleting trip with ID:', tripId);
    setTripToDelete(tripId);
  };


  const confirmDeleteTrip = async () => {
    console.log('Confirming deletion of trip with ID:', tripToDelete);
    if (!tripToDelete) return;
    
    try {
      // Use the API utility instead of hardcoded URL
      await api.delete(`/trips/${tripToDelete}`);
      setTrips(trips.filter(trip => trip._id !== tripToDelete));
      toast.success("Trip deleted successfully!");
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip');
    }
  };

  const editTrip = (tripId) => {
    navigate(`/edit-trip/${tripId}`);
  };

  const getDurationDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(148,130,255,0.08)_0%,rgba(148,130,255,0.08)_5%,rgba(119,255,238,0.08)_45%,rgba(148,223,255,0.08)_60%,rgba(67,156,255,0.08)_90%)]"></div>
          <svg className="absolute left-0 top-20 w-full opacity-5" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-indigo-100 z-10"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Travel Hub</h2>
            <p className="text-gray-600 mb-6">Sign in to access your personalized travel dashboard and saved adventures.</p>
            <Link 
              to="/login" 
              className="w-full inline-block px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In to Your Account
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">Create one now</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
        <LoadingScreen />
    );
  }

  const filteredTrips = getFilteredTrips();
  return (
    <div className="min-h-screen bg-white relative overflow-hidden pb-16">
      {/* Creative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
  {/* Improved backdrop blur with proper CSS syntax */}
  <div 
    className="absolute inset-0 w-full transition-all duration-300"
    style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
  />
  
  {/* Soft gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/10 to-violet-50/20 z-0"></div>
  
  {/* Abstract wave pattern - decorative element */}
  <div className="absolute top-0 inset-x-0 h-[40vh] opacity-20">
    <svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full">
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        fill="#6366F1"
        fillOpacity="0.06"
      ></path>
      <path
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
        fillOpacity="0.07"
        fill="#8B5CF6"
        transform="translate(0, 20)"
      ></path>
    </svg>
  </div>

  {/* Floating particles/dots - modern, subtle interactive elements */}
  {[...Array(8)].map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-indigo-300/20"
      style={{
        width: `${Math.random() * 2 + 0.5}rem`,
        height: `${Math.random() * 2 + 0.5}rem`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: 'blur(1px)'
      }}
      animate={{
        y: [0, Math.random() * 30 - 15],
        x: [0, Math.random() * 30 - 15],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{
        duration: Math.random() * 5 + 10,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
    />
  ))}
  
  {/* Bottom highlight gradient accent */}
  <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-indigo-50/40 to-transparent"></div>
  
  {/* Topographic pattern - travel theme element */}
  <motion.div 
    className="absolute inset-0 opacity-[0.03] overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.03 }}
    transition={{ duration: 2 }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="topography" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="0" />
        <feDisplacementMap in="SourceGraphic" scale="170" />
      </filter>
      <rect width="100%" height="100%" filter="url(#topography)" fillOpacity="0" stroke="currentColor" strokeWidth="0.2" />
    </svg>
  </motion.div>
  
  {/* Main colorful blobs with improved positioning and animations */}
  <div className="absolute top-20 -left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
  <div className="absolute top-40 -right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
  <div className="absolute bottom-32 left-40 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
  <div className="absolute -bottom-20 right-40 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000"></div>
  
  {/* Subtle compass rose - travel theme accent */}
  <motion.div 
    className="absolute top-10 right-10 w-40 h-40 opacity-5"
    animate={{ rotate: 360 }}
    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
  >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="35" />
        <line x1="5" y1="50" x2="95" y2="50" />
        <line x1="50" y1="5" x2="50" y2="95" />
        <line x1="15" y1="15" x2="85" y2="85" />
        <line x1="15" y1="85" x2="85" y2="15" />
      </g>
      <polygon points="50,10 55,45 90,50 55,55 50,90 45,55 10,50 45,45" fill="#6366F1" fillOpacity="0.2" />
    </svg>
  </motion.div>
</div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20 relative py-6"
        >
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-violet-200/60 rounded-full filter blur-3xl opacity-70 animate-pulse-extremely-slow"></div>
          <div className="absolute -bottom-10 left-1/4 w-40 h-40 bg-blue-100/40 rounded-full filter blur-2xl opacity-70 animate-pulse-slower"></div>
          <div className="absolute top-12 right-1/4 w-32 h-32 bg-teal-100/30 rounded-full filter blur-2xl opacity-70 animate-pulse-slow"></div>
                    
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-800 via-indigo-800 to-violet-700 
                        bg-clip-text text-transparent tracking-tight mb-6 relative z-10 px-4 leading-[1.1]
                        drop-shadow-sm"
                  >
                  <div className="z-30 inline-block relative font-serif italic">
                    <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.5, 
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="relative block"
                    >
                    <span className="bg-gradient-to-br from-violet-700 via-indigo-700 to-indigo-800 bg-clip-text text-transparent
                            tracking-wider text-4xl md:text-7xl leading-tight
                            drop-shadow-[0_1px_1px_rgba(79,70,229,0.15)] font-bold">
                      Your Travel Collection
                    </span>
                    
                    {/* Enhanced shimmer effect with more pronounced gleam */}
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-35"
                      style={{ 
                        backgroundSize: "300% 100%",
                        backgroundPosition: "100% 0",
                      }}
                      animate={{ 
                        backgroundPosition: ["100% 0", "-200% 0"] 
                      }}
                      transition={{ 
                        duration: 2.5, 
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 2.2
                      }}
                    />
                    
                    {/* Premium halo effect */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-xl rounded-lg"></div>
                    
                    {/* Subtle text texture overlay */}
                    <div className="absolute inset-0 bg-[url('/texture-fine.png')] bg-repeat opacity-[0.03] mix-blend-overlay"></div>
                  </motion.span>
                  
                  {/* Refined elegant underline with enhanced curve */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                    className="absolute h-4 md:h-5 w-full bottom-0 left-0 overflow-hidden"
                  >
                    <svg className="w-full h-full" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                      <motion.path 
                        fill="none" 
                        stroke="url(#underlineGradient)" 
                        strokeWidth="5" 
                        strokeLinecap="round" 
                        d="M0,7 C50,2 150,12 200,7" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.9 }}
                        transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>

                  {/* Premium decorative star with improved visibility */}
                  <motion.div 
                    className="absolute -right-8 -top-10 text-indigo-300/60"
                    initial={{ opacity: 0, rotate: -25, scale: 0.7, y: 5 }}
                    animate={{ opacity: 1, rotate: -5, scale: 1.2, y: 0 }}
                    transition={{ delay: 1.4, duration: 1.2, type: "spring", stiffness: 100 }}
                  >
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.82L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" 
                            fill="url(#starGradient)" />
                      <defs>
                        <linearGradient id="starGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#E9D5FF" /> {/* Lighter violet */}
                          <stop offset="1" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                  
                  {/* Secondary star with enhanced appearance */}
                  <motion.div 
                    className="absolute -left-12 top-8 text-violet-300/30"
                    initial={{ opacity: 0, rotate: 25, scale: 0.7, y: -5 }}
                    animate={{ opacity: 1, rotate: 5, scale: 1.1, y: 0 }}
                    transition={{ delay: 1.6, duration: 1.2, type: "spring" }}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.82L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" 
                            fill="url(#starGradient2)" />
                      <defs>
                        <linearGradient id="starGradient2" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#DDD6FE" />
                          <stop offset="1" stopColor="#A78BFA" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                  
                  {/* Decorative elements with improved visibility */}
                  <motion.div 
                    className="absolute right-1/3 -top-5 text-indigo-200/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 1 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
                    </svg>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute left-2 bottom-1 text-violet-200/15"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
                    </svg>
                  </motion.div>

                  {/* New luxury accent elements */}
                  <motion.div 
                    className="absolute -right-4 bottom-3 text-indigo-400/20"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.2, duration: 0.8, type: "spring" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,0 L15,9 L24,12 L15,15 L12,24 L9,15 L0,12 L9,9 Z" />
                    </svg>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute left-1/3 bottom-8 text-violet-400/15"
                    initial={{ opacity: 0, scale: 0, rotate: 45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 2.4, duration: 0.8, type: "spring" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,0 L15,9 L24,12 L15,15 L12,24 L9,15 L0,12 L9,9 Z" />
                    </svg>
                  </motion.div>
                </div>

              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-8"
            >
              Revisit your planned journeys and dream destinations <br />
              <span className="text-indigo-700 font-medium italic">all in one beautiful space</span>.
            </motion.p>
            
            {/* Enhanced stats row with staggered animation */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[
                { label: "Saved Trips", value: trips?.length || 0 },
                { label: "Upcoming", value: trips?.filter(trip => new Date(trip.tripData?.tripDetails?.dates?.start) > new Date()).length || 0 },
                { label: "Completed", value: trips?.filter(trip => new Date(trip.tripData?.tripDetails?.dates?.end) < new Date()).length || 0 }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7 + (i * 0.15), duration: 0.6, type: "spring", stiffness: 100 }}
                  className="bg-white/80 backdrop-blur-sm px-7 py-4 rounded-2xl shadow-md 
                          border border-indigo-50 hover:border-indigo-200 transition-all duration-300
                          hover:shadow-lg hover:-translate-y-1"
                >
                  <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + (i * 0.15), duration: 0.4, type: "spring", stiffness: 200 }}
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-indigo-600 to-violet-700 bg-clip-text text-transparent"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Enhanced floating travel icons with better animations */}
          <motion.div 
            className="absolute -left-6 bottom-16 text-indigo-200 opacity-40"
            animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </motion.div>
          
          <motion.div 
            className="absolute right-2 top-12 text-violet-200 opacity-40"
            animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1, repeatType: "reverse" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
          </motion.div>
          
          {/* Additional floating icon for more depth */}
          <motion.div 
            className="absolute left-1/4 top-6 text-teal-200 opacity-30"
            animate={{ y: [0, -10, 0], x: [0, 6, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5, repeatType: "reverse" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"/>
              <path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729c.14.09.266.19.373.297.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.34 2.34 0 0 1 .433-.335.504.504 0 0 1-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z"/>
            </svg>
          </motion.div>           
        </motion.header>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {trips.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm mr-2 hidden md:inline">View:</span>
                  <button 
                    onClick={toggleViewMode}
                    className="p-1.5 rounded-md hover:bg-gray-100"
                    title={viewMode === 'grid' ? "Switch to list view" : "Switch to grid view"}
                  >
                    {viewMode === 'grid' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={toggleFilterMenu}
                    className="flex items-center space-x-1 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-gray-700">
                      {filter === 'all' ? 'All Trips' : filter === 'upcoming' ? 'Upcoming' : 'Past Trips'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {filterActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden"
                      >
                        <ul className="py-1">
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'all' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('all'); setFilterActive(false); }}
                            >
                              All Trips
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'upcoming' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('upcoming'); setFilterActive(false); }}
                            >
                              Upcoming Trips
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'past' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('past'); setFilterActive(false); }}
                            >
                              Past Trips
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <Link 
                  to="/create-trip" 
                  className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Trip</span>
                </Link>
              </div>
            </div>
            
            {/* Trip count indicator */}
            {(searchQuery || filter !== 'all') && (
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-500">
                  Showing {filteredTrips.length} of {trips.length} trips
                </span>
                {(searchQuery || filter !== 'all') && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilter('all'); }}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <span>Clear filters</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        {trips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-2xl mx-auto border border-indigo-100"
          >
            <div className="mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Adventure Collection Awaits</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This is where all your travel dreams come to life. Create your first trip and start building memories that will last a lifetime.
            </p>
            <Link 
              to="/create-trip" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan Your First Adventure
            </Link>
          </motion.div>
        ) : filteredTrips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto border border-gray-100"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">No matches found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any trips matching your current filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilter('all'); }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
  {viewMode === 'grid' ? (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {filteredTrips.map((trip, index) => {
        
        const destination = trip.tripData?.tripDetails?.destination || "Unknown Destination";
        const startDate = trip.tripData?.tripDetails?.dates?.start;
        const endDate = trip.tripData?.tripDetails?.dates?.end;
        const description = trip.tripData?.tripDescription || "";
        const tags = trip.tripData?.tripDetails?.tags || [];
        
        // Get destination for image
        const destinationCity = destination.split(",")[0];
        const imageUrl = cityImages[destinationCity] || '/default-city.jpg';
        
        // Calculate days until trip starts
        let daysUntil = null;
        if (startDate && new Date(startDate) > new Date()) {
          const diffTime = Math.abs(new Date(startDate) - new Date());
          daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        return (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative h-[430px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          >
            {/* Card glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-2xl opacity-0 group-hover:opacity-70 blur-sm group-hover:blur transition-all duration-300 group-hover:duration-200"></div>
            
            {/* Main card */}
            <div className="relative bg-white rounded-2xl shadow-md group-hover:shadow-xl h-full z-10 overflow-hidden flex flex-col transition-all duration-300">
              {/* Image section */}
              <div className="relative h-56 overflow-hidden">
                {/* Trip status indicator with enhanced styling */}
                <div className="absolute top-4 left-4 z-30">
                  {startDate && new Date(startDate) > new Date() ? (
                    <div className="flex items-center">
                      <div className="flex px-2.5 py-1 rounded-full backdrop-blur-md bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-lg">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5 my-auto"></div>
                        <span className="text-xs font-medium">In {daysUntil} days</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex px-2.5 py-1 rounded-full backdrop-blur-md bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-white shadow-lg">
                        <div className="h-2 w-2 rounded-full bg-white mr-1.5 my-auto"></div>
                        <span className="text-xs font-medium">Past trip</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Trip Image */}
                <div className="absolute inset-0">
                  <img 
                    src={imageUrl} 
                    alt={destination}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 group-hover:via-black/20 transition-all duration-300"></div>
                </div>
                
                {/* Floating action buttons - cleaner design */}
                <div className="absolute top-3.5 right-3.5 z-30 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 duration-200">
                  <div className="flex gap-2 bg-white/20 backdrop-blur-lg p-1.5 rounded-full shadow-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editTrip(trip.id);
                      }}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-white text-indigo-600 hover:text-indigo-700 transition-colors"
                      title="Edit trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrip(trip._id);
                      }}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-white text-red-500 hover:text-red-600 transition-colors"
                      title="Delete trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Destination name with modern design */}
                <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold drop-shadow-sm line-clamp-1">
                      {destinationCity}
                    </h3>
                    
                    {/* Small country indication */}
                    {destination.includes(",") && (
                      <span className="text-white/70 text-xs font-medium mt-0.5">
                        {destination.split(",")[1].trim()}
                      </span>
                    )}
                  </div>
                  
                  {/* Duration pill - modern style */}
                  {startDate && endDate && (
                    <div className="flex items-center bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white/90 text-xs font-medium">{getDurationDays(startDate, endDate)} days</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trip details section with improved spacing */}
              <div className="flex-grow flex flex-col p-5 pb-2" onClick={() => handleViewTrip(trip)}>
                {/* Date range with elegant styling */}
                <div className="flex items-center text-gray-500 text-xs mb-3 bg-gray-50 rounded-full px-3 py-1.5 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    {endDate && startDate ? (
                      <span className="inline-block mx-1">—</span>
                    ) : ''}
                    {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                </div>
                
                {/* Full destination */}
                <h4 className="font-medium text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                  {destination}
                </h4>
                
                {/* Description with refined styling */}
                {description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {description}
                  </p>
                )}
                
                {/* Tags with modern design */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto mb-1">
                    {tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Card footer with view button - now closer to content above */}
              <div className="px-5 pb-3">
                <button
                  onClick={() => handleViewTrip(trip)}
                  className="w-full group-hover:bg-indigo-600 bg-indigo-100 group-hover:text-white text-indigo-700 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center transition-all duration-300"
                >
                  <span>View Itinerary</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {filteredTrips.map((trip, index) => {
        // Extract trip details safely
        const destination = trip.tripData?.tripDetails?.destination || "Unknown Destination";
        const startDate = trip.tripData?.tripDetails?.dates?.start;
        const endDate = trip.tripData?.tripDetails?.dates?.end;
        const description = trip.tripData?.tripDetails?.description || "";
        const tags = trip.tripData?.tripDetails?.tags || [];
        
        // Get destination for image
        const destinationCity = destination.split(",")[0];
        const imageUrl = cityImages[destinationCity] || '/default-city.jpg';
        
        // Calculate days until trip starts
        let daysUntil = null;
        if (startDate && new Date(startDate) > new Date()) {
          const diffTime = Math.abs(new Date(startDate) - new Date());
          daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        return (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="group relative overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => handleViewTrip(trip)}
          >
            {/* Card hover glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-2xl opacity-0 group-hover:opacity-70 blur-sm group-hover:blur transition-all duration-300 group-hover:duration-200"></div>
            
            {/* Main card */}
              <div className="relative h-[250px] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300 border border-gray-100 z-10">
              <div className="relative md:w-72 h-48 md:h-auto overflow-hidden">
                {/* Trip status indicator */}
                <div className="absolute top-4 left-4 z-30">
                  {startDate && new Date(startDate) > new Date() ? (
                    <div className="flex px-2.5 py-1 rounded-full backdrop-blur-md bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-lg">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-1.5 my-auto"></div>
                      <span className="text-xs font-medium">In {daysUntil} days</span>
                    </div>
                  ) : (
                    <div className="flex px-2.5 py-1 rounded-full backdrop-blur-md bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-white shadow-lg">
                      <div className="h-2 w-2 rounded-full bg-white mr-1.5 my-auto"></div>
                      <span className="text-xs font-medium">Past trip</span>
                    </div>
                  )}
                </div>
                
                {/* Trip image */}
                <img 
                  src={imageUrl} 
                  alt={destination}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
                
                {/* Destination name overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <h3 className="text-white text-xl font-bold drop-shadow-sm line-clamp-1">
                    {destinationCity}
                  </h3>
                  
                  {/* Small country indication */}
                  {destination.includes(",") && (
                    <span className="text-white/70 text-xs font-medium mt-0.5">
                      {destination.split(",")[1].trim()}
                    </span>
                  )}
                  
                  {/* Duration pill - modern style */}
                  {startDate && endDate && (
                    <div className="flex items-center bg-white/15 backdrop-blur-md mt-2 px-2.5 py-1 rounded-full w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/90 text-xs">{getDurationDays(startDate, endDate)} days</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content section with improved layout */}
              <div className="flex-grow flex flex-col p-6 relative">
                {/* Floating action buttons with refined hover effect */}
                <div className="absolute top-5 right-5 z-30 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="flex gap-2 bg-gray-50/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editTrip(trip.id);
                      }}
                      className="p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                      title="Edit trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrip(trip.id);
                      }}
                      className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Trip details with elegant date presentation */}
                <div className="flex items-center text-gray-500 text-xs mb-3 bg-gray-50 rounded-full px-3 py-1.5 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    {endDate && startDate ? (
                      <span className="inline-block mx-1">—</span>
                    ) : ''}
                    {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                </div>
                
                {/* Full destination with hover effect */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  {destination}
                </h3>
                
                {/* Description with enhanced styling */}
                {description && (
                  <div className="mb-4 bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border-l-4 border-indigo-200">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{description}</p>
                  </div>
                )}
                
                {/* Trip highlights with modern design */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-gray-700 font-medium">{destinationCity}</span>
                  </div>
                  
                  {startDate && endDate && (
                    <div className="flex items-center bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-700 font-medium">{getDurationDays(startDate, endDate)} day trip</span>
                    </div>
                  )}
                  
                  <div className="flex items-center bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-xs text-gray-700 font-medium">Experience</span>
                  </div>
                </div>
                
                {/* Tags with style refinements */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1.5"></span>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* View trip button with enhanced animation */}
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTrip(trip);
                    }}
                    className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl py-2.5 px-5 text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center"
                  >
                    <span>View Trip Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  )}
</>
        )}
      </div>
      
      {/* Confirmation Dialog for Trip Deletion */}
      <AnimatePresence>
        {tripToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setTripToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete trip</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the trip to {trips.find(t => t._id === tripToDelete)?.tripData.tripDetails.destination.split(",")[0]}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTrip}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}