import { Clock, MapPin, Ticket } from 'lucide-react';

export default function AttractionCard({ attraction }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-[25rem] flex flex-col">
        {/* Image Section */}
        <div className="relative h-48">
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg">{attraction.name}</h3>
          </div>
        </div>
  
        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <p className="text-gray-600 text-sm line-clamp-3">
              {attraction.details}
            </p>
  
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm mt-auto">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-gray-600 truncate">{attraction.visitDuration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-gray-600 truncate">{attraction.ticketPrice}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-gray-600 truncate">
                  {attraction.coordinates.latitude.toFixed(2)}, 
                  {attraction.coordinates.longitude.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-gray-600 truncate">{attraction.openingHours}</span>
              </div>
            </div>
          </div>
  
          {/* Action Button - Now will always stick to bottom */}
          <button
            className="w-full py-2 px-4 mt-4 bg-indigo-600 text-white text-sm font-medium rounded-lg
              hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 
              focus:ring-indigo-500 focus:ring-offset-2"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }