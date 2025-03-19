import { DirectionsRenderer, GoogleMap, Marker, MarkerClusterer, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Filter, Layers, Loader, MapPin, Route, Star, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
      locationImage: hotel.imageUrl || null,
      rating: hotel.rating || null,
      locationDescription: hotel.description || null,
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
      locationImage: attraction.imageUrl || null,
      rating: attraction.rating || null,
      locationDescription: attraction.details || null,
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
          position: activity["activity location coordinates"] ? {
            lat: parseFloat(activity["activity location coordinates"].latitude),
            lng: parseFloat(activity["activity location coordinates"].longitude)
          } : null,
          locationImage: activity.locationImage || null,
          rating: activity.rating || null,
          locationDescription: activity.locationDescription || null,
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
        position: meal["coordinates of restaurant"] ? {
          lat: parseFloat(meal["coordinates of restaurant"].latitude),
          lng: parseFloat(meal["coordinates of restaurant"].longitude)
        } : null,
        locationImage: meal.imageUrl || null,
        rating: meal.rating || null,
        locationDescription: meal.mealType + " - " + meal.cuisineType?.join(', '),
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
    
    // Find matching activity objects with full details
    const activityDetailsByTime = {};
    
    // Index activities by time for quick lookup
    if (dayPlan.activities) {
      dayPlan.activities.forEach(activity => {
        activityDetailsByTime[activity.time] = activity;
      });
    }
    
    // Index meals by time
    if (dayPlan.meals) {
      dayPlan.meals.forEach(meal => {
        activityDetailsByTime[meal.time] = {
          activity: `${meal.mealType} at ${meal.restaurant}`,
          location: meal.location,
          locationImage: meal.imageUrl,
          rating: meal.rating,
          locationDescription: `${meal.mealType} - ${meal.cuisineType?.join(', ')}`,
          type: 'restaurant'
        };
      });
    }
    
    // Convert summaryOfDay object to array of activities
    const activities = Object.entries(dayPlan.summaryOfDay).map(([time, data]) => {
      // Validate each entry
      if (!data || !data.activity || !data.location) {
        console.warn(`Invalid data for time ${time} on day ${dayNum}`);
        return null;
      }
      
      // Get the full activity details if available
      const activityDetails = activityDetailsByTime[time] || {};
      
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
        sequenceNum: 0, // Will be set after sorting
        locationImage: activityDetails.locationImage || null,
        rating: activityDetails.rating || null,
        locationDescription: activityDetails.locationDescription || null
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

// Define a custom overlay class that extends OverlayView - but only when Google Maps is loaded
const createInfoWindowOverlay = () => {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps API not loaded yet");
    return null;
  }

  return class InfoWindowOverlay extends window.google.maps.OverlayView {
    constructor(position, content) {
      super();
      this.position = position;
      this.content = content;
      this.div = null;
    }

    // Safely set the map with error handling
    setMap(map) {
      try {
        super.setMap(map);
      } catch (error) {
        console.error("Error in InfoWindowOverlay.setMap:", error);
      }
    }

    // Add method to update content
    updateContent(newContent) {
      if (!this.div) return;
      this.content = newContent;
      
      // If the old content has a child node, remove it
      while (this.div.firstChild) {
        this.div.removeChild(this.div.firstChild);
      }
      
      // If newContent is a DOM element
      if (newContent instanceof Element) {
        this.div.appendChild(newContent);
      } else {
        // If it's a string
        this.div.innerHTML = newContent;
      }
    }

    // Add method to update position
    updatePosition(newPosition) {
      this.position = newPosition;
      if (this.div) {
        this.draw();
      }
    }

    // Safely add the overlay to the map
    onAdd() {
      // Create the div and set its style
      this.div = document.createElement('div');
      this.div.style.position = 'absolute';
      this.div.style.zIndex = '1000';
      
      // Add content
      if (this.content instanceof Element) {
        this.div.appendChild(this.content);
      } else {
        this.div.innerHTML = this.content;
      }

      // Add the div to the overlay pane
      const panes = this.getPanes();
      if (panes) {
        panes.floatPane.appendChild(this.div);
      } else {
        console.error('Could not access map panes');
      }
    }

    // Draw the overlay
    draw() {
      // Get the projection
      const overlayProjection = this.getProjection();
      if (!overlayProjection) {
        console.error('Could not get map projection');
        return;
      }

      // Convert lat/lng to pixel coordinates
      const pixel = overlayProjection.fromLatLngToDivPixel(this.position);
      if (!pixel) {
        console.error('Could not convert coordinates to pixels');
        return;
      }

      // Position the div
      this.div.style.left = `${pixel.x}px`;
      this.div.style.top = `${pixel.y - 140}px`;
      this.div.style.transform = 'translate(-50%, 0)';
    }

    // Remove the overlay
    onRemove() {
      if (this.div) {
        if (this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
        this.div = null;
      }
    }
  };
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
  const [directionsResponses, setDirectionsResponses] = useState([]);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [routeCache, setRouteCache] = useState({});
  const [sequenceMarkers, setSequenceMarkers] = useState([]);
  const [fallbackPolylines, setFallbackPolylines] = useState([]);
  const [locationPhoto, setLocationPhoto] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const totalLocationsToGeocode = useRef(0);
  const directionsRendererRef = useRef(null);
  const activeRenderers = useRef([]);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);
  const infoWindowOverlayRef = useRef(null);
  const [InfoWindowOverlayClass, setInfoWindowOverlayClass] = useState(null);

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

  // Create a specialized version for geocoding summary locations with address strings
  const geocodeAddressString = async (locationName, destination) => {
    if (!window.google?.maps?.Geocoder) {
      console.error("Google Maps Geocoder not loaded");
      return null;
    }

    const geocoder = new window.google.maps.Geocoder();

    try {
      const { results } = await geocoder.geocode({
        address: `${locationName}, ${destination}`
      });

      if (results && results[0]) {
        return {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
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
  
  if (!tripPlan || !tripPlan.dailyPlan) return allLocations;
  
  tripPlan.dailyPlan.forEach(day => {
    if (!day.summaryOfDay) return;
    
    // Create lookup maps for activities and meals
    const activityByTime = {};
    const mealByTime = {};
    
    // Index activities by time
    if (day.activities) {
      day.activities.forEach(activity => {
        activityByTime[activity.time] = activity;
      });
    }
    
    // Index meals by time
    if (day.meals) {
      day.meals.forEach(meal => {
        mealByTime[meal.time] = meal;
      });
    }
    
    Object.entries(day.summaryOfDay).forEach(([time, data]) => {
      if (!data || !data.activity || !data.location) return;
      
      // Find matching detailed activity or meal
      const matchingActivity = activityByTime[time];
      const matchingMeal = mealByTime[time];
      const details = matchingActivity || matchingMeal;
      
      // Create location entry with placeholder position if JSON coordinates are not available
      const locationEntry = {
        name: data.activity,
        description: `${time} - ${data.activity}`,
        // Check if location has valid coordinates in the JSON
        position: (data.location?.latitude && data.location?.longitude) ? {
          lat: parseFloat(data.location.latitude),
          lng: parseFloat(data.location.longitude)
        } : null, // Will be filled by geocoding if null
        day: `Day ${day.day} - ${day.date || ''}`,
        time,
        type: determineActivityType(data.activity),
        locationImage: details?.locationImage || details?.imageUrl || null,
        rating: details?.rating || null,
        locationDescription: details?.locationDescription || null,
        address: details?.address || (typeof data.location === 'string' ? data.location : null),
        locationName: typeof data.location === 'string' ? data.location : 
                      data.location?.name || data.activity
      };
      
      // Add to allLocations array
      allLocations.push(locationEntry);
    });
  });
  
  return allLocations;
};

// Get all locations
const locations = computeLocationsFromSummary();

// Schedule geocoding for all locations without coordinates
useEffect(() => {
  if (!isLoaded || !isOpen || !tripPlan) return;
  
  const locationsToGeocode = locations.filter(loc => !loc.position);
  if (locationsToGeocode.length === 0) return;

  setGeocodingProgress(0);
  totalLocationsToGeocode.current = locationsToGeocode.length;
  
  const geocodeAllLocations = async () => {
    // Process locations in batches to avoid rate limiting
    const batchSize = 5;
    let processedCount = 0;
    
    // Process each location in batches
    for (let i = 0; i < locationsToGeocode.length; i += batchSize) {
      const batch = locationsToGeocode.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (location) => {
          try {
            const coords = await geocodeAddressString(
              location.locationName || location.address || location.name,
              tripPlan?.tripDetails?.destination
            );
            
            if (coords) {
              // Update the location in-place
              location.position = coords;
            }
          } catch (error) {
            console.error(`Failed to geocode ${location.locationName}:`, error);
          }
          
          // Update progress
          processedCount++;
          setGeocodingProgress((processedCount / totalLocationsToGeocode.current) * 100);
        })
      );
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < locationsToGeocode.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };
  
  geocodeAllLocations();
  
}, [isLoaded, isOpen, tripPlan, locations]);

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
    console.log("Clearing route visuals...");

    // Clear all sequence markers from the map
    sequenceMarkers.forEach(item => {
        if (item.marker) {
            console.log("Removing sequence marker from map:", item.marker);
            item.marker.setMap(null);
        }
    });
    
    // Reset sequence markers array
    setSequenceMarkers([]);
    
    // Clear all directions responses
    console.log("Clearing directions responses...");
    setDirectionsResponses([]);
    
    // Clear fallback polylines
    fallbackPolylines.forEach(polyline => {
        console.log("Removing fallback polyline from map:", polyline);
        polyline.setMap(null); // Ensure each polyline is removed from the map
    });
    
    console.log("Clearing fallback polylines state...");
    setFallbackPolylines([]); // Clear the state
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
    
    // Step 4: Store current location
    const currentLocation = selectedLocation;
    
    // Step 5: Update active day
    setActiveDay(day);
    
    // Step 6: Toast
    showToastMessage(`Showing Day ${day} locations`);
    
    // Step 7: Calculate routes for the new day
    setTimeout(() => {
      calculateDailyRoutes();
      
      // Step 8: Update infoWindow if needed
      if (currentLocation && infoWindowOverlayRef.current) {
        setTimeout(() => {
          updateInfoWindowOverlay();
        }, 500);
      }
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
    console.log("Calculating daily routes...");

    if (!mapInstance || !isLoaded || isResetting) {
        console.log("Map not ready for routes or reset in progress");
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
                
                console.log(`Route calculated for day ${dayNum}:`, result);
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
    } else if (!isResetting) { // Only fit all location bounds if NOT resetting
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
    if (activitiesForDay.length > 0 && !isResetting) { // Don't adjust bounds during reset
      const bounds = new window.google.maps.LatLngBounds();
      activitiesForDay.forEach(act => bounds.extend(act.position));
      mapInstance.fitBounds(bounds);
    }
  }, 200);
  
}, [activeDay, isLoaded, mapInstance, tripPlan, isResetting]); // Add isResetting to the dependency array

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

// Add this function to fetch place photos and construct them in the same format as used in DayPlan
const fetchPlacePhoto = (location) => {
  setIsLoadingPhoto(true);
  setLocationPhoto(null);
  
  if (!placesServiceRef.current && mapInstance) {
    placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance);
  }
  
  if (!placesServiceRef.current) {
    console.error("Places service not available");
    setIsLoadingPhoto(false);
    return;
  }
  
  // Ensure location has all required properties to avoid errors
  if (!location || !location.name) {
    console.error("Invalid location object provided to fetchPlacePhoto");
    setIsLoadingPhoto(false);
    return;
  }
  
  // Ensure location.type exists, default to 'location' if not
  const locationType = location.type || 'location';
  
  // Create a search query based on the location name and position
  const request = {
    query: `${location.name} ${tripPlan?.tripDetails?.destination || ''}`,
    fields: ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry'],
    locationBias: location.position ? 
      new window.google.maps.LatLng(location.position.lat, location.position.lng) : 
      undefined
  };
  
  try {
    placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]?.photos && results[0].photos.length > 0) {
        const photoUrl = results[0].photos[0].getUrl({maxWidth: 400, maxHeight: 300});
        
        // Format the location data to match the activity structure in DayPlan
        const formattedLocation = {
          locationImage: photoUrl,
          address: results[0].formatted_address,
          rating: results[0].rating,
          isOpen: results[0]?.opening_hours?.isOpen ? results[0].opening_hours.isOpen() : null,
          features: [
            locationType === 'hotel' ? 'Accommodation' : 
            locationType === 'restaurant' ? 'Restaurant' : 
            locationType === 'attraction' ? 'Attraction' : 
            locationType.charAt(0).toUpperCase() + locationType.slice(1)
          ],
          // Additional properties that might be useful
          country: tripPlan?.tripDetails?.destination,
          name: location.name,
          locationDescription: location.description
        };
        
        setLocationPhoto(formattedLocation);
      } else {
        // Use backup method with nearbySearch if the first method fails
        const nearbyRequest = {
          location: location.position,
          radius: 100,
          keyword: location.name
        };
        
        placesServiceRef.current.nearbySearch(nearbyRequest, (nearbyResults, nearbyStatus) => {
          if (nearbyStatus === window.google.maps.places.PlacesServiceStatus.OK && 
              nearbyResults && nearbyResults[0]?.photos && nearbyResults[0].photos.length > 0) {
            const photoUrl = nearbyResults[0].photos[0].getUrl({maxWidth: 400, maxHeight: 300});
            
            // Format the location data to match the activity structure in DayPlan
            const formattedLocation = {
              locationImage: photoUrl,
              address: nearbyResults[0].vicinity,
              rating: nearbyResults[0].rating,
              isOpen: nearbyResults[0]?.opening_hours?.open_now,
              features: [
                locationType === 'hotel' ? 'Accommodation' : 
                locationType === 'restaurant' ? 'Restaurant' : 
                locationType === 'attraction' ? 'Attraction' : 
                locationType.charAt(0).toUpperCase() + locationType.slice(1)
              ],
              // Additional properties 
              country: tripPlan?.tripDetails?.destination,
              name: location.name,
              locationDescription: location.description
            };
            
            setLocationPhoto(formattedLocation);
          } else {
            // If all else fails, create a minimal formatted location
            const formattedLocation = {
              locationImage: null,
              address: location.description,
              features: [
                locationType === 'hotel' ? 'Accommodation' : 
                locationType === 'restaurant' ? 'Restaurant' : 
                locationType === 'attraction' ? 'Attraction' : 
                locationType.charAt(0).toUpperCase() + locationType.slice(1)
              ],
              country: tripPlan?.tripDetails?.destination,
              name: location.name,
              locationDescription: location.description
            };
            setLocationPhoto(formattedLocation);
          }
          setIsLoadingPhoto(false);
        });
      }
      setIsLoadingPhoto(false);
    });
  } catch (error) {
    console.error("Error fetching place photo:", error);
    setIsLoadingPhoto(false);
  }
};

  // Function to close the info window and reset state
