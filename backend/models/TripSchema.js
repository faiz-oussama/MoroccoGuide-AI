import mongoose from 'mongoose';

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

tripSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip; 