import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { format } from 'date-fns';
import { motion, useAnimation } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MAP_CONFIG, MAP_STYLES } from './mapconfig';



function createCurvedPath(start, end) {
  const points = [];
  const numPoints = 100;
  const curvature = 0.2; 
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    
    const lat = start.lat * (1 - t) * (1 - t) + 
                (start.lat + (end.lat - start.lat) / 2 + (end.lng - start.lng) * curvature) * 2 * t * (1 - t) + 
                end.lat * t * t;
    
    const lng = start.lng * (1 - t) * (1 - t) + 
                (start.lng + (end.lng - start.lng) / 2) * 2 * t * (1 - t) + 
                end.lng * t * t;
    
    points.push({ lat, lng });
  }
  return points;
}

// Updated function to calculate bounds padding
function calculateBoundsWithPadding(origin, destination) {
  const bounds = new window.google.maps.LatLngBounds();
  
  // Add the origin and destination points
  bounds.extend(new window.google.maps.LatLng(origin));
  bounds.extend(new window.google.maps.LatLng(destination));
  
  // Calculate the distance between points
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Add padding based on distance
  // For longer distances, we need less percentage padding
  const paddingPercent = distance > 3000 ? 0.15 : 
                         distance > 1000 ? 0.2 : 
                         distance > 500 ? 0.25 : 0.3;
  
  // Apply padding to the bounds
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  const latDiff = Math.abs(ne.lat() - sw.lat()) * paddingPercent;
  const lngDiff = Math.abs(ne.lng() - sw.lng()) * paddingPercent;
  
  // Extend bounds with padding
  bounds.extend(new window.google.maps.LatLng({
    lat: ne.lat() + latDiff,
    lng: ne.lng() + lngDiff
  }));
  
  bounds.extend(new window.google.maps.LatLng({
    lat: sw.lat() - latDiff,
    lng: sw.lng() - lngDiff
  }));
  
  return bounds;
}

