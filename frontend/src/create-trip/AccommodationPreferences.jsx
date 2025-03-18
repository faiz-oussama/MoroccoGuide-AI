import { Coffee, Home, Star, Waves, Wifi, Wind } from 'lucide-react';
import { useState } from 'react';

const accommodationTypes = [
  { id: 'hotel', label: 'Hotel', icon: Home },
  { id: 'riad', label: 'Traditional Riad', icon: Home },
  { id: 'resort', label: 'Resort', icon: Home },
  { id: 'apartment', label: 'Vacation Rental', icon: Home }
];

const amenities = [
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'breakfast', label: 'Breakfast Included', icon: Coffee },
  { id: 'ac', label: 'Air Conditioning', icon: Wind }
];

export default function AccommodationPreferences({ onAccommodationSelect }) {
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const handleAccommodationSelect = (value) => {
    setSelectedAccommodation(value);
    onAccommodationSelect({
      type: value,
      rating: selectedRating,
      amenities: selectedAmenities
    });
  };

  const handleRatingSelect = (value) => {
    setSelectedRating(value);
    onAccommodationSelect({
      type: selectedAccommodation,
      rating: value,
      amenities: selectedAmenities
    });
  };

  const handleAmenitySelect = (value) => {
    if (selectedAmenities.includes(value)) {
      setSelectedAmenities(selectedAmenities.filter((amenity) => amenity !== value));
    } else {
      setSelectedAmenities([...selectedAmenities, value]);
    }
    onAccommodationSelect({
      type: selectedAccommodation,
      rating: selectedRating,
      amenities: selectedAmenities
    })
  };
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Accommodation Preferences
        </h2>
        <p className="text-gray-600 text-sm">
          Tell us about your ideal stay in Morocco
        </p>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Accommodation Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {accommodationTypes.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className="flex items-center p-4 border rounded-xl hover:border-indigo-500 cursor-pointer"
            >
              <input
                type="radio"
                name="accommodationType"
                value={id}
                checked={selectedAccommodation === id}
                className="text-indigo-600 focus:ring-indigo-500"
                onChange={(e) => handleAccommodationSelect(e.target.value)}
              />
              <Icon className="w-5 h-5 text-indigo-600 mx-3" />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Star Rating</h3>
        <div className="flex space-x-4">
          {[3, 4, 5].map((rating) => (
            <label
              key={rating}
              className="flex items-center p-3 border rounded-lg hover:border-indigo-500 cursor-pointer"
            >
              <input
                type="radio"
                name="starRating"
                value={rating}
                checked={selectedRating === rating}
                className="text-indigo-600 focus:ring-indigo-500"
                onChange={(e) => handleRatingSelect(Number(e.target.value))}
              />
              <div className="ml-2 flex items-center">
                {Array(rating).fill(<Star className="w-4 h-4 text-yellow-400" />)}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Desired Amenities</h3>
        <div className="grid grid-cols-2 gap-4">
          {amenities.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className="flex items-center p-3 border rounded-lg hover:border-indigo-500 cursor-pointer"
            >
              <input
                type="checkbox"
                name={id}
                checked={selectedAmenities.includes(id)}
                className="text-indigo-600 focus:ring-indigo-500"
                onChange={() => handleAmenitySelect(id)}
              />
              <Icon className="w-5 h-5 text-indigo-600 mx-3" />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}