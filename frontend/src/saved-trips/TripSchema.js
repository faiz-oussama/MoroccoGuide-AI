import mongoose from 'mongoose';

// Create a simple schema with the trip data stored as a single object
const tripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  tripData: {
    type: mongoose.Schema.Types.Mixed, // This allows for any JSON structure
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the 'updatedAt' field
tripSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
