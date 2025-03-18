import { motion } from 'framer-motion';
import {
  AlertCircle,
  Award, Bus, Calendar, Camera, Clock,
  Cloud,
  CloudSun,
  Coffee, DollarSign,
  MapPin,
  Navigation,
  Star,
  Sun,
  Sunrise, Sunset,
  ThumbsDown,
  ThumbsUp,
  Utensils
} from 'lucide-react';
import React, { useState } from 'react';

export default function DayPlan({ day }) {
  // Helper function to get appropriate icon for activity type with enhanced options
  const getActivityIcon = (activity) => {
    const lowercaseActivity = activity.toLowerCase();
    if (lowercaseActivity.includes('visit') || lowercaseActivity.includes('tour')) return Camera;
    if (lowercaseActivity.includes('breakfast')) return Sunrise;
    if (lowercaseActivity.includes('lunch')) return Utensils;
    if (lowercaseActivity.includes('dinner')) return Sunset;
    if (lowercaseActivity.includes('coffee')) return Coffee;
    if (lowercaseActivity.includes('relax') || lowercaseActivity.includes('leisure')) return Sun;
    if (lowercaseActivity.includes('museum') || lowercaseActivity.includes('landmark')) return Award;
    if (lowercaseActivity.includes('walk') || lowercaseActivity.includes('hike')) return Navigation;
    if (lowercaseActivity.includes('shopping') || lowercaseActivity.includes('market')) return ThumbsUp;
    return Clock;
  };
  
  const [activityHovered, setActivityHovered] = useState(null);
  const getActivityColor = (activity) => {
    const lowercaseActivity = activity.toLowerCase();
    if (lowercaseActivity.includes('visit') || lowercaseActivity.includes('tour')) 
      return { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-600', 
        icon: 'text-emerald-600',
        border: 'border-emerald-200',
        gradient: 'from-emerald-50 to-green-50'
      };
    if (lowercaseActivity.includes('breakfast')) 
      return { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        icon: 'text-amber-600',
        border: 'border-amber-200',
        gradient: 'from-orange-50 to-amber-50'
      };
    if (lowercaseActivity.includes('lunch') || lowercaseActivity.includes('dinner') || lowercaseActivity.includes('coffee')) 
      return { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        icon: 'text-rose-600',
        border: 'border-rose-200',
        gradient: 'from-rose-50 to-orange-50'
      };
    if (lowercaseActivity.includes('relax') || lowercaseActivity.includes('leisure')) 
      return { 
        bg: 'bg-sky-50', 
        text: 'text-sky-700', 
        icon: 'text-sky-600',
        border: 'border-sky-200',
        gradient: 'from-sky-50 to-blue-50'
      };
    if (lowercaseActivity.includes('museum') || lowercaseActivity.includes('landmark')) 
      return { 
        bg: 'bg-violet-50', 
        text: 'text-violet-700',

        icon: 'text-violet-600',
        border: 'border-violet-200',
        gradient: 'from-violet-50 to-purple-50'
      };
    if (lowercaseActivity.includes('shopping') || lowercaseActivity.includes('market')) 
      return { 
        bg: 'bg-fuchsia-50', 
        text: 'text-fuchsia-700', 
        icon: 'text-fuchsia-600',
        border: 'border-fuchsia-200',
        gradient: 'from-fuchsia-50 to-pink-50'
      };
    return { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
      gradient: 'from-indigo-50 to-blue-50'
    };
  };
  
  // Calculate time metrics for the day (start time, end time, active hours)
  const timeMetrics = React.useMemo(() => {
    if (!day.activities || day.activities.length === 0) return null;
    
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(n => parseInt(n, 10));
      return hours * 60 + minutes;
    };
    
    const formatMinutes = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
    };
    
    const sortedActivities = [...day.activities].sort((a, b) => {
      return timeToMinutes(a.time.split(' ')[0]) - timeToMinutes(b.time.split(' ')[0]);
    });
    
    const startActivity = sortedActivities[0];
    const endActivity = sortedActivities[sortedActivities.length - 1];
     // Assume time is already in 24h format, so no need for AM/PM logic
    const startTime = startActivity.time.split(' ')[0];
    const endTime = endActivity.time.split(' ')[0];
    
    // Calculate day duration in hours and minutes
    const dayDuration = formatMinutes(timeToMinutes(endTime) - timeToMinutes(startTime));
    
    return {
      startTime,
      endTime,
      dayDuration,
      totalActivities: day.activities.length
    };
  }, [day.activities]);

  // Get weather info for the day if available
  const getWeatherIcon = () => {
    if (!day.weather) return null;
    
    const weatherType = day.weather.toLowerCase();
    if (weatherType.includes('sun')) return <CloudSun className="w-4 h-4 text-amber-500" />;
    if (weatherType.includes('cloud')) return <Cloud className="w-4 h-4 text-gray-500" />;
    if (weatherType.includes('rain')) return <CloudRain className="w-4 h-4 text-blue-500" />;
    return <CloudSun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 z-10"
      whileHover={{ y: -4, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Day header with enhanced metrics and visual elements */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl transform -translate-x-4 translate-y-4"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Day {day.day}</h3>
              {day.date && <p className="text-xs text-indigo-100">{day.date}</p>}
            </div>
          </div>
          
          {/* Enhanced highlight pill */}
          <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/25">
            <div className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-medium text-white">
                {day.highlight || "Today's Highlight"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Day metrics */}
        {timeMetrics && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-xs text-indigo-100">Start</div>
              <div className="font-semibold">{timeMetrics.startTime}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-xs text-indigo-100">End</div>
              <div className="font-semibold">{timeMetrics.endTime}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-xs text-indigo-100">Activities</div>
              <div className="font-semibold">{timeMetrics.totalActivities}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Weather info if available */}
      {day.weather && (
        <div className="px-6 py-2 bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getWeatherIcon()}
              <span className="text-sm text-gray-700">{day.weather}</span>
            </div>
            <div className="text-sm text-gray-600">
              {day.temperature || "22°C / 72°F"}
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="relative">
          {/* Timeline line with enhanced styling */}
          <div className="absolute left-[25px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-indigo-200 to-indigo-100"></div>
          
          <div className="space-y-8">
            {day.activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.activity);
              const colorScheme = getActivityColor(activity.activity);
              
              return (
                <motion.div 
                  className="flex items-start space-x-4 relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Timeline dot with enhanced styling */}
                  <div className={`flex-shrink-0 z-10 rounded-full w-10 h-10 ${colorScheme.bg} flex items-center justify-center ring-2 ring-white shadow-sm border ${colorScheme.border}`}>
                    <ActivityIcon className={`w-5 h-5 ${colorScheme.icon}`} />
                  </div>
                  
                  {/* Activity card with enhanced styling */}
                  <div className={`flex-1 bg-gradient-to-br ${colorScheme.gradient} rounded-xl border ${colorScheme.border} shadow-sm p-5 hover:shadow-md transition-all duration-300`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <span className={`text-sm font-medium ${colorScheme.text}`}>{activity.time}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-800 font-semibold">{activity.activity}</span>
                      </div>
                      
                      {activity.duration && (
                        <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 flex items-center border border-gray-100">
                          <Clock className="w-3 h-3 mr-1.5 text-indigo-500" />
                          {activity.duration}
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced activity detail cards */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="relative group">
                        <div 
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300"
                        onMouseEnter={() => setActivityHovered(index)}
                        onMouseLeave={() => setActivityHovered(null)}
                        >
                          <div className="p-1.5 rounded-md bg-indigo-100">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Location</div>
                            <div className="text-sm text-gray-800 font-medium truncate">{activity.location}</div>
                          </div>
                        </div>
                        
                        {activityHovered === index && (
                          <motion.div
                          className="absolute transform -translate-x-1/2 z-50"
                          style={{
                            left: '50%',
                            bottom: 'calc(100% + 12px)',
                            width: '18rem'
                          }}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25 
                          }}
                        >
                          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-0 overflow-hidden backdrop-blur-sm">
                            {/* Enhanced image container */}
                            <div className="relative w-full h-44 overflow-hidden">
                              {activity.locationImage ? (
                                <div className="relative h-full">
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                                  <img 
                                    src={activity.locationImage} 
                                    alt={activity.location} 
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                  />
                                  <div className="absolute bottom-3 left-3 z-20">
                                    <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-md shadow-sm">
                                      {activity.country || "Popular Destination"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-violet-100 flex items-center justify-center">
                                  <div className="p-3 bg-white/70 backdrop-blur-sm rounded-full">
                                    <MapPin className="w-9 h-9 text-indigo-500" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Enhanced content section */}
                            <div className="p-4 pb-3">
                              <h5 className="font-semibold text-lg text-gray-900">{activity.location}</h5>
                              <div className="flex items-center text-gray-500 text-sm mt-1 mb-2.5">
                                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                <p className="text-sm truncate">{activity.address || activity.location}</p>
                              </div>
                              
                              {/* Rating element if available */}
                              {activity.rating && (
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} 
                                      className={`w-3.5 h-3.5 ${i < Math.floor(activity.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="text-xs font-medium text-gray-600 ml-1">
                                    {activity.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              
                              {activity.locationDescription && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{activity.locationDescription}</p>
                              )}
                              
                              {/* Tags/Features */}
                              {activity.features && activity.features.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {activity.features.slice(0, 3).map((feature, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Enhanced action footer */}
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" /> Useful
                                  </button>
                                  <button className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <ThumbsDown className="w-3.5 h-3.5 text-gray-500" /> Unuseful
                                  </button>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  Learn more
                                </motion.button>
                              </div>
                            </div>
                            
                            {/* Enhanced pointer arrow with subtle shadow */}
                            <div className="absolute bottom-[-9px] left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white rotate-45 border-b border-r border-gray-200 shadow-sm"></div>
                          </div>
                        </motion.div>
                        )}
                        
            
                      </div>
                      
                      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
                        <div className="p-1.5 rounded-md bg-indigo-100">
                          <Bus className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Transport</div>
                          <div className="text-sm text-gray-800 font-medium truncate">{activity.transport}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
                        <div className="p-1.5 rounded-md bg-indigo-100">
                          <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Cost</div>
                          <div className="text-sm text-gray-800 font-medium truncate">{activity.cost}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced notes section with better styling */}
                    {activity.notes && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Travel Notes</h4>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 p-3 text-sm text-gray-700 shadow-inner">
                          <p>{activity.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced recommendations section */}
                    {activity.recommendations && activity.recommendations.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ThumbsUp className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Insider Tips</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activity.recommendations.map((rec, idx) => (
                            <motion.span 
                              key={idx} 
                              className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.05, backgroundColor: '#EEF2FF' }}
                              transition={{ duration: 0.2 }}
                            >
                              {rec}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Enhanced summary section at bottom */}
      <div className="bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, day.activities.length))].map((_, i) => {
                const activity = day.activities[i];
                const colorScheme = getActivityColor(activity.activity);
                const ActivityIcon = getActivityIcon(activity.activity);
                
                return (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full ${colorScheme.bg} ${colorScheme.border} border ring-2 ring-white flex items-center justify-center shadow-sm`}
                    title={activity.activity}
                  >
                    <ActivityIcon className={`w-4 h-4 ${colorScheme.icon}`} />
                  </div>
                );
              })}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">
                {day.activities.length} Activities
              </div>
              <div className="text-xs text-gray-500">
                {day.description?.substring(0, 40)}...
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Additional metrics if available */}
            {day.estimatedCost && (
              <div className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center border border-gray-200">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="font-medium text-gray-700">{day.estimatedCost}</span>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 text-xs font-medium text-white rounded-full
                         bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm
                         hover:shadow-md transition-all duration-300"
            >
              View Details
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}