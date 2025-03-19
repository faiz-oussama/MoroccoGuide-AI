import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TripPlanDisplay from './TripPlanDisplay';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  
  useEffect(() => {
    // Try to get trip data from location state first
    if (location.state?.tripPlan) {
      console.log("ResultsPage - Using trip data from location.state:", location.state.tripPlan);
      setTripData({
        tripPlan: location.state.tripPlan,
        savedTrip: location.state.savedTrip || false
      });
      return;
    }
    
    // If not in location state, try to get from sessionStorage
    try {
      const storedTripData = sessionStorage.getItem('currentTripPlan');
      if (storedTripData) {
        const parsedData = JSON.parse(storedTripData);
        console.log("ResultsPage - Using trip data from sessionStorage:", parsedData);
        
        // The data structure might be different in production vs development
        // Sometimes the data might be wrapped in a 'data' property
        setTripData({
          tripPlan: parsedData,
          savedTrip: false
        });
        return;
      }
    } catch (error) {
      console.error("Error parsing stored trip data:", error);
    }
    
    // If we still don't have trip data, redirect to create-trip
    console.log("No trip data available, redirecting to create-trip");
    navigate('/create-trip');
  }, [location.state, navigate]);
  
  // Show loading state while fetching data
  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="top-0 left-0 w-full h-full z-50 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TripPlanDisplay 
          tripPlan={tripData.tripPlan} 
          savedTrip={tripData.savedTrip} 
        />
      </motion.div>
    </div>
  );
}