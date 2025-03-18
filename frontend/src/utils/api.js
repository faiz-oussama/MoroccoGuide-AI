import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor if needed (for auth tokens, etc.)
api.interceptors.request.use(
  config => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Trip-related API calls
export const tripApi = {
  // Get all trips for a user
  getUserTrips: (userId) => api.get(`/api/trips/user/${userId}`),
  
  // Get a single trip by ID
  getTrip: (tripId) => api.get(`/api/trips/${tripId}`),
  
  // Save a new trip
  saveTrip: (tripData, userId, email) => api.post('/api/trips', { tripData, userId, email }),
  
  // Update an existing trip
  updateTrip: (tripId, tripData) => api.put(`/api/trips/${tripId}`, { tripData }),
  
  // Delete a trip
  deleteTrip: (tripId) => api.delete(`/api/trips/${tripId}`)
};

// Place-related API calls
export const placeApi = {
  // Get photo for a place
  getPlacePhoto: (query, location) => 
    api.get(`/api/place-photo`, { params: { query, location } })
};

export default api; 