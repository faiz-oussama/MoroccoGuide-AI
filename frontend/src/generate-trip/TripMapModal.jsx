import { DirectionsRenderer, GoogleMap, InfoWindow, Marker, MarkerClusterer, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Eye, Filter, Layers, Loader, Route, Share2, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ItineraryPanel } from './ItineraryPanel';
import { MAP_CONFIG } from './mapconfig';

const getMarkerIcon = (type) => {
    // Custom SVG markers for better visibility
    const iconStyle = {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 10
    };

    switch (type?.toLowerCase()) {
      case 'hotel':
      case 'accommodation':
        return {
          ...iconStyle,
          fillColor: '#3b82f6', // blue-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 12 // Slightly larger for hotels
        };

      case 'restaurant':
      case 'meal':
      case 'cafe':
        return {
          ...iconStyle,
          fillColor: '#f59e0b', // amber-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 8 // Smaller for restaurants
        };

      case 'attraction':
      case 'landmark':
      case 'sight':
        return {
          ...iconStyle,
          fillColor: '#ef4444', // red-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 10
        };

      case 'transport':
      case 'station':
      case 'airport':
        return {
          ...iconStyle,
          fillColor: '#8b5cf6', // violet-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 9
        };

      case 'activity':
      case 'event':
        return {
          ...iconStyle,
          fillColor: '#10b981', // emerald-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 8
        };

      default:
        return {
          ...iconStyle,
          fillColor: '#6b7280', // gray-500
          labelOrigin: new window.google.maps.Point(0, -20)
        };
    }
};
const processLocations = (tripPlan) => {
  const locations = [];

  // Process hotels
  tripPlan?.accommodation?.hotels?.forEach(hotel => {
    locations.push({
      name: hotel.name,
      description: hotel.description || hotel.address,
      type: 'hotel',
      position: hotel.coordinates ? {
        lat: parseFloat(hotel.coordinates.latitude),
        lng: parseFloat(hotel.coordinates.longitude)
      } : null,
      day: 'Accommodation'
    });
  });

  tripPlan?.attractions?.forEach(attraction => {
    locations.push({
      name: attraction.name,
      description: attraction.details,
      type: 'attraction',
      position: attraction.coordinates ? {
        lat: parseFloat(attraction.coordinates.latitude),
        lng: parseFloat(attraction.coordinates.longitude)
      } : null,
      day: 'Points of Interest'
    });
  });

  tripPlan?.dailyPlan?.forEach(day => {
    day.activities?.forEach(activity => {
      if (activity.location && activity.location !== 'N/A') {
        locations.push({
          name: activity.activity,
          description: `${activity.time} - ${activity.location}`,
          type: activity.transport === 'N/A' ? 'activity' : 'transport',
          position: null, // Will be geocoded
          originalLocation: activity.location,
          day: `Day ${day.day} - ${day.date || ''}`
        });
      }
    });

    // Process meals
    day.meals?.forEach(meal => {
      locations.push({
        name: meal.restaurant,
        description: `${meal.mealType} - ${meal.time}\n${meal.cuisineType?.join(', ')}`,
        type: 'restaurant',
        position: null, // Will be geocoded
        originalLocation: meal.location,
        day: `Day ${day.day} - ${day.date || ''}`
      });
    });
  });

  return locations;
};

// Update the createDailyActivitiesMap function to use summaryOfDay exclusively

const createDailyActivitiesMap = (tripPlan) => {
  // Create a map with day number as key and array of activities as value
  const dailyActivitiesMap = new Map();
  
  if (!tripPlan?.dailyPlan) {
    console.log("No daily plan data available");
    return dailyActivitiesMap;
  }
  
  console.log("Creating daily activities map from summaryOfDay data");
  
  // Process each day in the trip plan
  tripPlan.dailyPlan.forEach((dayPlan) => {
    const dayNum = dayPlan.day;
    
    // Skip days without summaryOfDay
    if (!dayPlan.summaryOfDay) {
      console.log(`Day ${dayNum}: No summaryOfDay data`);
      return;
    }
    
    // Convert summaryOfDay object to array of activities
    const activities = Object.entries(dayPlan.summaryOfDay).map(([time, data]) => {
      // Validate each entry
      if (!data || !data.activity || !data.location) {
        console.warn(`Invalid data for time ${time} on day ${dayNum}`);
        return null;
      }
      
      // Create a properly structured activity object
      return {
        name: data.activity,
        time,
        position: {
          lat: parseFloat(data.location.latitude),
          lng: parseFloat(data.location.longitude)
        },
        description: `${time} - ${data.activity}`,
        day: `Day ${dayNum} - ${dayPlan.date || ''}`,
        type: determineActivityType(data.activity),
        sequenceNum: 0 // Will be set after sorting
      };
    }).filter(Boolean); // Remove any null entries
    
    // Sort activities by time
    activities.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      const minutesA = timeA[0] * 60 + (timeA[1] || 0);
      const minutesB = timeB[0] * 60 + (timeB[1] || 0);
      
      return minutesA - minutesB;
    });
    
    // Assign sequence numbers
    activities.forEach((activity, index) => {
      activity.sequenceNum = index + 1;
    });
    
    // Store in map
    dailyActivitiesMap.set(dayNum, activities);
    
    // Log activities for this day
    console.log(`Day ${dayNum}: ${activities.length} activities`);
    activities.forEach(activity => {
      console.log(`  ${activity.sequenceNum}. ${activity.name} (${activity.time})`);
    });
  });
  
  return dailyActivitiesMap;
};

