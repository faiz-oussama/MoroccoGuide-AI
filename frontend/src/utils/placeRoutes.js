import express from "express";
import axios from "axios";
import dotenv from "dotenv";

const router = express.Router();
const GOOGLE_MAPS_API_KEY = "AIzaSyAo6DIOnhYdywBidl4clsPZPkQkXfq6QhI";

router.get('/place-photo', async (req, res) => {
  const { query, location } = req.query;
  
  console.log('Place photo request:', { query, location });

  try {
    // First, find place
    const findPlaceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`, {
      params: {
        input: `${query}, ${location}`,
        inputtype: 'textquery',
        fields: 'place_id,photos',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    console.log('Find place response:', findPlaceResponse.data);

    // Check if place exists and has photos
    if (findPlaceResponse.data.candidates && 
        findPlaceResponse.data.candidates.length > 0 && 
        findPlaceResponse.data.candidates[0].photos) {
      
      const photoReference = findPlaceResponse.data.candidates[0].photos[0].photo_reference;
      
      // Get photo URL
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
      
      console.log('Generated photo URL:', photoUrl);
      
      res.json({ imageUrl: photoUrl });
    } else {
      console.log('No photos found for place');
      res.json({ imageUrl: '/default-city.jpg' });
    }
  } catch (error) {
    console.error('Error in place photo route:', error);
    res.status(500).json({ imageUrl: '/default-city.jpg' });
  }
});

export default router;
