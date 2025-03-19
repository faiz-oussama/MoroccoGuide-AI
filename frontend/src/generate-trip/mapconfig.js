// MapTiler configuration for map
export const MAP_CONFIG = {
  id: 'maptiler-map-script',
  maptilerApiKey: import.meta.env.VITE_MAPTILER_API_KEY,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Keep for backward compatibility
  libraries: ['places', 'geometry', 'drawing'],
  language: 'en',
  region: 'MA',
  retry: true,
  retryOptions: {
    count: 5,
    delay: 1000,
  },
  onLoad: () => {
    console.log('Map scripts loaded successfully');
    window.isMapLoaded = true;
  },
  onError: (error) => {
    console.error('Map script failed to load:', error);
  }
};

// Common map styles for MapTiler
export const MAP_STYLES = [
  {
    id: 'default',
    name: 'Default',
    url: `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: `https://api.maptiler.com/maps/hybrid/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    url: `https://api.maptiler.com/maps/outdoor/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
  },
  {
    id: 'basic',
    name: 'Basic',
    url: `https://api.maptiler.com/maps/basic/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
  },
  {
    id: 'winter',
    name: 'Winter',
    url: `https://api.maptiler.com/maps/winter/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`
  }
];

// Default center coordinates for Morocco
export const DEFAULT_CENTER = {
  lat: 31.7917, 
  lng: -7.0926
};

// Default zoom level for countrywide view
export const DEFAULT_ZOOM = 5;

// Marker colors for different activity types
export const MARKER_COLORS = {
  hotel: '#3b82f6',       // blue-500
  restaurant: '#f59e0b',  // amber-500
  attraction: '#ef4444',  // red-500
  transport: '#8b5cf6',   // violet-500
  activity: '#10b981',    // emerald-500
  default: '#6b7280'      // gray-500
};