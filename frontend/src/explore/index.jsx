import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowRight, ChevronDown, Filter, MapPin, Search, Sun, Utensils, Compass, Clock, Users, Sparkles } from 'lucide-react';
import { fetchPlacePhoto } from '../utils/fetchPlacePhoto';
import { toast } from 'react-hot-toast';

const destinations = [
  {
    id: 1,
    name: "Marrakech",
    description: "Experience the vibrant markets, stunning palaces, and rich cultural heritage of Morocco's most famous city.",
    image: "https://images.unsplash.com/photo-1597212618440-806262de7bd8?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-7.9811, 31.6295],
    rating: 4.8,
    tags: ["culture", "markets", "history"],
    popularity: "High",
    idealDuration: "3-4 days",
    bestTimeToVisit: "March-May, September-November"
  },
  {
    id: 2,
    name: "Fes",
    description: "Step back in time as you wander the ancient medina, visit historic madrasas, and witness traditional craftsmanship.",
    image: "https://images.unsplash.com/photo-1579434184028-d38a8b2b76f9?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-5.0078, 34.0181],
    rating: 4.7,
    tags: ["history", "culture", "crafts"],
    popularity: "Medium",
    idealDuration: "2-3 days",
    bestTimeToVisit: "March-May, October-November"
  },
  {
    id: 3,
    name: "Chefchaouen",
    description: "Discover the enchanting blue city nestled in the Rif Mountains, offering serene beauty and picturesque streets.",
    image: "https://images.unsplash.com/photo-1553292888-7421a3e8bfbd?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-5.2636, 35.1689],
    rating: 4.9,
    tags: ["scenic", "photography", "relaxation"],
    popularity: "High",
    idealDuration: "1-2 days",
    bestTimeToVisit: "April-June, September-October"
  },
  {
    id: 4,
    name: "Casablanca",
    description: "Explore Morocco's largest city, home to the magnificent Hassan II Mosque and a blend of modern and traditional architecture.",
    image: "https://images.unsplash.com/photo-1577147713230-fecd95730fac?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-7.5898, 33.5731],
    rating: 4.5,
    tags: ["urban", "architecture", "coastal"],
    popularity: "Medium",
    idealDuration: "1-2 days",
    bestTimeToVisit: "March-May, September-November"
  },
  {
    id: 5,
    name: "Rabat",
    description: "Discover Morocco's capital, with its blend of Islamic and French colonial heritage, beautiful gardens, and coastal charm.",
    image: "https://images.unsplash.com/photo-1534318959793-b0095e4c9704?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-6.8498, 34.0209],
    rating: 4.6,
    tags: ["history", "coastal", "architecture"],
    popularity: "Medium",
    idealDuration: "1-2 days",
    bestTimeToVisit: "April-June, September-October"
  },
  {
    id: 6,
    name: "Essaouira",
    description: "Enjoy the laid-back atmosphere of this coastal gem, known for its beautiful beach, historic medina, and thriving arts scene.",
    image: "https://images.unsplash.com/photo-1604319087660-fced92a8e396?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-9.7701, 31.5085],
    rating: 4.7,
    tags: ["coastal", "windsurfing", "relaxation"],
    popularity: "Medium",
    idealDuration: "2-3 days",
    bestTimeToVisit: "April-October"
  },
  {
    id: 7,
    name: "Merzouga",
    description: "Experience the majestic Sahara Desert with camel treks, stunning sunsets, and unforgettable nights under the stars.",
    image: "https://images.unsplash.com/photo-1548314025-71a4d9d4e867?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-4.0074, 31.1000],
    rating: 4.9,
    tags: ["desert", "adventure", "scenic"],
    popularity: "High",
    idealDuration: "2-3 days",
    bestTimeToVisit: "October-April"
  },
  {
    id: 8,
    name: "Tangier",
    description: "Explore this vibrant port city where Europe meets Africa, offering rich history, beaches, and international influences.",
    image: "https://images.unsplash.com/photo-1554234362-d68946539c67?q=80&w=1000&auto=format&fit=crop",
    coordinates: [-5.8326, 35.7595],
    rating: 4.5,
    tags: ["coastal", "history", "multicultural"],
    popularity: "Medium",
    idealDuration: "1-2 days",
    bestTimeToVisit: "April-June, September-October"
  }
];