// Helper function to determine the activity type based on its name
const determineActivityType = (activityName) => {
  if (!activityName) return 'activity'; 
  
  const name = String(activityName).toLowerCase();
  
  // Hotel/Accommodation types
  if (name.includes('hotel') || 
      name.includes('check-in') || 
      name.includes('check out') ||
      name.includes('accommodation') ||
      name.includes('riad')) {
    return 'hotel';
  }
  
  // Food-related activities
  if (name.includes('breakfast') || 
      name.includes('lunch') || 
      name.includes('dinner') ||
      name.includes('restaurant') || 
      name.includes('café') ||
      name.includes('cafe')) {
    return 'restaurant';
  }
  
  // Tourist attractions
  if (name.includes('visit') || 
      name.includes('explore') || 
      name.includes('tour') ||
      name.includes('tower') ||
      name.includes('palace') || 
      name.includes('museum') ||
      name.includes('necropolis') || 
      name.includes('kasbah') ||
      name.includes('mausoleum')) {
    return 'attraction';
  }
  
  // Transportation activities
  if (name.includes('train') || 
      name.includes('taxi') || 
      name.includes('transport') ||
      name.includes('airport') || 
      name.includes('transfer')) {
    return 'transport';
  }
  
  // Special activities/experiences
  if (name.includes('performance') ||
      name.includes('music') ||
      name.includes('workshop') ||
      name.includes('relax') ||
      name.includes('enjoy')) {
    return 'activity';
  }
  
  // Default
  return 'activity';
};

