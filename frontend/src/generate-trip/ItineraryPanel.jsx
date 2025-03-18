import { motion } from 'framer-motion';

export const ItineraryPanel = ({ locations, onSelectLocation, tripPlan }) => {
  // Group locations by day
  const locationsByDay = locations.reduce((acc, location) => {
    const day = location.day || "Unscheduled";
    if (!acc[day]) acc[day] = [];
    acc[day].push(location);
    return acc;
  }, {});
  
  return (
    <div className="absolute top-[72px] right-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
        <h3 className="text-lg font-semibold">Your Itinerary</h3>
        <p className="text-sm text-white/80">
          {tripPlan?.tripDetails?.destination} • {tripPlan?.tripDetails?.duration?.days} Days
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(locationsByDay).map(([day, dayLocations], index) => (
          <div key={day} className="mb-4">
            <div className="px-4 py-2 bg-indigo-50 rounded-lg mb-2">
              <h4 className="font-medium text-indigo-800">{day}</h4>
            </div>
            
            <div className="space-y-2">
              {dayLocations.map((location, locIndex) => (
                <motion.div 
                  key={`${day}-${locIndex}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectLocation(location)}
                  className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${location.type === 'attraction' ? 'bg-red-100 text-red-700' : 
                        location.type === 'hotel' ? 'bg-blue-100 text-blue-700' : 
                        location.type === 'restaurant' ? 'bg-amber-100 text-amber-700' : 
                        'bg-green-100 text-green-700'}
                    `}>
                      {location.type === 'attraction' ? '🏛️' : 
                       location.type === 'hotel' ? '🏨' : 
                       location.type === 'restaurant' ? '🍽️' : '📍'}
                    </div>
                    <div className="ml-3 flex-1">
                      <h5 className="text-sm font-medium text-gray-800 line-clamp-1">{location.name}</h5>
                      <p className="text-xs text-gray-500 line-clamp-1">{location.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Click on any location to see details and highlight it on the map
        </div>
      </div>
    </div>
  );
};