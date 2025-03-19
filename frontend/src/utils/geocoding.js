/**
 * Utility functions for geocoding using MapTiler API
 */

// Get the MapTiler API key from environment variables
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

/**
 * Geocode a place name to get coordinates
 * @param {string} placeName - The name of the place to geocode
 * @param {string} [country='Morocco'] - The country to focus the search on
 * @returns {Promise<{latitude: number, longitude: number} | null>} - Coordinates or null if not found
 */
export async function geocodePlaceName(placeName, country = 'Morocco') {
  try {
    if (!placeName) {
      console.warn('No place name provided for geocoding');
      return null;
    }
    
    // For better results, append the country name if not already included
    const searchQuery = placeName.toLowerCase().includes(country.toLowerCase()) 
      ? placeName 
      : `${placeName}, ${country}`;
    
    // Use MapTiler's geocoding API
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we have any features returned
    if (!data.features || data.features.length === 0) {
      console.warn(`No results found for location: ${placeName}`);
      return null;
    }
    
    // Get the first (most relevant) result
    const location = data.features[0];
    
    // Extract coordinates [longitude, latitude]
    const [longitude, latitude] = location.center;
    
    console.log(`Geocoded ${placeName} to:`, { latitude, longitude });
    
    return { latitude, longitude };
  } catch (error) {
    console.error(`Error geocoding ${placeName}:`, error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get place name and details
 * @param {number} latitude - The latitude
 * @param {number} longitude - The longitude
 * @returns {Promise<{name: string, address: string} | null>} - Place details or null if not found
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    // Use MapTiler's reverse geocoding API
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we have any features returned
    if (!data.features || data.features.length === 0) {
      console.warn(`No results found for coordinates: ${latitude}, ${longitude}`);
      return null;
    }
    
    // Get the first (most relevant) result
    const place = data.features[0];
    
    return {
      name: place.text || 'Unknown Location',
      address: place.place_name || '',
    };
  } catch (error) {
    console.error(`Error reverse geocoding coordinates:`, error);
    return null;
  }
} 