export default function TripMapModal({ isOpen, onClose, tripPlan }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [geocodingQueue, setGeocodingQueue] = useState([]);
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [showItinerary, setShowItinerary] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [directionsResponses, setDirectionsResponses] = useState([]);  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [routeCache, setRouteCache] = useState({});
  const [sequenceMarkers, setSequenceMarkers] = useState([]);
  const [fallbackPolylines, setFallbackPolylines] = useState([]);
  const totalLocationsToGeocode = useRef(0);
  const directionsRendererRef = useRef(null);
  const activeRenderers = useRef([]);
  const mapRef = useRef(null);

  // Load Google Maps API using shared config
  const { isLoaded, loadError } = useJsApiLoader(MAP_CONFIG);

  // Extract trip locations from the tripPlan
  useEffect(() => {
    if (isOpen && tripPlan) {
      // Reset states on open
      setGeocodedLocations([]);
      setGeocodingQueue([]);
      setDirectionsResponses([]);
      setFallbackPolylines([]);
      setSequenceMarkers([]);
      setMapLoaded(false);
      setSelectedLocation(null);
      
      if (isLoaded) {
        console.log("Map API loaded, processing locations");
        const initialLocations = processLocations(tripPlan);
        const locationsToGeocode = initialLocations.filter(loc => !loc.position);
        totalLocationsToGeocode.current = locationsToGeocode.length;
        
        // Set locations with coordinates directly
        const locationsWithCoords = initialLocations.filter(loc => loc.position);
        setGeocodedLocations(locationsWithCoords);
        
        // Queue locations without coordinates for geocoding
        setGeocodingQueue(locationsToGeocode);
        
        // Geocode the destination for map center
        const geocoder = new window.google.maps.Geocoder();
        try {
          geocoder.geocode(
            { address: tripPlan.tripDetails.destination },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                console.log("Setting map center");
                setMapCenter({
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng()
                });
              } else {
                console.error('Geocoding failed:', status);
                // Fallback to a default location
                setMapCenter({ lat: 34.0, lng: -5.0 }); // Default to Morocco
              }
            }
          );
        } catch (error) {
          console.error("Geocoding error:", error);
          setMapCenter({ lat: 34.0, lng: -5.0 }); // Default to Morocco
        }
      }
    }
  }, [isOpen, tripPlan, isLoaded]);

  // Move geocodeLocation inside component to access tripPlan
  const geocodeLocation = async (location) => {
    if (!window.google?.maps?.Geocoder) {
      console.error("Google Maps Geocoder not loaded");
      return null;
    }

    const geocoder = new window.google.maps.Geocoder();

    try {
      const { results } = await geocoder.geocode({
        address: `${location.originalLocation}, ${tripPlan?.tripDetails?.destination}`
      });

      if (results && results[0]) {
        return {
          ...location,
          position: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          }
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return location;
  };

  // Add a geocoding effect
  useEffect(() => {
    if (geocodingQueue.length > 0 && isLoaded) {
      const progress = ((totalLocationsToGeocode.current - geocodingQueue.length) / totalLocationsToGeocode.current) * 100;
      setGeocodingProgress(progress);
      const geocodeNext = async () => {
        const location = geocodingQueue[0];
        const geocodedLocation = await geocodeLocation(location);
        
        if (geocodedLocation?.position) {
          setGeocodedLocations(prev => [...prev, geocodedLocation]);
        }
        
        setGeocodingQueue(prev => prev.slice(1));
      };

      // Add delay to respect API rate limits
      const timer = setTimeout(geocodeNext, 500);
      return () => clearTimeout(timer);
    }
  }, [geocodingQueue, isLoaded, tripPlan]);

  // Compute locations directly from summaryOfDay
const computeLocationsFromSummary = () => {
  const allLocations = [];
  
  if (!tripPlan?.dailyPlan) return [];
  
  tripPlan.dailyPlan.forEach(day => {
    if (!day.summaryOfDay) return;
    
    Object.entries(day.summaryOfDay).forEach(([time, data]) => {
      if (!data || !data.activity || !data.location) return;
      
      allLocations.push({
        name: data.activity,
        description: `${time} - ${data.activity}`,
        position: {
          lat: parseFloat(data.location.latitude),
          lng: parseFloat(data.location.longitude)
        },
        day: `Day ${day.day} - ${day.date || ''}`,
        time,
        type: determineActivityType(data.activity)
      });
    });
  });
  
  return allLocations;
};

// Get all locations
const locations = computeLocationsFromSummary();

// Filter locations based on active day and filter type
const filteredLocations = locations.filter(location => {
  // Filter by day if activeDay is set
  if (activeDay && !location.day.includes(`Day ${activeDay}`)) {
    return false;
  }
  
  // Filter by type
  if (filterType !== 'all') {
    return location.type === filterType;
  }
  
  return true;
});

  // Handle map load
  const onMapLoad = (map) => {
    console.log("Map loaded");
    setMapInstance(map);
    mapRef.current = map;
    setMapLoaded(true);
    
    // Wait a moment before fitting bounds
    setTimeout(() => {
      // Fit bounds to include all markers
      if (locations.length > 1 && map) {
        const locationsWithPositions = locations.filter(loc => loc.position);
        if (locationsWithPositions.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          locationsWithPositions.forEach(location => {
            bounds.extend(location.position);
          });
          map.fitBounds(bounds);
        }
      }
      
      // Start route calculation after map is loaded
      calculateDailyRoutes();
    }, 500);
  };
  
  // Add this function to clear all route visuals
  const clearRouteVisuals = () => {
    // Clear all sequence markers from the map
    sequenceMarkers.forEach(item => {
      if (item.marker) {
        item.marker.setMap(null);
      }
    });
    
    // Reset sequence markers array
    setSequenceMarkers([]);
    
    // Clear all directions
    setDirectionsResponses([]);
    
    // Clear fallback polylines
    setFallbackPolylines([]);
  };

  // Handle day selection
  const handleDaySelect = (day) => {
    console.log("Selected day:", day);
    
    // Step 1: Clear all renderers
    activeRenderers.current.forEach(renderer => {
      if (renderer) renderer.setMap(null);
    });
    activeRenderers.current = [];
    
    // Step 2: Clear all routes
    setDirectionsResponses([]);
    setFallbackPolylines([]);
    
    // Step 3: Clear all sequence markers
    sequenceMarkers.forEach(item => {
      if (item.marker) {
        item.marker.setMap(null);
      }
    });
    setSequenceMarkers([]);
    
    // Step 4: Update active day
    setActiveDay(day);
    
    // Step 5: Toast
    showToastMessage(`Showing Day ${day} locations`);
    
    // Step 6: Calculate routes for the new day
    setTimeout(() => {
      calculateDailyRoutes();
    }, 100);
  };
  
  const toggleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
    showToastMessage(`Map type: ${types[nextIndex]}`);
  };
  
  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    showToastMessage(`Filtering: ${type === 'all' ? 'All locations' : type + 's'}`);
  };
  
  // Handle map capture
  const captureMap = () => {
    setIsCapturing(true);
    showToastMessage("Preparing map capture...");
    
    // Hide UI elements for the screenshot
    setShowItinerary(false);
    
    // Allow time for UI to update
    setTimeout(() => {
      // Use html2canvas or similar library to capture the map
      // This is just a placeholder for the concept
      console.log("Map would be captured here");
      setIsCapturing(false);
      setShowItinerary(true);
      showToastMessage("Map captured! (Demo only)");
    }, 1000);
  };
  
  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Share map (demo functionality)
  const shareMap = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trip Map: ${tripPlan?.tripDetails?.destination}`,
        text: `Check out my ${tripPlan?.tripDetails?.duration?.days}-day trip to ${tripPlan?.tripDetails?.destination}!`,
        url: window.location.href,
      })
      .then(() => showToastMessage("Shared successfully!"))
      .catch(() => showToastMessage("Sharing cancelled"));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToastMessage("Map link copied to clipboard!"));
    }
  };
  
  // Add this function at component level
  const calculateTripStats = () => {
    let totalDistance = 0;
    let visitedLocations = 0;
  
    // Check if Google Maps API and geometry library are loaded
    if (!window.google || !window.google.maps || !window.google.maps.geometry) {
      console.log("Google Maps Geometry library not loaded yet");
      return {
        totalKm: "0",
        locations: locations.filter(loc => loc.position).length
      };
    }
  
    tripPlan?.dailyPlan?.forEach(day => {
      const dayLocations = locations.filter(
        loc => loc.day.includes(`Day ${day.day}`) && loc.position
      ).sort((a, b) => {
        const timeA = a.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        const timeB = b.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        return timeA.localeCompare(timeB);
      });
  
      visitedLocations += dayLocations.length;
  
      // Calculate distance between consecutive points
      for (let i = 1; i < dayLocations.length; i++) {
        try {
          const prevPos = dayLocations[i - 1].position;
          const currPos = dayLocations[i].position;
          
          if (prevPos && currPos && window.google?.maps?.geometry) {
            totalDistance += window.google.maps.geometry.spherical.computeDistanceBetween(
              new window.google.maps.LatLng(prevPos.lat, prevPos.lng),
              new window.google.maps.LatLng(currPos.lat, currPos.lng)
            );
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
        }
      }
    });
  
    return {
      totalKm: (totalDistance / 1000).toFixed(1),
      locations: visitedLocations
    };
  };
  
  // Update your trip summary card
  const tripStats = React.useMemo(() => {
    if (!isLoaded || !window.google?.maps?.geometry?.spherical) {
      return { totalKm: "0", locations: 0 };
    }
    return calculateTripStats();
  }, [isLoaded, locations, tripPlan]);

  // Add this function to calculate routes
  const calculateRoutes = async (dayLocations, day) => {
    if (dayLocations.length < 2) return null;
    
    // Check cache first
    const cacheKey = `${day}-${dayLocations.map(loc => `${loc.position.lat},${loc.position.lng}`).join('|')}`;
    if (routeCache[cacheKey]) {
      return routeCache[cacheKey];
    }
    
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Handle large number of locations - split into segments
      if (dayLocations.length > 10) {
        // For larger routes, just connect key points (first, middle, last)
        const keyPoints = [
          dayLocations[0],
          dayLocations[Math.floor(dayLocations.length / 2)],
          dayLocations[dayLocations.length - 1]
        ];
        
        const request = {
          origin: new window.google.maps.LatLng(keyPoints[0].position.lat, keyPoints[0].position.lng),
          destination: new window.google.maps.LatLng(keyPoints[2].position.lat, keyPoints[2].position.lng),
          waypoints: [{
            location: new window.google.maps.LatLng(keyPoints[1].position.lat, keyPoints[1].position.lng),
            stopover: true
          }],
          optimizeWaypoints: false,
          travelMode: window.google.maps.TravelMode.DRIVING
        };
        
        const result = await directionsService.route(request);
        setRouteCache(prev => ({...prev, [cacheKey]: result}));
        return result;
      } 
      
      // Normal case - reasonable number of waypoints
      const waypoints = dayLocations.slice(1, -1).map(location => ({
        location: new window.google.maps.LatLng(location.position.lat, location.position.lng),
        stopover: true
      }));
  
      const request = {
        origin: new window.google.maps.LatLng(dayLocations[0].position.lat, dayLocations[0].position.lng),
        destination: new window.google.maps.LatLng(
          dayLocations[dayLocations.length - 1].position.lat,
          dayLocations[dayLocations.length - 1].position.lng
        ),
        waypoints: waypoints,
        optimizeWaypoints: false, // Set to false for faster calculation
        travelMode: window.google.maps.TravelMode.DRIVING
      };
  
      const result = await directionsService.route(request);
      setRouteCache(prev => ({...prev, [cacheKey]: result}));
      return result;
    } catch (error) {
      console.error("Error calculating route:", error);
      return null;
    }
  };
  
  // Replace your existing daily routes code with this
  useEffect(() => {
    if (isLoaded && filteredLocations.length > 0) {
      setIsLoadingDirections(true);
      
      let cancelled = false;
      const calculateDailyRoutes = async () => {
        const newDirectionsResponses = [];
        const daysToProcess = tripPlan?.dailyPlan || [];
        
        // Process active day first if it exists
        if (activeDay) {
          const activeDayPlan = daysToProcess.find(d => d.day === activeDay);
          if (activeDayPlan) {
            // Process the active day first
            const dayLocations = locations.filter(
              loc => loc.day.includes(`Day ${activeDayPlan.day}`) && loc.position
            ).sort((a, b) => {
              const timeA = a.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
              const timeB = b.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
              return timeA.localeCompare(timeB);
            });
  
            if (dayLocations.length >= 2) {
              const response = await calculateRoutes(dayLocations, activeDayPlan.day);
              if (response && !cancelled) {
                newDirectionsResponses.push({
                  day: activeDayPlan.day,
                  response
                });
                // Update directions while processing - improves perceived performance
                setDirectionsResponses(prev => {
                  // Always treat prev as an array
                  const prevArray = Array.isArray(prev) ? prev : [];
                  return [...prevArray, { day: activeDayPlan.day, response }];
                });
              }
            }
          }
        }
        
        // Process other days asynchronously
        if (!activeDay) {
          for (const day of daysToProcess) {
            // Skip if this is the active day (already processed)
            if (activeDay && day.day === activeDay) continue;
            
            // Skip if cancelled
            if (cancelled) break;
  
            // Get all locations for this day that have positions
            const dayLocations = locations.filter(
              loc => loc.day.includes(`Day ${day.day}`) && loc.position
            ).sort((a, b) => {
              const timeA = a.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
              const timeB = b.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
              return timeA.localeCompare(timeB);
            });
  
            if (dayLocations.length >= 2) {
              const response = await calculateRoutes(dayLocations, day.day);
              if (response && !cancelled) {
                // Use array-based approach consistently
                setDirectionsResponses(prev => {
                  // Always treat prev as an array
                  const prevArray = Array.isArray(prev) ? prev : [];
                  return [...prevArray, { day: day.day, response }];
                });
              }
              
              // Small delay to prevent API rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        if (!cancelled) {
          setIsLoadingDirections(false);
        }
      };
  
      calculateDailyRoutes();
      
      return () => {
        cancelled = true;
      };
    }
  }, [isLoaded, activeDay, tripPlan]);
  
  // 4. Add a timeout to dismiss the loading indicator even if routes take too long
  useEffect(() => {
    if (isLoadingDirections) {
      // Set a maximum waiting time for directions loading
      const timer = setTimeout(() => {
        setIsLoadingDirections(false);
        showToastMessage("Some routes may still be loading");
      }, 5000); // 5 seconds max wait
      
      return () => clearTimeout(timer);
    }
  }, [isLoadingDirections]);
  
  // Update this function to properly sort locations by time and handle daily routes
  const calculateDailyRoutes = async () => {
    if (!mapInstance || !isLoaded) {
      console.log("Map not ready for routes");
      return;
    }
    
    console.log("Calculating routes for day:", activeDay || "all days");
    setIsLoadingDirections(true);
    
    try {
      // Clear previous markers and routes
      clearRouteVisuals();
      
      // Create daily activities map directly from summaryOfDay
      const dailyActivitiesMap = createDailyActivitiesMap(tripPlan);
      
      // Determine which days to process
      const daysToProcess = activeDay 
        ? [parseInt(activeDay)]
        : [];  // Change this to empty array to avoid showing all days
      
      console.log("Processing days:", daysToProcess);
      
      // Process each day
      for (const dayNum of daysToProcess) {
        const activities = dailyActivitiesMap.get(dayNum) || [];
        
        console.log(`Day ${dayNum}: Processing ${activities.length} activities`);
        
        // Skip days with insufficient activities for routes
        if (activities.length < 2) {
          console.log(`Day ${dayNum}: Not enough activities for route calculation`);
          // Still add sequence labels if we have any activities
          if (activities.length === 1) {
            addSequenceLabels(activities, dayNum);
          }
          continue;
        }
        
        try {
          // Calculate route
          const directionsService = new google.maps.DirectionsService();
          const waypoints = activities.slice(1, -1).map(act => ({
            location: new google.maps.LatLng(act.position.lat, act.position.lng),
            stopover: true
          }));
          
          const result = await directionsService.route({
            origin: new google.maps.LatLng(
              activities[0].position.lat,
              activities[0].position.lng
            ),
            destination: new google.maps.LatLng(
              activities[activities.length - 1].position.lat,
              activities[activities.length - 1].position.lng
            ),
            waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false
          });
          
          setDirectionsResponses(prev => {
            // Always treat prev as an array
            const prevArray = Array.isArray(prev) ? prev : [];
            return [...prevArray, { day: dayNum, response: result }];
          });
        } catch (error) {
          console.error(`Error calculating route for day ${dayNum}:`, error);
          // Create fallback route if directions API fails
          createFallbackRoute(activities, dayNum);
        }
        
        // Add sequence labels for activities
        addSequenceLabels(activities, dayNum);
      }
    } catch (error) {
      console.error("Error in route calculation:", error);
    } finally {
      setIsLoadingDirections(false);
    }
  };

  const addSequenceLabels = (activities, dayNum) => {
    // First, clear existing markers for this specific day
    sequenceMarkers.forEach(item => {
      if (item.day === String(dayNum)) {
        if (item.marker) {
          item.marker.setMap(null);
        }
      }
    });
    
    // Filter out removed markers from state
    const remainingMarkers = sequenceMarkers.filter(item => item.day !== String(dayNum));
    
    // Get day number as a string
    const dayStr = String(dayNum);
    
    console.log(`Creating ${activities.length} numbered markers for Day ${dayStr}`);
    
    const newMarkers = [];
    
    // Track visited locations to handle multiple visits
    const visitedLocations = new Map();
    
    // Create markers using pre-calculated sequence numbers
    activities.forEach((activity) => {
      if (!mapInstance || !activity.position) return;
      
      // Use sequenceNum from the object
      const sequenceNumber = activity.sequenceNum;
      
      // Create a location key based on coordinates
      const locationKey = `${activity.position.lat.toFixed(5)},${activity.position.lng.toFixed(5)}`;
      
      // Track visit count and calculate offset for repeat visits
      let visitCount = visitedLocations.get(locationKey) || 0;
      visitCount++;
      visitedLocations.set(locationKey, visitCount);
      
      // Create offset for repeated visits (in a small circle pattern)
      let offsetPosition = { ...activity.position };
      
      // Apply offset for subsequent visits (2nd visit onwards)
      if (visitCount > 1) {
        const offsetDistance = 0.0001 * visitCount; // approx 10 meters per visit
        const offsetAngle = (visitCount - 1) * (Math.PI / 4); // 45 degree spacing
        
        offsetPosition = {
          lat: activity.position.lat + offsetDistance * Math.cos(offsetAngle),
          lng: activity.position.lng + offsetDistance * Math.sin(offsetAngle)
        };
      }
      
      // Create the numbered marker at possibly offset position
      const marker = new window.google.maps.Marker({
        position: offsetPosition,
        map: mapInstance,
        label: {
          text: `${sequenceNumber}`,
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColorByType(activity.type),
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#FFFFFF',
          scale: 10
        },
        zIndex: 1000 + sequenceNumber,
        title: `${sequenceNumber}. ${activity.name} (${activity.time})`
      });
      
      // Store reference to the marker with its day
      newMarkers.push({ 
        marker, 
        day: dayStr, 
        visitCount,
        locationKey
      });
    });
    
    // Update markers in state by adding new markers to remaining ones
    setSequenceMarkers([...remainingMarkers, ...newMarkers]);
    
    console.log(`Created ${newMarkers.length} sequence markers for Day ${dayStr}`);
  };

  // Helper function to get marker color by activity type
  const getMarkerColorByType = (type) => {
    switch (type) {
      case 'hotel':
        return '#06b6d4'; // cyan-500
      case 'restaurant':
        return '#f59e0b'; // amber-500
      case 'attraction':
        return '#ef4444'; // red-500
      case 'transport':
        return '#8b5cf6'; // violet-500
      case 'activity':
        return '#10b981'; // emerald-500
      default:
        return '#4f46e5'; // indigo-500
    }
  };
// Add this function for fallback routes when directions API fails
const createFallbackRoute = (locations, day) => {
  // Create a simple polyline connecting the points
  const path = locations.map(loc => loc.position);
  
  // Add to polylines state to be rendered
  setFallbackPolylines(prev => [
    ...prev,
    {
      day,
      path,
      options: {
        strokeColor: '#4f46e5',
        strokeOpacity: 0.7,
        strokeWeight: 4,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: '#4f46e5',
            fillOpacity: 0.9,
            strokeWeight: 1
          },
          repeat: '100px'
        }]
      }
    }
  ]);
  
  // Also add sequence labels
  addSequenceLabels(locations, day);
};

// Add this function to handle segmented routes for days with many stops
const createSegmentedRoute = async (locations, day) => {
  const MAX_SEGMENT_SIZE = 8;
  const segments = [];
  
  // Break locations into segments
  for (let i = 0; i < locations.length; i += MAX_SEGMENT_SIZE) {
    segments.push(locations.slice(i, i + MAX_SEGMENT_SIZE + 1));
  }
  
  // Process each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (segment.length >= 2) {
      const origin = segment[0].position;
      const destination = segment[segment.length - 1].position;
      const waypoints = segment.slice(1, -1).map(loc => ({
        location: new google.maps.LatLng(loc.position.lat, loc.position.lng),
        stopover: true
      }));
      
      try {
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        });
        
        // Fixed state update to ensure we're always working with an array
        setDirectionsResponses(prev => {
          const segmentId = `${day}-segment-${i}-${Date.now()}`;
          // Make sure prev is treated as an array
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, { day: segmentId, response: result }];
        });
      } catch (error) {
        console.error(`Error calculating route segment ${i} for day ${day}:`, error);
        createFallbackRoute(segment, `${day}-segment-${i}`);
      }
      
      // Small delay between segments
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Get the actual day number from the day parameter
  // If day is a segment ID like "3-segment-0", extract just the day number "3"
  const dayNumber = parseInt(String(day).split('-')[0]);
  
  // Important: Call addSequenceLabels with the correct day number
  // This ensures each day has its own sequence starting from 1
  addSequenceLabels(locations, dayNumber);
};
// Replace both activeDay useEffects with this single one
useEffect(() => {
  // Skip if map isn't loaded yet
  if (!isLoaded || !mapInstance || !tripPlan?.dailyPlan) return;
  
  // Clear existing renderers
  if (activeRenderers.current.length > 0) {
    activeRenderers.current.forEach(renderer => {
      if (renderer) {
        renderer.setMap(null);
      }
    });
    activeRenderers.current = [];
  }
  
  // Reset state
  setDirectionsResponses([]);
  setFallbackPolylines([]);
  
  // Wait for state updates to process
  setTimeout(() => {
    calculateDailyRoutes();
    
    // Get current day summaryOfDay data to set map bounds
    let activitiesForDay = [];
    
    if (activeDay) {
      // Get active day's activities
      const dayPlan = tripPlan.dailyPlan.find(day => day.day === activeDay);
      if (dayPlan?.summaryOfDay) {
        activitiesForDay = Object.entries(dayPlan.summaryOfDay)
          .filter(([_, data]) => data.location)
          .map(([time, data]) => ({
            position: {
              lat: parseFloat(data.location.latitude),
              lng: parseFloat(data.location.longitude)
            }
          }));
      }
    } else {
      // Get all days' activities
      tripPlan.dailyPlan.forEach(day => {
        if (day.summaryOfDay) {
          const dayActivities = Object.entries(day.summaryOfDay)
            .filter(([_, data]) => data.location)
            .map(([time, data]) => ({
              position: {
                lat: parseFloat(data.location.latitude),
                lng: parseFloat(data.location.longitude)
              }
            }));
          activitiesForDay = [...activitiesForDay, ...dayActivities];
        }
      });
    }
    
    // Set map bounds if we have activities
    if (activitiesForDay.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      activitiesForDay.forEach(act => bounds.extend(act.position));
      mapInstance.fitBounds(bounds);
    }
  }, 200);
  
}, [activeDay, isLoaded, mapInstance, tripPlan]);

// Add this effect to handle load errors
useEffect(() => {
  if (loadError) {
    console.error('Google Maps failed to load:', loadError);
    showToastMessage("Map service unavailable. Please refresh the page.");
  }
}, [loadError]);

useEffect(() => {
  return () => {
    // Clear all renderers when component unmounts
    if (activeRenderers.current.length > 0) {
      activeRenderers.current.forEach(renderer => {
        if (renderer) {
          renderer.setMap(null);
        }
      });
    }
  };
}, []);

// Add this useEffect to handle sequence marker visibility
useEffect(() => {
  // Hide all sequence markers that don't match the active day
  sequenceMarkers.forEach(item => {
    if (item.marker) {
      // Show marker only if it matches activeDay or if no day is selected
      const isVisibleDay = !activeDay || item.day === String(activeDay);
      item.marker.setVisible(isVisibleDay);
    }
  });
}, [activeDay, sequenceMarkers]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200 flex justify-between items-center transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900 tracking-wide">
                  {tripPlan?.tripDetails?.destination || "Trip Map"}
                </h3>
                {activeDay && (
                  <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-md shadow-sm transition">
                    Day {activeDay}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareMap}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors duration-300 shadow-sm hover:shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
                {/* Capture Map Button */}
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={captureMap}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors duration-300 shadow-sm hover:shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
                {/* Toggle Map Type Button */}
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMapType}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors duration-300 shadow-sm hover:shadow-lg"
                >
                  <Layers className="w-4 h-4" />
                </motion.button>
                {/* Toggle Itinerary Button */}
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowItinerary(!showItinerary)}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors duration-300 shadow-sm hover:shadow-lg"
                >
                  {showItinerary ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors duration-300 shadow-sm hover:shadow-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Day Selector */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-1.5 transition-all duration-300 border border-gray-100"
              >
                {tripPlan?.dailyPlan?.map((day) => (
                  <motion.button
                    key={day.day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDaySelect(day.day)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium mx-1 transition-all duration-300 
                      ${activeDay === day.day 
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' 
                        : 'hover:bg-indigo-50 text-indigo-700'}`}
                  >
                    Day {day.day}
                  </motion.button>
                ))}
                {activeDay && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDaySelect(1)}
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 ml-2 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200"
                  >
                    Reset
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Map Controls */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col space-y-3">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg py-2 px-1 flex flex-col gap-1.5 transition-all duration-300 border border-gray-100"
              >
                <motion.button
                  whileHover={{ scale: 1.07, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95, backgroundColor: "#e5e7eb" }}
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 10) + 1)}
                  className="p-2.5 rounded-full text-indigo-600 transition-all duration-300 hover:shadow-sm flex items-center justify-center"
                  title="Zoom in"
                >
                  <ZoomIn className="w-[18px] h-[18px]" />
                </motion.button>
                <div className="w-8 h-px bg-gray-100 mx-auto"></div>
                <motion.button
                  whileHover={{ scale: 1.07, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95, backgroundColor: "#e5e7eb" }}
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 10) - 1)}
                  className="p-2.5 rounded-full text-indigo-600 transition-all duration-300 hover:shadow-sm flex items-center justify-center"
                  title="Zoom out"
                >
                  <ZoomOut className="w-[18px] h-[18px]" />
                </motion.button>
                <div className="w-8 h-px bg-gray-100 mx-auto"></div>
                {/* Your current location button goes here */}
              </motion.div>
            </div>

            {/* Filter Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-20 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-100"
            >
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-100 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-medium text-indigo-800 tracking-wide">Filter Locations</span>
              </div>
              <div className="flex flex-col p-2.5 space-y-1.5">
                {['all', 'attraction', 'hotel', 'restaurant', 'activity'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`text-xs py-2 px-3.5 rounded-md transition-all duration-300 
                      ${
                        filterType === type 
                          ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 font-medium shadow-sm'
                          : 'hover:bg-gray-100 text-gray-700 hover:text-indigo-700'
                      }`}
                  >
                    {type === 'all' ? 'All Locations' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 px-5 py-3 bg-gray-900/90 text-white text-sm rounded-full shadow-xl tracking-wide backdrop-blur-sm border border-gray-800/50 flex items-center space-x-2"
                >
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map Container */}
            <div className="w-full h-full">
              {!isLoaded || !mapCenter ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 transition-colors duration-300">
                  <Loader className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                  <p className="text-indigo-700 font-medium">Loading map service...</p>
                  <p className="text-xs text-indigo-600 mt-1">This may take a moment on first load</p>
                  {loadError && (
                    <div className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg max-w-xs text-center shadow">
                      Failed to load map. Please refresh the page or check your internet connection.
                    </div>
                  )}
                  {geocodingProgress > 0 && geocodingProgress < 100 && (
                    <div className="mt-4 w-64">
                      <div className="text-sm text-indigo-600 mb-2 text-center">
                        Geocoding locations: {Math.round(geocodingProgress)}%
                      </div>
                      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${geocodingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <GoogleMap
                  ref={mapRef}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={10}
                  mapTypeId={mapType}
                  options={{
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: true,
                    zoomControl: false,
                    styles: [
                      {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [
                          { color: "#e9e9e9" },
                          { lightness: 17 }
                        ]
                      },
                      {
                        featureType: "landscape",
                        elementType: "geometry",
                        stylers: [
                          { color: "#f5f5f5" },
                          { lightness: 20 }
                        ]
                      },
                      {
                        featureType: "road.highway",
                        elementType: "geometry.fill",
                        stylers: [
                          { color: "#ffffff" },
                          { lightness: 17 }
                        ]
                      },
                      {
                        featureType: "poi",
                        elementType: "geometry",
                        stylers: [
                          { color: "#f5f5f5" },
                          { lightness: 21 }
                        ]
                      },
                    ],
                  }}
                  onLoad={onMapLoad}
                >
                  <MarkerClusterer
                    options={{
                      gridSize: 50,
                      minimumClusterSize: 3,
                      styles: [
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-1.png',
                          height: 35,
                          width: 35,
                        },
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-2.png',
                          height: 40,
                          width: 40,
                        },
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-3.png',
                          height: 45,
                          width: 45,
                        },
                      ],
                    }}
                  >
                    {(clusterer) => 
                      filteredLocations.map((location, index) => (
                        location.position && (
                          <Marker
                            key={`${location.name}-${index}`}
                            position={location.position}
                            title={location.name}
                            icon={getMarkerIcon(location.type)}
                            onClick={() => setSelectedLocation(location)}
                            animation={selectedLocation === location ? window.google.maps.Animation.BOUNCE : null}
                            label={{
                              text: location.name,
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: '500',
                              className: `marker-label ${selectedLocation === location ? 'visible' : ''}`
                            }}
                            onMouseOver={() => {
                              setSelectedLocation(location);
                              if (mapInstance) {
                                mapInstance.panTo(location.position);
                              }
                            }}
                            clusterer={clusterer}
                          />
                        )
                      ))
                    }
                  </MarkerClusterer>

                  {/* Selected Location InfoWindow */}
                  {selectedLocation && selectedLocation.position && (
                    <InfoWindow
                      position={selectedLocation.position}
                      onCloseClick={() => setSelectedLocation(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <h4 className="font-semibold text-gray-900">{selectedLocation.name}</h4>
                        {selectedLocation.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedLocation.description}
                          </p>
                        )}
                        {selectedLocation.day && (
                          <div className="mt-2 text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full inline-block">
                            {selectedLocation.day}
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}

                  {/* Itinerary Panel */}
                  {showItinerary && !isCapturing && (
                    <ItineraryPanel
                      locations={filteredLocations.sort((a, b) => {
                        // ...existing logic...
                      })}
                      onSelectLocation={(location) => {
                        setSelectedLocation(location);
                        if (location.position && mapInstance) {
                          mapInstance.panTo(location.position);
                          mapInstance.setZoom(15);
                        }
                      }}
                      tripPlan={tripPlan}
                      activeDay={activeDay}
                    />
                  )}

                  {/* Directions */}
                  {Array.isArray(directionsResponses) && directionsResponses
                    .filter(({ day }) => !activeDay ||
                      day === activeDay ||
                      (activeDay && String(day).startsWith(`${activeDay}-segment-`)))
                    .map(({ day, response }, index) => (
                      <DirectionsRenderer
                        key={`dir-${day}-${index}-${Date.now()}`}
                        options={{
                          directions: response,
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: ['#4f46e5','#7c3aed','#a855f7','#ec4899','#f43f5e'][index % 5],
                            strokeOpacity: 0.7,
                            strokeWeight: 4
                          }
                        }}
                        onLoad={(renderer) => {
                          activeRenderers.current.push(renderer);
                        }}
                      />
                    ))
                  }

                  {/* Fallback Polylines */}
                  {fallbackPolylines.map((polyline, index) => (
                    <Polyline
                      key={`fallback-${polyline.day}-${index}`}
                      path={polyline.path}
                      options={polyline.options}
                    />
                  ))}
                </GoogleMap>
              )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 transition-all duration-300">
              <div className="text-xs font-semibold mb-2 text-gray-700 tracking-wide">Trip Locations</div>
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Attractions</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Hotels</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span>Restaurants</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Activities</span>
                </div>
              </div>
            </div>

            {/* Trip Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-indigo-100 p-4 flex items-center space-x-6 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Route className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Total Distance</div>
                  <div className="text-sm font-bold text-gray-900">~ {tripStats.totalKm} km</div>
                </div>
              </div>
              
              <div className="h-10 w-px bg-indigo-100"></div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Locations</div>
                  <div className="text-sm font-bold text-gray-900">{tripStats.locations}</div>
                </div>
              </div>
              
              <div className="h-10 w-px bg-indigo-100"></div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Duration</div>
                  <div className="text-sm font-bold text-gray-900">
                    {tripPlan?.tripDetails?.duration?.days || 0} Days
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Loading Directions */}
            {isLoadingDirections && (
              <div className="absolute top-20 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2 transition-all duration-300">
                <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-indigo-600">Calculating routes...</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