export default function JourneyMap({ origin, destination, date, duration }) {
  const [map, setMap] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fitBoundsCalled, setFitBoundsCalled] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader(MAP_CONFIG);


  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Effect to fit bounds when coordinates change or map loads
  useEffect(() => {
    if (map && coordinates?.origin && coordinates?.destination && !fitBoundsCalled) {
      // Use the custom function to calculate bounds with padding
      const bounds = calculateBoundsWithPadding(coordinates.origin, coordinates.destination);
      
      // Fit the map to these bounds
      map.fitBounds(bounds);
      
      // Set flag to prevent repeated fitBounds calls
      setFitBoundsCalled(true);
      
      // Optional: Add a slight delay to ensure proper rendering
      setTimeout(() => {
        // Check if the zoom is too close and adjust if needed
        const currentZoom = map.getZoom();
        if (currentZoom > 7) {
          map.setZoom(7);
        }
      }, 300);
    }
  }, [map, coordinates, fitBoundsCalled]);

  useEffect(() => {
    async function getCoordinates() {
      try {
        setIsLoading(true);
        setError(null);
        setFitBoundsCalled(false);

        if (!window.google) {
          throw new Error('Google Maps not loaded');
        }

        const geocoder = new window.google.maps.Geocoder();
        
        const results = await Promise.all([
          new Promise((resolve, reject) => {
            geocoder.geocode({ address: origin }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                resolve(results[0].geometry.location.toJSON());
              } else {
                reject(new Error(`Failed to geocode ${origin}`));
              }
            });
          }),
          new Promise((resolve, reject) => {
            geocoder.geocode({ address: destination }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                resolve(results[0].geometry.location.toJSON());
              } else {
                reject(new Error(`Failed to geocode ${destination}`));
              }
            });
          })
        ]);

        setCoordinates({
          origin: results[0],
          destination: results[1]
        });

      } catch (err) {
        console.error('Geocoding error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (origin && destination && isLoaded) {
      getCoordinates();
    }
  }, [origin, destination, isLoaded]);

  const controls = useAnimation();
  const planeControls = useAnimation();

  useEffect(() => {
    if (coordinates?.origin && coordinates?.destination) {
      const animatePlane = async () => {
        await planeControls.start({
          pathLength: 1,
          transition: { duration: 2, ease: "easeInOut" }
        });
        
        await planeControls.start({
          x: [0, 20, 0],
          y: [0, -10, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
      };
      
      animatePlane();
    }
  }, [coordinates, planeControls]);

  const center = coordinates?.origin || { lat: 0, lng: 0 };

  if (loadError) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">Map cannot be loaded: {loadError.message}</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl shadow-lg"
      >
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {(isLoading || !isLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '300px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            center={center}
            zoom={4} // Default zoom, will be overridden by fitBounds
            onLoad={onMapLoad}
            options={{
              styles: MAP_STYLES,
              disableDefaultUI: true,
              backgroundColor: '#f3f4f6',
              gestureHandling: 'cooperative',
              zoomControl: true,
              zoomControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
              },
              mapTypeControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              restriction: {
                latLngBounds: {
                  north: 85,
                  south: -85,
                  west: -180,
                  east: 180
                }
              },
              minZoom: 2,
              maxZoom: 7, 
              scrollwheel: true
            }}
          >
            {coordinates && !isLoading && (
              <>
                <Polyline
                  path={createCurvedPath(coordinates.origin, coordinates.destination)}
                  options={{
                    strokeColor: '#6366f1',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    geodesic: true,
                  }}
                />
                <>
                  {/* Background line */}
                  <Polyline
                    path={createCurvedPath(coordinates.origin, coordinates.destination)}
                    options={{
                      strokeColor: '#e2e8f0',
                      strokeOpacity: 1,
                      strokeWeight: 3,
                      geodesic: true,
                    }}
                  />
                  
                  {/* Animated line */}
                  <Polyline
                    path={createCurvedPath(coordinates.origin, coordinates.destination)}
                    options={{
                      strokeColor: '#6366f1',
                      strokeOpacity: 1,
                      strokeWeight: 3,
                      geodesic: true,
                      icons: [{
                        icon: {
                          path: 'M 0,-1 0,1',
                          strokeOpacity: 1,
                          scale: 3
                        },
                        offset: '0',
                        repeat: '20px'
                      }]
                    }}
                  />
                </>
                
                {/* Origin Marker */}
                <Marker
                  position={coordinates.origin}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: '#4f46e5',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 1.5,
                    anchor: new window.google.maps.Point(12, 24),
                  }}
                />

                {/* Destination Marker */}
                <Marker
                  position={coordinates.destination}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: '#e11d48',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 1.5,
                    anchor: new window.google.maps.Point(12, 24),
                  }}
                />
              </>
            )}
          </GoogleMap>
        )}
      </motion.div>

      {/* Journey Details */}
      <div className="relative grid grid-cols-2 gap-8">
        {/* Origin */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-end"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">From</p>
              <h3 className="text-2xl font-bold text-gray-900">{origin}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(date.start), 'MMM dd, yyyy')}</span>
          </div>
        </motion.div>

        {/* Destination */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">To</p>
              <h3 className="text-2xl font-bold text-gray-900">{destination}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(date.end), 'MMM dd, yyyy')}</span>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

function CustomPlaneMarker({ path, duration }) {
  const [position, setPosition] = useState(path[0]);
  const progressRef = useRef(0);
  
  useEffect(() => {
    const animation = animate(0, 1, {
      duration,
      ease: "linear",
      repeat: Infinity,
      onUpdate: (latest) => {
        progressRef.current = latest;
        const index = Math.floor(latest * (path.length - 1));
        setPosition(path[index]);
      },
    });

    return () => animation.stop();
  }, [path, duration]);

  const rotation = progressRef.current < 1 
    ? google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(position),
        new google.maps.LatLng(path[Math.min(Math.floor(progressRef.current * path.length) + 1, path.length - 1)])
      )
    : 0;

  return (
    <Marker
      position={position}
      icon={{
        path: 'M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145l-84.355-23.599l-66.073,72.345l-24.099-22.002l0,0l-24.098,22.002l-66.073-72.345l-84.355,23.599l-3.293-26.145l62.332-57.969l-10.248-51.234l65.659,21.427l39.95-47.065l22.087,19.108l0,0l22.087-19.108l39.95,47.065L362.985,430.724z',
        fillColor: '#4f46e5',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.05,
        rotation: rotation,
        anchor: new google.maps.Point(200, 200),
      }}
    />
  );
}