import { DollarSign, Plane } from 'lucide-react';

export default function FlightCard({ flight }) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-gray-900">{flight.airline}</div>
            <div className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full">
              {flight.flight_number}
            </div>
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
              flight.status === 'active' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-gray-50 text-gray-600'
            }`}>
              {flight.status}
            </div>
          </div>
        </div>
  
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Departure</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {flight.departure.airport}
            </p>
            <p className="text-sm text-gray-500">
              Terminal {flight.departure.terminal || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(flight.departure.time).toLocaleTimeString()}
            </p>
          </div>
  
          <div className="flex items-center justify-center">
            <Plane className="w-6 h-6 text-indigo-600 transform rotate-90" />
          </div>
  
          <div>
            <p className="text-sm font-medium text-gray-500">Arrival</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {flight.arrival.airport}
            </p>
            <p className="text-sm text-gray-500">
              Terminal {flight.arrival.terminal || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(flight.arrival.time).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    );
}