import Trip from './TripSchema.js';

// Create a new trip
export async function saveTrip(tripData, userId, email) {
  try {
    const newTrip = new Trip({
      userId,
      email,
      tripData
    });
    
    const savedTrip = await newTrip.save();
    return savedTrip._id;
  } catch (error) {
    console.error("Error saving trip:", error);
    throw error;
  }
}

// Get all trips for a user
export async function getTripsByUser(userId) {
  try {
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
}

// Get a single trip by ID
export async function getTripById(tripId) {
  try {
    const trip = await Trip.findById(tripId);
    return trip;
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
}

// Update a trip
export async function updateTrip(tripId, tripData) {
  try {
    const result = await Trip.findByIdAndUpdate(
      tripId,
      { 
        tripData,
        updatedAt: new Date()
      },
      { new: true }
    );
    return result !== null;
  } catch (error) {
    console.error("Error updating trip:", error);
    throw error;
  }
}

// Delete a trip
export async function deleteTrip(tripId) {
  try {
    const result = await Trip.findByIdAndDelete(tripId);
    return result !== null;
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw error;
  }
}
