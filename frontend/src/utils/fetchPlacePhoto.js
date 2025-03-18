import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchPlacePhoto(placeName, location) {
  try {
    console.log(`Fetching photo for ${placeName} in ${location} from ${API_URL}/api/place-photo`);
    const response = await axios.get(`${API_URL}/api/place-photo`, {
      params: { 
        query: placeName, 
        location: location 
      }
    });
    
    console.log(`Photo response for ${placeName}:`, response.data);
    return response.data.imageUrl || '/default-city.jpg';
  } catch (error) {
    console.error(`Error fetching photo for ${placeName}:`, error);
    return '/default-city.jpg';
  }
}

export { fetchPlacePhoto }; 