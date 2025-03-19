import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Map, NavigationControl, Marker, Popup, ScaleControl, FullscreenControl, GeolocateControl, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowRight, Clock, Sun, Users, Sparkles, MapPin, Compass, Layers, Moon, Settings, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlacePhoto } from '../utils/fetchPlacePhoto';

// MapListItem component for the sidebar
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

// InfoItem component for the destination details
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

export default function MapView({ 
  destinations, 
  selectedDestination, 
  onDestinationSelect,
  mapContainer,
  map,
  setMap
}) {
  const [popupInfo, setPopupInfo] = useState(null);
  const popupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('outdoor');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create an internal ref as a fallback
  const internalMapContainer = useRef(null);
  
  // Determine which container ref to use
  const activeMapContainer = mapContainer || internalMapContainer;

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Map style options
  const mapStyles = {
    outdoor: {
      name: 'Outdoor',
      url: 'outdoor',
      icon: <Compass className="w-4 h-4" />
    },
    streets: {
      name: 'Streets',
      url: 'streets',
      icon: <MapPin className="w-4 h-4" />
    },
    satellite: {
      name: 'Satellite',
      url: 'satellite',
      icon: <Layers className="w-4 h-4" />
    },
    winter: {
      name: 'Winter',
      url: 'winter',
      icon: <Moon className="w-4 h-4" />
    }
  };

  // Function to add style transformations to remove POIs
  const transformMapStyle = (style) => {
    if (map) {
      const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY || 'get_your_own_key_at_maptiler.com';
      
      // Change the style with transformRequest to modify it
      map.setStyle(`https://api.maptiler.com/maps/${style}/style.json?key=${mapTilerKey}`, {
        transformRequest: (url, resourceType) => {
          if (resourceType === 'Style' && url.includes('maptiler')) {
            return {
              url: url,
              credentials: 'same-origin'
            };
          }
        }
      });
      
      // Listen for style load and remove POI layers
      map.once('styledata', () => {
        const style = map.getStyle();
        if (style && style.layers) {
          const poiLayers = style.layers.filter(layer => 
            layer.id.includes('poi') || 
            layer.id.includes('place') || 
            layer.id.includes('label')
          );
          
          poiLayers.forEach(layer => {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
          });
        }
      });
      
      setMapStyle(style);
      setShowStyleSelector(false);
    }
  };
  
  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(destination => 
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize map
  useEffect(() => {
    // Verify that the map container exists and is a valid DOM element
    if (!map && activeMapContainer.current && activeMapContainer.current instanceof HTMLElement) {
      try {
        // Create a new MapTiler map instance using MapLibre
        const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY || 'get_your_own_key_at_maptiler.com';
        const mapTilerMap = new Map({
          container: activeMapContainer.current,
          style: `https://api.maptiler.com/maps/${mapStyle}/style.json?key=${mapTilerKey}`,
          center: [-6.0, 32.0], // Center of Morocco
          zoom: 5,
          maxZoom: 18,
          minZoom: 3,
          pitch: 30, // Add slight tilt for 3D effect
          attributionControl: false, // Disable default attribution
          logoControl: false, // Explicitly disable logo control
          antialias: true, // Smoother rendering
          transformRequest: (url, resourceType) => {
            // Modify style request to remove default POIs and attribution
            if (resourceType === 'Style' && url.includes('maptiler')) {
              return {
                url: url,
                credentials: 'same-origin'
              };
            }
          }
        });
        
        // Add a custom control to completely hide attribution
        mapTilerMap.addControl({
          onAdd: function() {
            const container = document.createElement('div');
            container.style.display = 'none';
            return container;
          },
          onRemove: function() {}
        }, 'bottom-right');
        
        // Once the map is loaded, add markers for each destination
        mapTilerMap.on('load', () => {
          setMapLoaded(true);
          
          // Remove any default layers that might show unwanted markers
          const style = mapTilerMap.getStyle();
          if (style && style.layers) {
            const layersToRemove = style.layers.filter(layer => 
              layer.id.includes('poi') || 
              layer.id.includes('place') || 
              layer.id.includes('label') ||
              layer.id.toLowerCase().includes('tangier')
            );
            
            layersToRemove.forEach(layer => {
              if (mapTilerMap.getLayer(layer.id)) {
                mapTilerMap.removeLayer(layer.id);
              }
            });
          }
          
          // Remove any default sources that might contain unwanted markers
          const sourcesToRemove = [
            'composite', 
            'openmaptiles', 
            'maptiler_attribution'
          ];
          
          sourcesToRemove.forEach(sourceId => {
            if (mapTilerMap.getSource(sourceId)) {
              mapTilerMap.removeSource(sourceId);
            }
          });
          
          // Aggressive removal of map control elements
          const removeMapControlElements = () => {
            const mapContainer = activeMapContainer.current;
            if (mapContainer) {
              const controlSelectors = [
                '.maplibregl-ctrl-bottom-right',
                '.maplibregl-ctrl-bottom-left',
                '.maplibregl-ctrl-top-right',
                '.maplibregl-ctrl-top-left',
                '.maplibregl-ctrl-compass',
                '.maplibregl-ctrl-geolocate',
                '.maplibregl-ctrl-fullscreen',
                '.maplibregl-ctrl-scale',
                '.maplibregl-ctrl-zoom',
                '.maplibregl-ctrl-navigation'
              ];
              
              controlSelectors.forEach(selector => {
                const elements = mapContainer.querySelectorAll(selector);
                elements.forEach(el => {
                  el.style.display = 'none';
                  el.style.visibility = 'hidden';
                  el.style.opacity = '0';
                  el.style.width = '0';
                  el.style.height = '0';
                  el.style.pointerEvents = 'none';
                });
              });
            }
          };
          
          // Run multiple times to ensure removal
          removeMapControlElements();
          setTimeout(removeMapControlElements, 500);
          setTimeout(removeMapControlElements, 1000);
          
          try {
            if (destinations && destinations.length > 0) {
              // Create a bounds object to fit all markers
              const bounds = new LngLatBounds();
              
              destinations.forEach(destination => {
                // Ensure destination has valid coordinates
                if (destination.coordinates && destination.coordinates.length === 2) {
                  // Extend bounds to include this point
                  bounds.extend(destination.coordinates);
                  
                  // Create a custom marker element
                  const markerEl = document.createElement('div');
                  markerEl.className = 'custom-marker';
                  
                  // Style based on destination popularity
                  const markerColor = destination.popularity === 'High' ? 'bg-indigo-600' : 'bg-violet-500';
                  
                  // Add pulse animation for high popularity destinations
                  const pulseClass = destination.popularity === 'High' ? 'pulse-animation' : '';
                  
                  
                  
                  // Add click event to marker
                  markerEl.addEventListener('click', () => {
                    onDestinationSelect(destination);
                  });
                  
                  // Create marker and add to map
                  const marker = new Marker({
                    element: markerEl,
                    anchor: 'bottom',
                    // Add slight offset for 3D effect
                    offset: [0, 0]
                  })
                    .setLngLat(destination.coordinates)
                    .addTo(mapTilerMap);
                    
                  // Add hover behavior
                  markerEl.addEventListener('mouseenter', () => {
                    setPopupInfo(destination);
                    markerEl.classList.add('marker-highlight');
                  });
                  
                  markerEl.addEventListener('mouseleave', () => {
                    setPopupInfo(null);
                    markerEl.classList.remove('marker-highlight');
                  });
                } else {
                  console.warn(`Invalid coordinates for destination: ${destination.name}`, destination.coordinates);
                }
              });
              
              // Fit map to destination bounds with padding
              if (!bounds.isEmpty()) {
                mapTilerMap.fitBounds(bounds, {
                  padding: {top: 50, bottom: 50, left: 50, right: 50},
                  maxZoom: 8,
                  duration: 2000
                });
              }
              
              // If there's already a selected destination, fly to it
              if (selectedDestination && selectedDestination.coordinates) {
                setTimeout(() => {
                  mapTilerMap.flyTo({
                    center: selectedDestination.coordinates,
                    zoom: 10,
                    duration: 1500
                  });
                }, 1000);
              }
            }
          } catch (markerError) {
            console.error("Error adding markers to map:", markerError);
          }
        });
        
        // Add map interaction events for better UX
        mapTilerMap.on('mouseenter', 'custom-marker', () => {
          mapTilerMap.getCanvas().style.cursor = 'pointer';
        });
        
        mapTilerMap.on('mouseleave', 'custom-marker', () => {
          mapTilerMap.getCanvas().style.cursor = '';
        });
        
        // Add error handling for map events
        mapTilerMap.on('error', (error) => {
          console.error('MapTiler error:', error);
        });
        
        // Save the map reference
        setMap(mapTilerMap);
      } catch (error) {
        console.error("Error initializing MapTiler map:", error);
      }
    }
    
    // Clean up (removal is handled in parent component)
    return () => {};
  }, [destinations, activeMapContainer.current, map, setMap, onDestinationSelect, selectedDestination, mapStyle]);
  
  // Change map style
  const changeMapStyle = (style) => {
    transformMapStyle(style);
  };
  
  
  // Update map when selected destination changes
  useEffect(() => {
    if (map && selectedDestination && selectedDestination.coordinates) {
      map.flyTo({
        center: selectedDestination.coordinates,
        zoom: 10,
        pitch: 45, // Increase tilt for more immersive view of selected location
        bearing: Math.random() * 60 - 30, // Random slight rotation for visual interest
        duration: 1500,
        essential: true
      });
    }
  }, [selectedDestination, map]);

  // Reset view function
  const resetView = () => {
    // Clear selected destination
    onDestinationSelect(null);
    
    // Create bounds from all destinations
    const bounds = new LngLatBounds();
    destinations.forEach(destination => {
      if (destination.coordinates) {
        bounds.extend(destination.coordinates);
      }
    });
    
    // If bounds are valid, fit map to bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { 
        padding: 50,
        duration: 1500 
      });
    } else {
      // Fallback to default Morocco view
      map.flyTo({
        center: [-6.0, 32.0],
        zoom: 5,
        duration: 1500
      });
    }
  };

  // Remove popularity heatmap and seasonal tips state
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  // Weather simulation for destinations (mock data)
  const getDestinationWeather = (destination) => {
    // This would ideally be replaced with a real weather API
    const weatherData = {
      'Marrakech': { temp: 28, condition: 'Sunny', icon: '☀️' },
      'Fes': { temp: 24, condition: 'Partly Cloudy', icon: '⛅' },
      'Chefchaouen': { temp: 22, condition: 'Mild', icon: '🌤️' },
      'Casablanca': { temp: 26, condition: 'Windy', icon: '🌬️' },
      'Rabat': { temp: 25, condition: 'Mild', icon: '🌤️' },
      'Essaouira': { temp: 23, condition: 'Breezy', icon: '🌊' },
      'Merzouga': { temp: 35, condition: 'Hot', icon: '🏜️' },
      'Tangier': { temp: 24, condition: 'Coastal', icon: '🌊' }
    };
    return weatherData[destination.name] || { temp: 25, condition: 'Pleasant', icon: '☀️' };
  };

  // Add new state variables for enhanced functionality
  const [showNearbyAttractions, setShowNearbyAttractions] = useState(false);
  const [showPhotosPanel, setShowPhotosPanel] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareDestinations, setCompareDestinations] = useState([]);

  // Nearby attractions for destinations (mock data)
  const getNearbyAttractions = (destination) => {
    const attractionsData = {
      'Marrakech': [
        { name: 'Jardin Majorelle', type: 'Garden', distance: '2.5 km' },
        { name: 'Bahia Palace', type: 'Historic Site', distance: '1.2 km' },
        { name: 'Jemaa el-Fnaa', type: 'Market', distance: '0.8 km' }
      ],
      'Fes': [
        { name: 'Bou Inania Madrasa', type: 'Historic Site', distance: '1.1 km' },
        { name: 'Al-Attarine Madrasa', type: 'Historic Site', distance: '0.9 km' },
        { name: 'Chouara Tannery', type: 'Cultural', distance: '1.5 km' }
      ],
      'Chefchaouen': [
        { name: 'Ras El Ma', type: 'Natural Site', distance: '1.0 km' },
        { name: 'Plaza Uta el-Hammam', type: 'Square', distance: '0.3 km' },
        { name: 'Kasbah Museum', type: 'Museum', distance: '0.5 km' }
      ],
      'Casablanca': [
        { name: 'Hassan II Mosque', type: 'Religious Site', distance: '3.2 km' },
        { name: 'Corniche', type: 'Waterfront', distance: '4.1 km' },
        { name: 'Morocco Mall', type: 'Shopping', distance: '7.8 km' }
      ]
    };
    return attractionsData[destination.name] || [
      { name: 'Local Market', type: 'Market', distance: '1.0 km' },
      { name: 'Historic Center', type: 'Historic Site', distance: '1.5 km' },
      { name: 'Scenic Viewpoint', type: 'Natural Site', distance: '2.0 km' }
    ];
  };

  // Travel time data between cities (mock data)
  const getTravelTime = (from, to) => {
    const travelData = {
      'Marrakech': {
        'Fes': { car: '5h 30m', train: '7h 15m', bus: '8h' },
        'Casablanca': { car: '2h 45m', train: '3h', bus: '3h 30m' },
        'Essaouira': { car: '2h 30m', train: 'N/A', bus: '3h' },
        'Chefchaouen': { car: '7h', train: 'N/A', bus: '9h 30m' }
      },
      'Fes': {
        'Marrakech': { car: '5h 30m', train: '7h 15m', bus: '8h' },
        'Casablanca': { car: '3h 15m', train: '3h 30m', bus: '4h' },
        'Chefchaouen': { car: '3h 30m', train: 'N/A', bus: '4h' },
        'Rabat': { car: '2h 30m', train: '2h 45m', bus: '3h 15m' }
      }
    };
    
    return travelData[from]?.[to] || { car: '4h', train: 'N/A', bus: '5h 30m' };
  };

  // Photo gallery data for destinations with real photo fetching
  const getDestinationPhotos = async (destination) => {
    try {
      // Cache for already fetched photos to avoid duplicate requests
      if (!destination.cachedPhotos) {
        // Basic set of photos - at least have the destination image
        const photos = [destination.image];
        
        // Try to fetch additional photos (3 more)
        try {
          // Use different search terms to get variety
          const searchTerms = [
            `${destination.name} Morocco attractions`,
            `${destination.name} Morocco landscape`,
            `${destination.name} Morocco city`
          ];
          
          // Fetch photos for each search term
          const photoPromises = searchTerms.map(term => fetchPlacePhoto(term, 'Morocco'));
          const fetchedPhotos = await Promise.all(photoPromises);
          
          // Add successful fetches to photos array
          fetchedPhotos.forEach(photo => {
            if (photo && !photos.includes(photo)) {
              photos.push(photo);
            }
          });
        } catch (error) {
          console.warn('Error fetching additional photos:', error);
        }
        
        // Cache the results
        destination.cachedPhotos = photos;
      }
      
      return destination.cachedPhotos;
    } catch (error) {
      console.error('Error in getDestinationPhotos:', error);
      return [destination.image];
    }
  };

  // Function to toggle destination comparison
  const toggleCompareDestination = (destination) => {
    if (compareDestinations.some(d => d.id === destination.id)) {
      setCompareDestinations(compareDestinations.filter(d => d.id !== destination.id));
    } else {
      if (compareDestinations.length < 3) {
        setCompareDestinations([...compareDestinations, destination]);
      } else {
        // Replace the oldest destination
        const newCompareList = [...compareDestinations.slice(1), destination];
        setCompareDestinations(newCompareList);
      }
    }
  };

  // Add state for the destination photos
  const [destinationPhotos, setDestinationPhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Effect to fetch photos when destination changes or photo panel is opened
  useEffect(() => {
    if (selectedDestination && showPhotosPanel) {
      const fetchPhotos = async () => {
        setIsLoadingPhotos(true);
        try {
          const photos = await getDestinationPhotos(selectedDestination);
          setDestinationPhotos(photos);
        } catch (error) {
          console.error('Error fetching destination photos:', error);
          setDestinationPhotos([selectedDestination.image]);
        } finally {
          setIsLoadingPhotos(false);
        }
      };
      
      fetchPhotos();
    }
  }, [selectedDestination, showPhotosPanel]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Destination list sidebar */}
      <div className={`w-full lg:w-1/3 order-2 lg:order-1 ${isMobile && selectedDestination ? 'hidden lg:block' : ''}`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-indigo-100/80 sticky top-20">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Destinations</h3>
          
          {/* Add search filter for destinations in list */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Filter destinations..."
              className="w-full pl-9 pr-4 py-2 bg-white/70 border border-indigo-100 rounded-lg text-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
              <Search className="h-4 w-4" />
            </div>
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination) => (
              <MapListItem
                key={destination.id}
                destination={destination}
                onClick={() => onDestinationSelect(destination)}
                isSelected={selectedDestination?.id === destination.id}
              />
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="mb-2">
                  <Search className="h-5 w-5 mx-auto text-gray-400" />
                </div>
                <p className="text-sm">No destinations found</p>
                <button 
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Map container */}
      <div className="w-full lg:w-2/3 order-1 lg:order-2">
        <div className="relative">
          {/* The map container */}
          <div 
            ref={activeMapContainer} 
            id="map-container"
            className="w-full h-[70vh] rounded-2xl shadow-lg overflow-hidden border border-indigo-100/80"
          />
          
          {/* Combined map controls container */}
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
            {/* Weather overlay toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowWeatherOverlay(!showWeatherOverlay);
                // If turning on, ensure a destination is selected
                if (!showWeatherOverlay && !selectedDestination && destinations.length > 0) {
                  onDestinationSelect(destinations[0]);
                }
              }}
              className={`p-2 rounded-full shadow-md border transition-all duration-300 flex items-center justify-center
                ${showWeatherOverlay 
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                  : 'bg-white/90 backdrop-blur-sm border-indigo-100/50 hover:bg-indigo-50/80'}`}
              aria-label="Toggle weather overlay"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="M20 12h2"/>
                <path d="m19.07 4.93-1.41 1.41"/>
                <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/>
                <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>
              </svg>
            </motion.button>

            {/* Nearby attractions toggle */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowNearbyAttractions(!showNearbyAttractions);
                // If turning on, ensure a destination is selected
                if (!showNearbyAttractions && !selectedDestination && destinations.length > 0) {
                  onDestinationSelect(destinations[0]);
                }
              }}
              className={`p-2 rounded-full shadow-md border transition-all duration-300 flex items-center justify-center
                ${showNearbyAttractions 
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                  : 'bg-white/90 backdrop-blur-sm border-indigo-100/50 hover:bg-indigo-50/80'}`}
              aria-label="Toggle nearby attractions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11v1a10 10 0 1 1-9-10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <path d="M9 9h.01"/>
                <path d="M15 9h.01"/>
                <path d="M22 4v7h-7"/>
              </svg>
            </motion.button>

            {/* Photo gallery toggle */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowPhotosPanel(!showPhotosPanel);
                // If turning on, ensure a destination is selected
                if (!showPhotosPanel && !selectedDestination && destinations.length > 0) {
                  onDestinationSelect(destinations[0]);
                }
              }}
              className={`p-2 rounded-full shadow-md border transition-all duration-300 flex items-center justify-center
                ${showPhotosPanel 
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                  : 'bg-white/90 backdrop-blur-sm border-indigo-100/50 hover:bg-indigo-50/80'}`}
              aria-label="Toggle photo gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </motion.button>

            {/* Map style selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStyleSelector(!showStyleSelector)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-indigo-100/50 hover:bg-indigo-50/80 transition-all duration-300 flex items-center justify-center"
                aria-label="Select map style"
              >
                {mapStyles[mapStyle].icon}
              </motion.button>
              
              <AnimatePresence>
                {showStyleSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 p-2 flex flex-col space-y-1 z-20"
                  >
                    {Object.entries(mapStyles).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => {
                          transformMapStyle(key);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-300 
                          ${mapStyle === key 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'hover:bg-indigo-50 text-gray-700'}`}
                      >
                        {style.icon}
                        <span>{style.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Reset view button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetView}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-indigo-100/50 hover:bg-indigo-50/80 transition-all duration-300 flex items-center justify-center"
              aria-label="Reset view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </motion.button>
          </div>
          
          {/* Weather Overlay */}
          {showWeatherOverlay && selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50 max-w-xs"
            >
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">{getDestinationWeather(selectedDestination).icon}</span>
                <div>
                  <h4 className="font-bold text-lg">{selectedDestination.name}</h4>
                  <p className="text-sm text-gray-600">
                    {getDestinationWeather(selectedDestination).condition}
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {getDestinationWeather(selectedDestination).temp}°C
              </div>
            </motion.div>
          )}

          {/* Nearby Attractions Panel */}
          {showNearbyAttractions && selectedDestination && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-20 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50 max-w-xs"
            >
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Nearby Attractions
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {getNearbyAttractions(selectedDestination).map((attraction, index) => (
                  <div key={index} className="bg-white/70 rounded-lg p-3 shadow-sm border border-indigo-50 hover:border-indigo-200 transition-colors">
                    <h5 className="font-medium text-gray-900">{attraction.name}</h5>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-indigo-600">{attraction.type}</span>
                      <span className="text-gray-500">{attraction.distance}</span>
            </div>
          </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Photo Gallery Panel */}
          {showPhotosPanel && selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-xl border border-indigo-100/50 max-w-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg flex items-center text-gray-800">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2 text-indigo-600"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  {selectedDestination.name} Gallery
                </h4>
                {isLoadingPhotos && (
                  <div className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    <svg className="animate-spin mr-1.5 h-3 w-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading
                  </div>
                )}
              </div>
              
              {isLoadingPhotos && destinationPhotos.length === 0 ? (
                // Loading placeholders with shimmer effect
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="relative h-32 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 overflow-hidden">
                      <div className="absolute inset-0 skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              ) : (
                // Actual photos
                <div className="grid grid-cols-2 gap-3">
                  {destinationPhotos.map((photo, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group h-32 rounded-lg overflow-hidden shadow-sm border border-indigo-50 relative"
                    >
                      <img 
                        src={photo} 
                        alt={`${selectedDestination.name} - ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="absolute bottom-2 right-2 text-xs text-white font-medium bg-indigo-600/70 backdrop-blur-sm rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Photo {index + 1}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button 
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
                  onClick={() => setShowPhotosPanel(false)}
                >
                  Close Gallery
                </button>
              </div>
            </motion.div>
          )}

        </div>
        
        {/* Selected destination details */}
        <AnimatePresence>
        {selectedDestination && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-indigo-100/80"
          >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedDestination.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-semibold flex items-center">
                    {selectedDestination.rating}
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </span>
                  {/* Add to comparison button */}
                  <button
                    onClick={() => toggleCompareDestination(selectedDestination)}
                    className={`p-1.5 rounded-lg text-xs font-medium flex items-center ${
                      compareDestinations.some(d => d.id === selectedDestination.id)
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-1"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {compareDestinations.some(d => d.id === selectedDestination.id)
                      ? "In Comparison"
                      : "Compare"
                    }
                  </button>
                </div>
              </div>

            <p className="text-gray-600 mb-4">{selectedDestination.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDestination.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoItem 
                icon={<Users className="w-4 h-4 text-indigo-600" />}
                label="Popularity"
                value={selectedDestination.popularity}
              />
              <InfoItem 
                icon={<Clock className="w-4 h-4 text-indigo-600" />}
                label="Duration"
                value={selectedDestination.idealDuration}
              />
              <InfoItem 
                icon={<Sun className="w-4 h-4 text-indigo-600" />}
                label="Best Time"
                value={selectedDestination.bestTimeToVisit.split(',')[0]}
              />
              <InfoItem 
                icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
                label="Rating"
                value={`${selectedDestination.rating}/5`}
              />
            </div>
              
            <div className="flex flex-wrap gap-3">
            <Link
              to={`/create-trip?destination=${encodeURIComponent(selectedDestination.name)}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg
                       bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                       text-sm font-medium shadow-md transition-all duration-300
                       hover:shadow-lg hover:-translate-y-1"
            >
                Plan a Trip to {selectedDestination.name}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
              
              
              <button
                onClick={() => {
                  setShowPhotosPanel(true);
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg
                       bg-white border border-indigo-200 text-indigo-700
                       text-sm font-medium shadow-sm transition-all duration-300
                       hover:bg-indigo-50 hover:border-indigo-300"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                View Photos
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
} 