const closeInfoWindow = useCallback(() => {
  try {
    if (infoWindowOverlayRef.current) {
      // Don't check for isValid property since it doesn't exist
      // Just check if setMap is a function
      if (typeof infoWindowOverlayRef.current.setMap === 'function') {
        infoWindowOverlayRef.current.setMap(null);
      } else {
        console.warn('InfoWindowOverlay does not have setMap method');
      }
      infoWindowOverlayRef.current = null;
    }
    setSelectedLocation(null);
    setLocationPhoto(null);
  } catch (error) {
    console.error('Error closing info window:', error);
    infoWindowOverlayRef.current = null;
    setSelectedLocation(null);
    setLocationPhoto(null);
  }
}, []);
  
  // Add the handleMarkerClick function
  const handleMarkerClick = (location) => {
    // Reset any existing selection
    closeInfoWindow();
    
    // Small delay to ensure previous data is cleared
    setTimeout(() => {
      setSelectedLocation(location);
      
      if (location.position && mapInstance) {
        // Pan to the location with animation
        mapInstance.panTo(location.position);
        
        // Wait for the map to finish panning before adjusting zoom
        setTimeout(() => {
          // Adjust zoom level to better see the location
          mapInstance.setZoom(15);
          
          // If we already have locationImage, rating, etc. from the JSON data
          // create a formatted location object directly
          if (location.locationImage) {
            const formattedLocation = {
              locationImage: location.locationImage,
              address: location.originalLocation || location.description,
              rating: location.rating,
              isOpen: null, // We don't have this info in the JSON data
              features: [
                location.type === 'hotel' ? 'Accommodation' : 
                location.type === 'restaurant' ? 'Restaurant' : 
                location.type === 'attraction' ? 'Attraction' : 
                location.type.charAt(0).toUpperCase() + location.type.slice(1)
              ],
              country: tripPlan?.tripDetails?.destination,
              name: location.name,
              locationDescription: location.locationDescription || location.description
            };
            setLocationPhoto(formattedLocation);
          } else {
            // If we don't have the image data, fetch it from Google Places API
            fetchPlacePhoto(location);
          }
        }, 300); // Add a delay to wait for the map to finish panning
      }
    }, 10);
  };

  // Create a function to update or create the info window overlay
  const updateInfoWindowOverlay = useCallback(() => {
    // Safety checks with better logging
    if (!InfoWindowOverlayClass) {
      console.error('Cannot create InfoWindow: InfoWindowOverlayClass is not defined');
      return;
    }
    
    if (!window.google?.maps) {
      console.error('Cannot create InfoWindow: Google Maps API not loaded');
      return;
    }
    
    if (!mapInstance) {
      console.error('Cannot create InfoWindow: Map instance not available');
      return;
    }
    
    if (!selectedLocation?.position) {
      console.error('Cannot create InfoWindow: Selected location has no position');
      return;
    }
    
    // Create the overlay content
    const content = document.createElement('div');
    content.className = "info-window-content pointer-events-auto";
    
    // Add close handler directly to content using data attribute
    content.dataset.closeHandler = 'true';
    
    // Add card content
    content.innerHTML = `
      <div class="relative">
        <div class="rounded-md overflow-hidden w-[240px] shadow-xl bg-white">
          <!-- Image section -->
          <div class="relative w-full h-28 bg-gray-100">
            ${isLoadingPhoto 
              ? '<div class="w-full h-full flex items-center justify-center"><div class="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div></div>' 
              : (locationPhoto?.locationImage || selectedLocation.locationImage) 
                ? `<img src="${locationPhoto?.locationImage || selectedLocation.locationImage}" alt="${selectedLocation.name}" class="w-full h-full object-cover"/>` 
                : '<div class="w-full h-full flex items-center justify-center bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>'
            }
            
            <!-- Type badge overlay -->
            <div class="absolute top-2 left-2">
              <span class="px-1.5 py-0.5 bg-white text-[10px] font-medium text-gray-700 rounded shadow-sm">
                ${selectedLocation?.type 
                  ? selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1) 
                  : 'Location'}
              </span>
            </div>
            
            <!-- Close button -->
            <button id="close-info-window" class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <!-- Info section -->
          <div class="px-3 py-2">
            <!-- Title and Day badge -->
            <div class="flex items-start justify-between">
              <h5 class="font-medium text-sm text-gray-900 leading-tight mr-1">${selectedLocation.name}</h5>
              ${selectedLocation.day 
                ? `<span class="shrink-0 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] rounded-sm mt-0.5">
                    ${selectedLocation.day.replace('Day ', 'D')}
                   </span>` 
                : ''}
            </div>
            
            <!-- Address -->
            <div class="flex mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 mt-0.5 mr-1 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <p class="text-[11px] text-gray-500 leading-tight">
                ${locationPhoto?.address || selectedLocation.originalLocation || selectedLocation.description || selectedLocation.name}
              </p>
            </div>
            
            <!-- Bottom row with ratings and status -->
            <div class="flex items-center justify-between mt-1.5">
              <!-- Ratings -->
              ${(locationPhoto?.rating || selectedLocation.rating) 
                ? `<div class="flex items-center">
                    ${Array(5).fill().map((_, i) => 
                      `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="${i < Math.floor(locationPhoto?.rating || selectedLocation.rating) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${i < Math.floor(locationPhoto?.rating || selectedLocation.rating) ? 'text-amber-400' : 'text-gray-200'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
                    ).join('')}
                    <span class="text-[9px] text-gray-600 ml-1">
                      ${parseFloat(locationPhoto?.rating || selectedLocation.rating).toFixed(1)}
                    </span>
                  </div>` 
                : '<div></div>'
              }
              
              <!-- Status indicator -->
              ${locationPhoto?.isOpen !== null && locationPhoto?.isOpen !== undefined 
                ? `<span class="text-[9px] font-medium ${locationPhoto.isOpen ? 'text-green-600' : 'text-red-600'}">
                    ${locationPhoto.isOpen ? '• Open now' : '• Closed'}
                   </span>`
                : ''
              }
            </div>
          </div>
        </div>
        
        <!-- Arrow pointer -->
        <div class="absolute left-1/2 bottom-[-8px] transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white shadow"></div>
      </div>
    `;
    
    // Add the click listener directly on the content element to handle delegation
    content.addEventListener('click', (e) => {
      // Find any close button clicked
      if (e.target.closest('#close-info-window')) {
        closeInfoWindow();
      }
    });
    
    // Create the position
    const position = new window.google.maps.LatLng(
      selectedLocation.position.lat,
      selectedLocation.position.lng
    );
    
    // Create or update the overlay with a slight delay to ensure map is settled
    setTimeout(() => {
      try {
        if (infoWindowOverlayRef.current) {
          infoWindowOverlayRef.current.updateContent(content);
          infoWindowOverlayRef.current.updatePosition(position);
          
          // Ensure the map is centered on the location if needed
          const currentCenter = mapInstance.getCenter();
          const markerPos = new google.maps.LatLng(
            selectedLocation.position.lat,
            selectedLocation.position.lng
          );
          
          // If marker is far from center, pan to it
          if (google.maps.geometry.spherical.computeDistanceBetween(currentCenter, markerPos) > 1000) {
            mapInstance.panTo(markerPos);
          }
        } else {
          // Add defensive check - verify InfoWindowOverlayClass is a constructor function
          if (typeof InfoWindowOverlayClass !== 'function') {
            console.error('InfoWindowOverlayClass is not a constructor function:', InfoWindowOverlayClass);
            return;
          }
          
          // Create new instance with the new keyword
          infoWindowOverlayRef.current = new InfoWindowOverlayClass(position, content);
          infoWindowOverlayRef.current.setMap(mapInstance);
        }
      } catch (error) {
        console.error('Error creating/updating InfoWindow overlay:', error);
      }
    }, 100); // Increased delay for better reliability
  }, [mapInstance, selectedLocation, locationPhoto, isLoadingPhoto, closeInfoWindow, InfoWindowOverlayClass]);

  // Effect to update the info window when selectedLocation or locationPhoto changes
  useEffect(() => {
    if (selectedLocation && mapInstance) {
      updateInfoWindowOverlay();
    }
  }, [selectedLocation, locationPhoto, isLoadingPhoto, updateInfoWindowOverlay]);

  // Effect to update the info window when the map moves
  useEffect(() => {
    if (mapInstance && selectedLocation) {
      const listener = mapInstance.addListener('idle', updateInfoWindowOverlay);
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [mapInstance, selectedLocation, updateInfoWindowOverlay]);

  // Clean up overlay on component unmount
  useEffect(() => {
    return () => {
      if (infoWindowOverlayRef.current) {
        infoWindowOverlayRef.current.setMap(null);
      }
    };
  }, []);

  // Implement handleReset function to clear directions and deselect day
  const handleReset = () => {
    console.log("Resetting map to initial state...");
    
    // Set resetting flag to block any route calculations
    setIsResetting(true);

    // Clear all renderers
    activeRenderers.current.forEach(renderer => {
        if (renderer) {
            console.log("Removing renderer from map:", renderer);
            renderer.setMap(null);
        }
    });
    activeRenderers.current = [];
    
    // Clear all route visuals
    clearRouteVisuals();
    
    // Reset active day selection
    console.log("Resetting active day selection...");
    setActiveDay(null);
    
    // Clear directions responses to remove route lines
    console.log("Clearing directions responses...");
    setDirectionsResponses([]);
    
    // Clear fallback polylines
    console.log("Clearing fallback polylines...");
    setFallbackPolylines([]);
    
    // Reset other states
    console.log("Resetting other states...");
    setGeocodedLocations(locations.filter(loc => loc.position));
    setSelectedLocation(null);
    
    // Show toast message
    showToastMessage("Map reset - showing all locations");
    
    // Extend the reset duration to ensure all state updates have settled
    setTimeout(() => {
        setIsResetting(false);
    }, 2000); // Increased from 1000 to 2000ms for more safety
};

// Add this effect to initialize the InfoWindowOverlayClass when Google Maps loads
useEffect(() => {
  if (isLoaded && window.google?.maps) {
    try {
      const OverlayClass = createInfoWindowOverlay();
      console.log("Created InfoWindowOverlay class:", !!OverlayClass);
      setInfoWindowOverlayClass(() => OverlayClass); // Use function form for setting state
    } catch (error) {
      console.error("Error creating InfoWindowOverlay class:", error);
    }
  }
}, [isLoaded]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
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
                    onClick={handleReset}
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
              className="absolute bottom-20 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 border border-gray-100"
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
                        location.position ? (
                          <Marker
                            key={`${location.name}-${index}`}
                            position={location.position}
                            title={location.name}
                            icon={getMarkerIcon(location.type)}
                            onClick={() => handleMarkerClick(location)}
                            animation={selectedLocation === location ? window.google.maps.Animation.BOUNCE : null}
                            label={{
                              text: location.name,
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: '500',
                              className: `marker-label ${selectedLocation === location ? 'visible' : ''}`
                            }}
                            clusterer={clusterer}
                          />
                        ) : (
                          // For locations being geocoded, show a loading indicator or placeholder
                          geocodingProgress < 100 && (
                            <div key={`loading-${location.name}-${index}`} className="hidden">
                              {/* This div is hidden but helps track locations awaiting geocoding */}
                            </div>
                          )
                        )
                      ))
                    }
                  </MarkerClusterer>

                  {/* Geocoding Status Indicator */}
                  {geocodingProgress > 0 && geocodingProgress < 100 && (
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-50 flex items-center space-x-2">
                      <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-xs font-medium text-gray-700">
                        Geocoding locations: {Math.round(geocodingProgress)}%
                      </span>
                    </div>
                  )}

                  {/* Selected Location Custom InfoWindow */}
                  {selectedLocation && selectedLocation.position && (
                    <div 
                      className="custom-info-window-overlay absolute pointer-events-none z-[9999]"
                      style={{
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 9999
                      }}
                    >
                      <div 
                        className="absolute z-40 pointer-events-auto"
                        style={{
                          position: 'absolute',
                          left: `${selectedLocation.position.x}px`, 
                          top: `${selectedLocation.position.y}px`,
                          transform: 'translate(-50%, -120%)' // Position above the marker
                        }}
                      >
                        {/* Card content */}
                        <div className="relative">
                          <div className="rounded-md z-[9999] w-[240px] shadow-md bg-white">
                            {/* Image section */}
                            <div className="relative w-full h-28 bg-gray-100">
                              {isLoadingPhoto ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                                </div>
                              ) : (locationPhoto?.locationImage || selectedLocation.locationImage) ? (
                                <img 
                                  src={locationPhoto?.locationImage || selectedLocation.locationImage} 
                                  alt={selectedLocation.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                  <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Type badge overlay */}
                              <div className="absolute top-2 left-2">
                                <span className="px-1.5 py-0.5 bg-white text-[10px] font-medium text-gray-700 rounded shadow-sm">
                                  {selectedLocation && selectedLocation.type ? 
                                    selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1) : 
                                    'Location'}
                                </span>
                              </div>
                              
                              {/* Close button */}
                              <button
                                onClick={() => {
                                  closeInfoWindow();
                                }}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                              >
                                <X className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                            
                            {/* Info section */}
                            <div className="px-3 py-2">
                              {/* Title and Day badge */}
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-sm text-gray-900 leading-tight mr-1">{selectedLocation.name}</h5>
                                {selectedLocation.day && (
                                  <span className="shrink-0 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] rounded-sm mt-0.5">
                                    {selectedLocation.day.replace('Day ', 'D')}
                                  </span>
                                )}
                              </div>
                              
                              {/* Address */}
                              <div className="flex mt-1">
                                <MapPin className="w-3 h-3 text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {locationPhoto?.address || selectedLocation.originalLocation || selectedLocation.description || selectedLocation.name}
                                </p>
                              </div>
                              
                              {/* Bottom row with ratings and status */}
                              <div className="flex items-center justify-between mt-1.5">
                                {/* Ratings */}
                                {(locationPhoto?.rating || selectedLocation.rating) ? (
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} 
                                        className={`w-2.5 h-2.5 ${i < Math.floor(locationPhoto?.rating || selectedLocation.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                                      />
                                    ))}
                                    <span className="text-[9px] text-gray-600 ml-1">
                                      {parseFloat(locationPhoto?.rating || selectedLocation.rating).toFixed(1)}
                                    </span>
                                  </div>
                                ) : <div />}
                                
                                {/* Status indicator */}
                                {locationPhoto?.isOpen !== null && locationPhoto?.isOpen !== undefined && (
                                  <span className={`text-[9px] font-medium ${locationPhoto.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                    {locationPhoto.isOpen ? '• Open now' : '• Closed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Arrow pointer */}
                          <div className="absolute left-1/2 bottom-[-8px] transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white shadow"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Itinerary Panel */}
                  {showItinerary && !isCapturing && (
                    <ItineraryPanel
                      locations={filteredLocations.sort((a, b) => {
                        // ...existing logic...
                      })}
                      onSelectLocation={(location) => {
                        // Reset any existing selection
                        closeInfoWindow();
                        
                        // Remove existing overlay
                        if (infoWindowOverlayRef.current) {
                          infoWindowOverlayRef.current.setMap(null);
                          infoWindowOverlayRef.current = null;
                        }
                        
                        setTimeout(() => {
                          setSelectedLocation(location);
                          if (location.position && mapInstance) {
                            mapInstance.panTo(location.position);
                            mapInstance.setZoom(15);
                            
                            if (location.locationImage) {
                              const formattedLocation = {
                                locationImage: location.locationImage,
                                address: location.originalLocation || location.description,
                                rating: location.rating,
                                isOpen: null,
                                features: [
                                  location.type === 'hotel' ? 'Accommodation' : 
                                  location.type === 'restaurant' ? 'Restaurant' : 
                                  location.type === 'attraction' ? 'Attraction' : 
                                  location.type.charAt(0).toUpperCase() + location.type.slice(1)
                                ],
                                country: tripPlan?.tripDetails?.destination,
                                name: location.name,
                                locationDescription: location.locationDescription || location.description
                              };
                              setLocationPhoto(formattedLocation);
                            } else {
                              fetchPlacePhoto(location);
                            }
                          }
                        }, 10);
                      }}
                      tripPlan={tripPlan}
                      activeDay={activeDay}
                    />
                  )}

                  {/* Directions */}
                  {Array.isArray(directionsResponses) && !isResetting && directionsResponses
                    .filter(({ day }) => !activeDay ||
                      day === activeDay ||
                      (activeDay && String(day).startsWith(`${activeDay}-segment-`)))
                    .map(({ day, response }, index) => (
                      <DirectionsRenderer
                        key={`dir-${day}-${index}`} // Removed Date.now() for a more stable key
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

