import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import mongoose from 'mongoose';
import placeRoutes from "./routes/placeRoutes.js";
import { saveTrip, getTripsByUser, getTripById, updateTrip, deleteTrip } from './services/TripService.js';
import { fetchPlacePhoto } from "./utils/fetchPlacePhoto.js";
import Trip from './models/TripSchema.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow cross-origin requests from frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || "AIzaSyBAfh5HVRuUehApbjOltLKVwFULDOC2QLA");

// API routes
app.use('/api', placeRoutes);

// Add your trip routes
app.post('/api/trips', saveTrip);
app.get('/api/trips/user/:userId', getTripsByUser);
app.get('/api/trips/:id', getTripById);
app.put('/api/trips/:id', updateTrip);
app.delete('/api/trips/:id', deleteTrip);

// Legacy endpoint for backward compatibility
app.post('/save-trip', async (req, res) => {
  try {
    const { tripData, userId, email } = req.body;
    
    const newTrip = new Trip({
      userId,
      email,
      tripData
    });
    
    const savedTrip = await newTrip.save();
    res.status(201).json({ id: savedTrip._id });
  } catch (error) {
    console.error("Error saving trip:", error);
    res.status(500).json({ error: "Failed to save trip" });
  }
});

// Get user trips (legacy endpoint)
app.get("/user-trips/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json({ data: trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// Delete trip (legacy endpoint)
app.delete("/trips/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await Trip.findByIdAndDelete(tripId);
    
    if (!result) {
      return res.status(404).json({ error: "Trip not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

// Trip generation endpoint
app.post("/generate-trip", async (req, res) => {
    try {
        const { origin, destination, travelers, dates, budget, transportation, accommodation, activities } = req.body;
        
        const prompt = `Generate a comprehensive travel plan from ${origin} to ${destination}, Morocco for ${dates.duration} days and ${dates.duration - 1} nights.

        Requirements:
       "tripDetails": {
            "origin": "${origin}",
            "destination": "${destination}",
            "duration": {
            "days": ${dates.duration},
            "nights": ${dates.duration - 1}
            },
            "dates": {
            "start": "${dates.startDate}",
            "end": "${dates.endDate}"
            },
            "travelers": {
            "count": ${travelers.count},
            "type": "${travelers.label}"
            },
            "budget": {
            "level": "${budget.level}",
            "currency": "MAD"
            },
            "transportation" : {
            "modes" : "${transportation.modes}",
            "routePreference" : "${transportation.routePreference}",
            },
            "accommodation" : {
            "type" : "${accommodation.type}",
            "rating" : "${accommodation.rating}",
            "desired amenities" : "${accommodation.amenities}"
            },
            "activities" : {
            "interests" : "${activities.interests}",
            "pace" : "${activities.pace}",
            "specialRequirements" : "${activities.schedule.specialRequirements}"
            }
        
        Please provide a detailed plan in JSON format with the following structure:
        "transportation": {
                "selectedModes": ${JSON.stringify(transportation.modes)},
                "flights": [{
                "airline": "",
                "departure": "",
                "arrival": "",
                "price": "",
                "bookingUrl": ""
                }]
            },
            "accommodation": {
                "hotels": [{
                "name": "",
                "rating": 0,
                "address": "",
                "photoUrl": "",
                "coordinates": {
                    "latitude": 0,
                    "longitude": 0
                },
                "description": "",
                "priceRange": "",
                "nearbyAttractions": [{
                    "name": "",
                    "distance": "",
                    "description": "",
                    "photoUrl": ""
                }]
                }]
            },
            "attractions": [{
                "name": "",
                "details": "",
                "imageUrl": "",
                "coordinates": {
                "latitude": 0,
                "longitude": 0
                },
                "ticketPrice": "",
                "visitDuration": "",
                "openingHours": ""
            }],
            "dailyPlan": [{
                "day": 1,
                    "activities": [{
                        "time": "", (in 24-hour format !!!!!),
                        "activity": "",
                        "location": "",
                        "locationDescription": "",
                        "rating": 4.5,
                        "locationImage": "",(keep it empty, not required)
                         "activity location coordinates": {
                          "latitude": 0,
                          "longitude": 0
                          },
                        "transport": "",
                        "cost": ""
                        }],
                    "meals": [{
                        "restaurant": "",
                         "coordinates of restaurant": {
                          "latitude": 0,
                          "longitude": 0
                          },
                        "mealType": "",
                        "location": "",
                        "time": "",
                        "rating": 4.5,
                        "cuisineType": [],
                        "recommendedDishes": [],
                        "priceRange": "",
                        "imageUrl": "" (keep it empty, not required)
                    }],
                    "description": "",
                    "date": "",
                    "weather": "",
                    "summaryOfDay": {
                      "08:00": {activity: "Breakfast at hotel restaurant", location: {latitude: 0, longitude: 0}},
                  },

            }],
            "transportation": [{
                "mode": "Train / Bus",
                "departure": "",
                "arrival": "",
                "duration": "",
                "price": "",
                "bookingUrl": ""
            }],
            },
            "tripDescription": ""


        Include for each transportation mean (train and bus) option:
        - for trains grab from the ONCF website
        - for buses grab from the CTM website

        Include for each hotel option:
        - Restaurant name, address, price range
        - Geo coordinates (latitude, longitude)
        - Rating and description
        - Nearby attractions

         Include for each meal all the details for each option:
        - Hotel name, address, price range
        - Geo coordinates (latitude, longitude)
        - keep the imageUrl empty
        - Rating and description
        - Nearby attractions

        For each attraction/place:
        - Place name and detailed description
        - geo coordinates
        - Ticket prices and visiting hours
        - Recommended time to spend
        
        For daily plan:
        - for the summaryOfDay, (include everything about the day (activities, meals, etc) ranked in order of time) BUT if the place stays the same consecutively dont repeat it, it always should be a different place in between two places because i wanna plot the activities on the map, i gave an example of the format, you should change it to fit the trip plan
        - Dont mention the departure from the origin city, just start from the check-in at the hotel
        - Detailed itinerary with timing in 24-hour format
        - Distance between locations
        - Transport options
        - Meal recommendations
        - Estimated costs        

        in the tripDetails dont forget to mention the origin of the trip
        Return ONLY a valid JSON string without any additional text or formatting . just a directly response with a JSON object. And stick to the requirements i mentioned, dont forget the  "coordinates": {
                "latitude": ,
                "longitude": 
                } for each location, restaurant or activity mentioned.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();

        rawResponse = rawResponse
            .replace(/```json\n|\n```/g, '')
            .trim();
        
        const tripPlan = parseAndValidateJSON(rawResponse);

        if (!tripPlan || typeof tripPlan !== 'object') {
            throw new Error('Invalid trip plan structure');
        }

        const requiredProperties = ['tripDetails', 'accommodation', 'attractions', 'dailyPlan'];
        for (const prop of requiredProperties) {
            if (!tripPlan[prop]) {
                throw new Error(`Missing required property: ${prop}`);
            }
        }

        await Promise.all([
            ...tripPlan.dailyPlan.flatMap(day =>
                day.meals.map(async (meal) => {
                    try {
                        console.log(`Fetching photo for meal: ${meal.restaurant}`);
                        const photoUrl = await fetchPlacePhoto(meal.restaurant, destination);
                        console.log(`Got photo URL for meal: ${photoUrl}`);
                        if (photoUrl && photoUrl !== '/default-city.jpg') {
                            meal.imageUrl = photoUrl;
                        }
                    } catch (error) {
                        console.error(`Error fetching photo for meal ${meal.restaurant}:`, error);
                    }
                })
            ),
            ...tripPlan.accommodation.hotels.map(async (hotel) => {
                try {
                    console.log(`Fetching photo for hotel: ${hotel.name}`);
                    const photoUrl = await fetchPlacePhoto(hotel.name, destination);
                    console.log(`Got photo URL for hotel: ${photoUrl}`);
                    if (photoUrl && photoUrl !== '/default-city.jpg') {
                        hotel.photoUrl = photoUrl;
                    }
                } catch (error) {
                    console.error(`Error fetching photo for hotel ${hotel.name}:`, error);
                }
            }),
            ...tripPlan.attractions.map(async (attraction) => {
                try {
                    console.log(`Fetching photo for attraction: ${attraction.name}`);
                    const photoUrl = await fetchPlacePhoto(attraction.name, destination);
                    console.log(`Got photo URL for attraction: ${photoUrl}`);
                    if (photoUrl && photoUrl !== '/default-city.jpg') {
                        attraction.imageUrl = photoUrl;
                    }
                } catch (error) {
                    console.error(`Error fetching photo for attraction ${attraction.name}:`, error);
                }
            }),
            ...tripPlan.dailyPlan.flatMap(day =>
                (day.activities || []).map(async (activity) => {
                    try {
                        if (activity.location && activity.location !== 'N/A') {
                            console.log(`Fetching photo for activity: ${activity.activity} at ${activity.location}`);
                            const photoUrl = await fetchPlacePhoto(activity.location, destination);
                            console.log(`Got photo URL for activity: ${photoUrl}`);
                            if (photoUrl && photoUrl !== '/default-city.jpg') {
                                activity.locationImage = photoUrl;
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching photo for activity ${activity.activity}:`, error);
                    }
                })
            )
        ]);

        res.json({
            success: true,
            data: tripPlan,
            message: "Trip plan generated successfully"
        });
    } catch (error) {
        console.error("Error generating trip plan:", error);
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred while generating the trip plan"
        });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://faizouss123:k7jsNQm3B9kpST8F@cluster0.ypapm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log("Failed to connect to MongoDB", err);
});

// Helper functions
function sanitizeJSONString(str) {
    return str
        .replace(/'/g, '"')
        .replace(/(?:\r\n|\r|\n)/g, '') 
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*?)'/g, ':"$1"')
        .replace(/\\/g, '\\\\')
        .replace(/"\s+/g, '"')
        .replace(/\s+"/g, '"');
}

function parseAndValidateJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (firstError) {
        console.log("Initial JSON parse failed, attempting cleanup...");
        try {
            const sanitized = sanitizeJSONString(jsonString);
            return JSON.parse(sanitized);
        } catch (secondError) {
            console.error("Failed to parse JSON after sanitization:", secondError);
            throw new Error("Invalid JSON response");
        }
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 