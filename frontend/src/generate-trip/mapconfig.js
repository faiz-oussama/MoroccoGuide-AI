export const MAP_CONFIG = {
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry', 'drawing'],
  language: 'en',
  region: 'MA',
  retry: true,
  retryOptions: {
    count: 5,  // Increased from 3
    delay: 1000, // Increased from 500
  },
  // Added loading callback
  onLoad: () => {
    console.log('Google Maps script loaded successfully');
    window.isGoogleMapsLoaded = true;
  },
  // Added error handling
  onError: (error) => {
    console.error('Google Maps script failed to load:', error);
  }
};

// Common map styles
export const MAP_STYLES = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
  }
];