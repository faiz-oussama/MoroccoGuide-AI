import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fetchPlacePhoto } from "../utils/fetchPlacePhoto.js";

const router = express.Router();

router.get('/place-photo', async (req, res) => {
  const { query, location } = req.query;
  
  console.log('Place photo API request:', { query, location });

  try {
    const photoUrl = await fetchPlacePhoto(query, location);
    console.log('API response photo URL:', photoUrl);
    
    res.json({ imageUrl: photoUrl });
  } catch (error) {
    console.error('Error in place photo route:', error);
    res.status(500).json({ imageUrl: '/default-city.jpg' });
  }
});

export default router; 