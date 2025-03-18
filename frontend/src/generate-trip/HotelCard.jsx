import { MapPin } from 'react-feather';
import ReactStars from 'react-rating-stars-component';

export default function HotelCard({ hotel }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img 
        src={hotel.photoUrl} 
        alt={hotel.name}
        className="h-48 w-full object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
        <div className="flex items-center mb-2">
          <ReactStars
            count={5}
            value={hotel.rating}
            size={20}
            edit={false}
            activeColor="#4F46E5"
            color="#E5E7EB"
          />
          <span className="ml-2 text-gray-600">{hotel.priceRange}</span>
        </div>
        <p className="text-gray-600 mb-4">{hotel.address}</p>
        <div className="space-y-2">
          {hotel.nearbyAttractions.map((attraction, index) => (
            <div key={index} className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-indigo-600 mr-2" />
              <span>{attraction.name} ({attraction.distance})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}