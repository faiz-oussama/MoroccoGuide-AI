import Trip from '../models/TripSchema.js';

// Create a new trip
export async function saveTrip(req, res) {
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
}

// Get all trips for a user
export async function getTripsByUser(req, res) {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
}

// Get a single trip by ID
export async function getTripById(req, res) {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
}

// Update a trip
export async function updateTrip(req, res) {
  try {
    const { id } = req.params;
    const { tripData } = req.body;
    
    const result = await Trip.findByIdAndUpdate(
      id,
      { 
        tripData,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: "Trip not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Failed to update trip" });
  }
}

// Delete a trip
export async function deleteTrip(req, res) {
  try {
    const { id } = req.params;
    const result = await Trip.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: "Trip not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
} 