// Filter tags for destinations
const tagFilters = [
  { label: "All", value: "all" },
  { label: "Coastal", value: "coastal" },
  { label: "Cultural", value: "culture" },
  { label: "Historic", value: "history" },
  { label: "Adventure", value: "adventure" },
  { label: "Scenic", value: "scenic" },
  { label: "Desert", value: "desert" }
];

// Add lazy loading for map component
const MapView = lazy(() => import('./MapView'));

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or map
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [map, setMap] = useState(null);
  const [destinationsWithPhotos, setDestinationsWithPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [comparedDestinations, setComparedDestinations] = useState([]);
  
  const mapContainerRef = useRef(null);
  const heroRef = useRef(null);

  // Load destination photos
  useEffect(() => {
    const loadDestinationPhotos = async () => {
      setIsLoading(true);
      try {
        const destinationsWithLoadedPhotos = await Promise.all(
          destinations.map(async (destination) => {
            try {
              // Fetch photo using the fetchPlacePhoto API
              const photoUrl = await fetchPlacePhoto(destination.name, 'Morocco');
              return {
                ...destination,
                image: photoUrl
              };
            } catch (error) {
              console.error(`Error fetching photo for ${destination.name}:`, error);
              return destination; // Keep original image if fetch fails
            }
          })
        );
        
        setDestinationsWithPhotos(destinationsWithLoadedPhotos);
      } catch (error) {
        console.error('Error loading destination photos:', error);
        setDestinationsWithPhotos(destinations);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinationPhotos();
  }, []);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (viewMode === "map" && !map && mapContainerRef.current) {
      // The MapView component will handle map initialization
      console.log('Map Container Ref is ready for MapView component');
    }
    
    return () => {
      if (map) {
        // Safely clean up map on unmount
        map.remove();
      }
    };
  }, [viewMode]);
  
  // Filter destinations based on active filter and search query
  const filteredDestinations = destinationsWithPhotos.filter(destination => {
    const matchesFilter = activeFilter === "all" || destination.tags.includes(activeFilter);
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const handleDestinationClick = (destination) => {
    // Check if destination is null or undefined
    if (!destination) {
      console.log('No destination selected, resetting view.');
      // Reset selected destination and map view
      setSelectedDestination(null);
      
      // If map exists, reset to default view
      if (map && viewMode === "map") {
        // Remove any existing markers
        const existingMarkers = document.querySelectorAll('.custom-destination-marker');
        existingMarkers.forEach(marker => marker.remove());

        map.flyTo({
          center: [-6.0, 32.0], // Default Morocco center
          zoom: 5,
          duration: 1500
        });
      }
      return;
    }
    
    // Ensure destination has valid coordinates
    if (destination.coordinates && destination.coordinates.length === 2) {
      console.log('Destination selected:', destination.name);
      console.log('Coordinates:', destination.coordinates);
      setSelectedDestination(destination);
      
      if (map && viewMode === "map") {
        console.log('Adding marker to map.');
        
        // Remove any existing markers
        const existingMarkers = document.querySelectorAll('.custom-destination-marker');
        existingMarkers.forEach(marker => marker.remove());

        // Create a custom SVG map pin marker
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-destination-marker';
        markerEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6366f1" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-lg">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#6366f1"/>
          </svg>
        `;
        
        // Create marker and add to map
        new Marker({
          element: markerEl,
          anchor: 'bottom',
          offset: [0, 0]
        })
          .setLngLat(destination.coordinates)
          .addTo(map);
        
        map.flyTo({
          center: destination.coordinates,
          zoom: 12,
          duration: 1500
        });
      } else {
        console.warn('Map is not initialized or not in map view mode.');
      }
    } else {
      console.warn('Invalid destination coordinates:', destination);
      // Optionally, you could show a toast or handle this case
      toast.error('Unable to locate destination on map');
    }
  };
  
  const toggleCompareDestination = (destination) => {
    if (comparedDestinations.some(d => d.id === destination.id)) {
      setComparedDestinations(comparedDestinations.filter(d => d.id !== destination.id));
    } else {
      if (comparedDestinations.length < 3) {
        setComparedDestinations([...comparedDestinations, destination]);
      } else {
        // Show toast notification
        toast("You can compare up to 3 destinations at a time");
      }
    }
  };
  
  // Add shimmer styles inside the component
  useEffect(() => {
    const shimmerStyles = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .skeleton-shimmer::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          rgba(255, 255, 255, 0.2) 20%,
          rgba(255, 255, 255, 0.5) 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
      }
      
      /* Custom map marker styling */
      .custom-marker {
        display: inline-block;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }
      
      .custom-marker:hover {
        transform: scale(1.1);
      }
      
      /* Pulse animation for high popularity markers */
      @keyframes pulse-animation {
        0% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
      }

      .pulse-animation {
        animation: pulse-animation 2s infinite;
      }

      /* Small pulse for legend items */
      @keyframes pulse-small {
        0% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
        }
        70% {
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
      }

      .pulse-small {
        animation: pulse-small 2s infinite;
      }

      /* Marker highlight effect */
      .marker-highlight {
        z-index: 10;
        filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.7));
      }
      
      /* MapLibre popup styling */
      .maplibregl-popup {
        z-index: 10;
      }
      
      .maplibregl-popup-content {
        padding: 12px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
      }

      /* MapLibre controls styling */
      .maplibregl-ctrl-group {
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .maplibregl-ctrl button {
        width: 32px;
        height: 32px;
      }

      .maplibregl-ctrl button:hover {
        background-color: rgba(99, 102, 241, 0.1);
      }

      /* Destination popup styling */
      .destination-popup .maplibregl-popup-content {
        padding: 12px;
        min-width: 150px;
        text-align: center;
      }

      /* Full screen mode improvements */
      .maplibregl-map.maplibregl-ctrl-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100% !important;
        width: 100% !important;
        z-index: 9999 !important;
      }
      
      /* Add other custom styles */
      .text-reveal > * {
        animation: textReveal 0.8s forwards;
        opacity: 0;
      }
      
      .text-reveal > *:nth-child(1) { animation-delay: 0.1s; }
      .text-reveal > *:nth-child(2) { animation-delay: 0.2s; }
      .text-reveal > *:nth-child(3) { animation-delay: 0.3s; }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(99, 102, 241, 0.3);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(99, 102, 241, 0.5);
      }
      
      .glow-effect {
        position: relative;
      }
      
      .glow-effect::after {
        content: "";
        position: absolute;
        top: -15px;
        left: -15px;
        right: -15px;
        bottom: -15px;
        background: radial-gradient(circle at center, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%);
        border-radius: 50%;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .glow-effect:hover::after {
        opacity: 1;
      }
      
      /* 3D Text effect styles */
      .text-3d {
        transform: perspective(800px) rotateX(3deg);
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
      }
      
      .text-3d-gradient {
        position: relative;
        transform: perspective(800px) rotateX(3deg) translateZ(15px);
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
      }
      
      @media (hover: hover) {
        .text-3d:hover, .text-3d-gradient:hover {
          transform: perspective(800px) rotateX(0deg) translateZ(0);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.9; }
      }
      
      /* Animation utility classes */
      .animate-float {
        animation: float 4s ease-in-out infinite;
      }
      
      .animate-pulse {
        animation: pulse 2.5s ease-in-out infinite;
      }
      
      .animate-pulse-slow {
        animation: pulse 4s ease-in-out infinite;
      }
      
      /* Scroll indicator animation */
      @keyframes ping {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.5); opacity: 0.3; }
        100% { transform: scale(1); opacity: 0.7; }
      }
      
      .animate-ping {
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    `;
    
    const style = document.createElement("style");
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  // Clean up map on unmount
  useEffect(() => {
    return () => {
      try {
        if (map && typeof map.remove === 'function') {
          map.remove();
        }
      } catch (error) {
        console.error('Error removing map:', error);
      }
    };
  }, [map]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40">

      <div className="relative overflow-hidden">
        {/* Enhanced background with animated layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50/20 to-sky-50/30 pointer-events-none"></div>
        
        {/* Animated geometric shapes - reduced size */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "linear"
          }}
          className="absolute -right-32 -top-32 w-[400px] h-[400px] rounded-full 
                    bg-gradient-to-br from-violet-300/20 via-indigo-300/10 to-transparent 
                    blur-3xl pointer-events-none"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 25,
            ease: "linear"
          }}
          className="absolute -left-32 bottom-0 w-[300px] h-[300px] rounded-full 
                    bg-gradient-to-tr from-amber-200/30 via-rose-200/20 to-transparent 
                    blur-3xl pointer-events-none"
        />
        
        {/* Hero content with more compact text */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 sm:pt-10 sm:pb-8" ref={heroRef}>
          <div className="text-center w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full mx-auto"
              style={{ maxWidth: "100%" }}
            >
              <h1 className="mb-4 relative z-10 mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  <span className="block font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                       tracking-tighter leading-[0.85] text-slate-900 mb-2 
                       mix-blend-overlay opacity-90"
                  >
                    Discover Morocco's
                  </span>
                  <span className="block font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                         tracking-tighter leading-[0.85] 
                         bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600
                         text-transparent bg-clip-text
                         drop-shadow-[0_3px_3px_rgba(99,102,241,0.2)] animate-float"
                  >
                    Hidden Travel Gems
                  </span>
                  
                  {/* Background effects */}
                  <motion.div 
                    animate={{ 
                      opacity: [0.4, 0.6, 0.4],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 4,
                      ease: "easeInOut"
                    }}
                    className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-[105%] h-[105%] rounded-full bg-gradient-to-r 
                         from-indigo-100/30 via-violet-100/20 to-transparent 
                         blur-xl pointer-events-none"
                  ></motion.div>
                  
                  {/* Light effects */}
                  <div 
                    className="absolute -z-10 -top-6 right-1/4 w-16 h-16 bg-indigo-300/20 rounded-full blur-xl animate-pulse"
                  ></div>
                  <div 
                    className="absolute -z-10 bottom-3 left-1/4 w-12 h-12 bg-violet-300/15 rounded-full blur-xl animate-pulse-slow"
                  ></div>
                </motion.div>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-slate-600 mb-4 max-w-2xl mx-auto font-medium"
              >
                Explore vibrant cities, ancient medinas, and breathtaking landscapes.
              </motion.p>

              {/* Compact CTA section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-center space-x-4 mb-4"
              >
                <Link
                  to="/create-trip"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white 
                             font-semibold text-base shadow-xl shadow-indigo-500/30 
                             hover:shadow-2xl hover:shadow-indigo-500/40 
                             transform transition-all duration-300 
                             hover:-translate-y-1 flex items-center group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Use native scrollIntoView with smooth behavior
                    const destinationsSection = document.querySelector('.destinations-section');
                    if (destinationsSection) {
                      destinationsSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }
                  }}
                  className="px-5 py-2 rounded-xl border-2 border-indigo-100 
                             text-indigo-700 font-semibold text-base 
                             bg-white/80 backdrop-blur-sm 
                             hover:bg-indigo-50 transition-all duration-300 
                             flex items-center group"
                >
                  Explore Destinations
                  <Compass className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                </motion.button>
              </motion.div>
              
              {/* Enhanced scroll indicator with prominent design */}
              <div className="mt-6 mb-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  onClick={() => {
                    const destinationsSection = document.querySelector('.destinations-section');
                    if (destinationsSection) {
                      destinationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-indigo-100 mb-2">
                    <motion.span 
                      className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Discover Top Destinations Below
                    </motion.span>
                  </div>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-8 h-8 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-indigo-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping"></div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main content area with destinations section - moved up */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 destinations-section">
          {/* Enhanced search component with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-6 max-w-3xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-indigo-500/10 border border-indigo-100/80 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-indigo-100/40 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-violet-100/40 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
                {/* Search input - enhanced */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                  className="block w-full pl-12 pr-4 py-3.5 border-0 bg-transparent focus:ring-0 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:placeholder:text-indigo-300 transition-all font-medium text-lg"
                    placeholder="Search exotic destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
                
                {/* View toggle - enhanced */}
                <div className="flex items-center md:border-l md:border-slate-200 md:ml-4 md:pl-4">
                  <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        viewMode === "grid"
                          ? "bg-white shadow-md text-indigo-600"
                          : "text-slate-600 hover:text-indigo-500"
                      }`}
                    >
                      <span className="flex items-center">
                        <Compass className="w-4 h-4 mr-2" />
                        Destinations
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("map")}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        viewMode === "map"
                          ? "bg-white shadow-md text-indigo-600"
                          : "text-slate-600 hover:text-indigo-500"
                      }`}
                    >
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Map View
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Filter tags - enhanced with animation */}
              <div className="flex flex-wrap items-center mt-4 pt-4 border-t border-slate-100/70 relative">
                <div className="flex items-center mr-3 text-sm text-slate-700 font-medium">
                  <Filter className="w-4 h-4 mr-1.5 text-indigo-500" />
                  <span className="hidden sm:inline">Filter by:</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 relative">
                  {/* Add motion staggered children animation */}
                  <motion.div className="flex flex-wrap gap-2" variants={{
                    hidden: { opacity: 0 },
                    show: { 
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  initial="hidden"
                  animate="show">
                    {tagFilters.map((filter) => (
                      <motion.button
                        key={filter.value}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 }
                        }}
                        whileHover={{ y: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 
                                   ${activeFilter === filter.value
                                     ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                                     : "bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-700 hover:bg-indigo-50"}`}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
        </div>
      </div>
        </motion.div>

        {/* Rest of the existing destinations rendering logic */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, index) => (
              <DestinationSkeleton key={index} />
            ))}
          </div>
        ) : filteredDestinations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-indigo-50"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-indigo-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No destinations found</h3>
            <p className="text-gray-600 mb-6">We couldn't find any destinations matching your criteria.</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {setActiveFilter("all"); setSearchQuery("");}} 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-medium shadow-md shadow-indigo-500/20 transition-all"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : viewMode === "map" ? (
          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapView 
              destinations={filteredDestinations}
              selectedDestination={selectedDestination}
              onDestinationSelect={handleDestinationClick}
              mapContainer={mapContainerRef}
              map={map}
              setMap={setMap}
            />
          </Suspense>
        ) : (
          <DestinationGrid 
            destinations={filteredDestinations}
            onSelect={handleDestinationClick}
            selectedId={selectedDestination?.id}
          />
        )}
      </div>

      {/* Add back to top button */}
      <BackToTopButton />

      {/* Comparison drawer at the bottom */}
      {compareMode && comparedDestinations.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-lg z-40"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Comparing {comparedDestinations.length} Destinations</h3>
              <button 
                onClick={() => setComparedDestinations([])}
                className="text-slate-500 hover:text-indigo-600"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedDestinations.map(destination => (
                <ComparisonCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Destination card component
function DestinationCard({ destination, onClick, isSelected }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get appropriate color scheme based on destination type
  const getColorScheme = (tags) => {
    if (tags.includes("coastal") || tags.includes("beach")) {
      return {
        gradientFrom: "from-blue-500/70",
        gradientTo: "to-teal-400/70",
        iconColor: "text-blue-400",
        icon: <MapPin className="w-4 h-4" />
      };
    } else if (tags.includes("desert") || tags.includes("adventure")) {
      return {
        gradientFrom: "from-amber-500/70",
        gradientTo: "to-orange-400/70",
        iconColor: "text-amber-400",
        icon: <Compass className="w-4 h-4" />
      };
    } else if (tags.includes("history") || tags.includes("culture")) {
      return {
        gradientFrom: "from-indigo-500/70",
        gradientTo: "to-purple-400/70",
        iconColor: "text-indigo-400",
        icon: <Search className="w-4 h-4" />
      };
    } else {
      return {
        gradientFrom: "from-emerald-500/70",
        gradientTo: "to-teal-400/70",
        iconColor: "text-emerald-400",
        icon: <Sparkles className="w-4 h-4" />
      };
    }
  };
  
  const colorScheme = getColorScheme(destination.tags);
  const isPopular = destination.popularity === "High";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02, 
        transition: { duration: 0.3, ease: "easeOut" } 
      }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl shadow-md cursor-pointer
                 transform transition-all duration-300
                 ${isSelected 
                   ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' 
                   : 'hover:shadow-xl hover:shadow-indigo-300/30 border border-indigo-50'}`}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-b from-white/20 to-transparent rounded-bl-2xl opacity-50 z-10 pointer-events-none"></div>
      
      {/* Image container with enhanced loading state */}
      <div className="aspect-[4/3] overflow-hidden relative w-full h-full">
        <img 
          src={imageError ? "/default-city.jpg" : destination.image} 
          alt={destination.name} 
          className={`w-full h-full object-cover transition-all duration-500 
                   group-hover:scale-110 
                   ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        {/* Loading placeholder with branded colors */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-indigo-50/30 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
        )}
        
        {/* Default overlay with gradient that's subtle */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-all duration-300 group-hover:opacity-80 group-hover:backdrop-blur-sm"></div>
        
        {/* Top badge area with location type icon */}
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          <div className={`p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md ${colorScheme.iconColor}`}>
            {colorScheme.icon}
            </div>
          
          {/* Rating pill with enhanced design */}
          <div className="px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 flex items-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {destination.rating}
          </div>
          
          {/* Popular badge with animation */}
          {isPopular && (
            <motion.div 
              animate={{ 
                rotate: [0, -2, 2, 0],
                scale: [1, 1.03, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                repeatType: "mirror"
              }}
              className="px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 
                       text-xs font-medium text-white flex items-center shadow-md"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Popular
            </motion.div>
          )}
        </div>
        
        {/* Destination info positioned at the bottom with enhanced typography */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Tags with dynamic animation */}
          <div className="flex flex-wrap gap-1 mb-2">
            {destination.tags.slice(0, 3).map((tag, index) => (
              <motion.span 
                key={tag}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="px-2 py-0.5 text-xs font-medium text-white bg-black/40 backdrop-blur-sm 
                         rounded-full border border-white/10 shadow-sm transform transition-transform duration-300
                         group-hover:scale-105 group-hover:bg-white/20"
              >
                  {tag}
              </motion.span>
            ))}
          </div>
          
          {/* Destination name with enhanced design and animation */}
          <h3 className="text-xl font-bold text-white drop-shadow-md 
                       tracking-wide transform transition-all duration-300
                       group-hover:text-transparent group-hover:bg-clip-text 
                       group-hover:bg-gradient-to-r from-white to-white/80">
            {destination.name}
          </h3>
          
          {/* Duration indicator that appears on hover */}
          <div className="mt-1 flex items-center text-white/70 transition-all duration-300 opacity-0 
                         group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs">{destination.idealDuration}</span>
          </div>
            </div>
          </div>
          
      {/* Hover overlay with enhanced reveal animations */}
      <div className="absolute inset-0 
                     bg-gradient-to-b from-gray-900/95 to-gray-800/95
                     p-4 transform transition-all duration-300
                     opacity-0 flex flex-col justify-between
                     group-hover:opacity-100 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 opacity-0 transform -translate-y-4
                       group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
            {destination.name}
          </h3>
          
          <p className="text-white/90 text-xs mb-3 opacity-0 transform -translate-y-4
                      group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-150 line-clamp-3">
            {destination.description}
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-4 opacity-0 transform -translate-y-4
                        group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-200">
            <div className="flex items-center text-xs text-white/90 bg-white/10 rounded-lg p-1.5">
              <Clock className="w-3 h-3 mr-1.5 text-white" />
              <div>
                <div className="text-white/60 text-xs mb-0.5">Duration</div>
                <div className="font-medium text-xs">{destination.idealDuration}</div>
              </div>
            </div>
            <div className="flex items-center text-xs text-white/90 bg-white/10 rounded-lg p-1.5">
              <Sun className="w-3 h-3 mr-1.5 text-white" />
              <div>
                <div className="text-white/60 text-xs mb-0.5">Best Time</div>
                <div className="font-medium text-xs">{destination.bestTimeToVisit.split(',')[0]}</div>
              </div>
            </div>
              </div>
            </div>
            
            <Link
              to={`/create-trip`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                     bg-white text-gray-800
                     text-xs font-medium shadow-md transition-all duration-300
                     hover:shadow-lg hover:-translate-y-1
                     opacity-0 transform translate-y-4
                     group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-250"
            >
              Plan a Trip
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Link>
      </div>
    </motion.div>
  );
}

// Map list item component
function MapListItem({ destination, onClick, isSelected }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-300
                 ${isSelected 
                   ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200 border shadow-sm' 
                   : 'hover:bg-indigo-50/50'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-indigo-50 relative shadow-sm">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={imageError ? "/default-city.jpg" : destination.image} 
            alt={destination.name} 
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{destination.name}</h4>
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center text-amber-500">
              {destination.rating} 
              <span className="text-amber-500 ml-1">★</span>
            </span>
            <span className="mx-2">•</span>
            <span className="text-indigo-500 capitalize">{destination.tags[0]}</span>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {destination.idealDuration}
          </div>
        </div>
        <div className={`w-2 h-10 rounded-full ${isSelected ? 'bg-gradient-to-b from-indigo-500 to-violet-500' : 'bg-gray-200'}`}></div>
      </div>
    </motion.div>
  );
}

// Info item component
function InfoItem({ icon, label, value }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-indigo-50/70 to-violet-50/50 p-3 rounded-lg hover:shadow-md transition-all duration-200 border border-indigo-100/30"
    >
      <div className="flex items-center mb-1.5">
        <div className="p-1.5 bg-white rounded-full shadow-sm mr-2">
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </motion.div>
  );
}

// Animated search input component
function AnimatedSearchInput({ value, onChange, isExpanded, setIsExpanded }) {
  return (
    <motion.div 
      animate={{ width: isExpanded ? "240px" : "180px" }}
      className="relative group"
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-indigo-50/80 backdrop-blur-sm focus:bg-white border border-indigo-100/50 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
        placeholder="Search destinations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsExpanded(true)}
      />
      {value && (
        <button 
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </motion.div>
  );
}

// Back to top button component
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 600);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    </motion.button>
  );
}

// Destination grid with keyboard navigation
function DestinationGrid({ destinations, onSelect, selectedId }) {
  const gridRef = useRef(null);
  
  // Keyboard navigation between cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gridRef.current) return;
      
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const cards = Array.from(gridRef.current.querySelectorAll('.destination-card'));
        const currentIndex = cards.findIndex(card => card.dataset.id === selectedId?.toString());
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        const cols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        
        switch (e.key) {
          case 'ArrowRight':
            nextIndex = Math.min(currentIndex + 1, cards.length - 1);
            break;
          case 'ArrowLeft':
            nextIndex = Math.max(currentIndex - 1, 0);
            break;
          case 'ArrowDown':
            nextIndex = Math.min(currentIndex + cols, cards.length - 1);
            break;
          case 'ArrowUp':
            nextIndex = Math.max(currentIndex - cols, 0);
            break;
          default:
            return;
        }
        
        if (cards[nextIndex]) {
          cards[nextIndex].focus();
          onSelect(destinations[nextIndex]);
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destinations, onSelect, selectedId]);
  
  return (
    <div 
      ref={gridRef} 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" 
      role="region" 
      aria-label="Destination cards"
    >
      {destinations.map((destination) => (
        <DestinationCard 
          key={destination.id} 
          destination={destination} 
          onClick={() => onSelect(destination)}
          isSelected={selectedId === destination.id}
          tabIndex={0}
          className="destination-card"
          data-id={destination.id}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect(destination);
              e.preventDefault();
            }
          }}
          aria-label={`Destination: ${destination.name}`}
        />
      ))}
    </div>
  );
}

// Map loading skeleton component
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[70vh] rounded-2xl bg-indigo-50/80 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 skeleton-shimmer"></div>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-700 font-medium">Loading map...</p>
      </div>
    </div>
  );
}

// Comparison card component
function ComparisonCard({ destination }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-indigo-100 shadow-md">
      <div className="h-36 overflow-hidden relative">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
          <h3 className="text-white font-bold text-lg">{destination.name}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Rating</p>
            <p className="font-medium flex items-center">
              {destination.rating} 
              <span className="text-amber-500 ml-1">★</span>
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Popularity</p>
            <p className="font-medium">{destination.popularity}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Duration</p>
            <p className="font-medium">{destination.idealDuration}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Best Time</p>
            <p className="font-medium">{destination.bestTimeToVisit.split(',')[0]}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {destination.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Destination skeleton component for loading state
function DestinationSkeleton() {
  return (
    <div className="rounded-xl shadow-md overflow-hidden bg-white/80 relative border border-indigo-50/50">
      {/* Add shimmer effect */}
      <div className="absolute inset-0 w-full h-full skeleton-shimmer"></div>
      
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-b from-slate-100 to-slate-200 relative">
        {/* Top badge skeletons */}
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          <div className="w-7 h-7 bg-white/80 rounded-full"></div>
          <div className="w-12 h-5 bg-white/80 rounded-full"></div>
        </div>
        
        {/* Bottom content skeletons */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-1 mb-2">
            <div className="w-14 h-4 bg-black/10 rounded-full"></div>
            <div className="w-16 h-4 bg-black/10 rounded-full"></div>
            <div className="w-12 h-4 bg-black/10 rounded-full"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-5 w-2/3 bg-black/10 rounded-md mb-1.5"></div>
          
          {/* Duration skeleton */}
          <div className="h-3 w-1/3 bg-black/5 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}