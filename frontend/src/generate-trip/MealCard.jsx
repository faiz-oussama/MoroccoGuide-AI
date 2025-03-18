import { motion } from 'framer-motion';
import { Clock, MapPin, Star, Utensils } from 'lucide-react';
import PropTypes from 'prop-types';

export default function MealCard({ meal }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={meal.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'}
          alt={meal.restaurant}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm font-medium text-white/80">{meal.mealType}</p>
          <h3 className="text-xl font-bold text-white">{meal.restaurant}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="h-58 p-4">
        {/* Restaurant Info */}
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{meal.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{meal.time}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 rounded-lg bg-amber-50 px-2 py-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">{meal.rating}</span>
          </div>
        </div>

        {/* Cuisine Tags */}
        {meal.cuisineType && meal.cuisineType.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {meal.cuisineType.map((cuisine, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {cuisine}
              </span>
            ))}
          </div>
        )}

        {/* Recommended Dishes */}
        {meal.recommendedDishes && meal.recommendedDishes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Utensils className="h-4 w-4 text-indigo-500" />
              <h4 className="text-sm font-medium text-gray-900">Recommended Dishes</h4>
            </div>
            <ul className="space-y-1">
              {meal.recommendedDishes.map((dish, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {dish}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price Range */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm font-medium text-gray-900">Average Price</span>
          <span className="text-sm font-medium text-indigo-600">{meal.priceRange}</span>
        </div>
      </div>
    </motion.div>
  );
}

MealCard.propTypes = {
  meal: PropTypes.shape({
    restaurant: PropTypes.string.isRequired,
    mealType: PropTypes.oneOf(['Breakfast', 'Lunch', 'Dinner']).isRequired,
    location: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    cuisineType: PropTypes.arrayOf(PropTypes.string).isRequired,
    recommendedDishes: PropTypes.arrayOf(PropTypes.string).isRequired,
    priceRange: PropTypes.string.isRequired,
    imageUrl: PropTypes.string
  }).isRequired
};