import { Bus, Car, Plane, Train } from 'lucide-react';
import { useState } from 'react';

const transportModes = [
  {
    name: 'Flights',
    icon: Plane,
    options: ['Economy', 'Business', 'First Class']
  },
  {
    name: 'Trains',
    icon: Train,
    options: ['Standard', 'First Class']
  },
  {
    name: 'Cars',
    icon: Car,
    options: ['Economy', 'Premium', 'Luxury']
  },
  {
    name: 'Public Transit',
    icon: Bus,
    options: ['Local Bus', 'Tourist Bus', 'Taxi']
  }
];

const routePreferences = [
  { id: 'fastest', label: 'Fastest Route' },
  { id: 'scenic', label: 'Scenic Route' },
  { id: 'balanced', label: 'Balanced (Time & Scenery)' }
];

export default function TransportationPreferences({ onTransportationSelect }) {
  const [selectedModes, setSelectedModes] = useState({});
  const [routePreference, setRoutePreference] = useState('');

  const handleTransportModeChange = (modeName, value) => {
    const newModes = {
      ...selectedModes,
      [modeName]: value
    };
    setSelectedModes(newModes);
    onTransportationSelect({
      transportModes: newModes,
      routePreference
    });
  };

  const handleRoutePreferenceChange = (value) => {
    setRoutePreference(value);
    onTransportationSelect({
      transportModes: selectedModes,
      routePreference: value
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Transportation Preferences
        </h2>
        <p className="text-gray-600 text-sm">
          Choose how you'd like to travel around Morocco
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {transportModes.map(({ name, icon: Icon, options }) => (
          <div key={name} className="p-4 border rounded-xl hover:border-indigo-500 transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <Icon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-gray-900">{name}</h3>
            </div>
            <select 
              className="w-full p-2 border rounded-lg text-sm"
              value={selectedModes[name] || ''}
              onChange={(e) => handleTransportModeChange(name, e.target.value)}
            >
              <option value="">Select preference</option>
              {options.map(option => (
                <option key={option} value={option.toLowerCase()}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="font-medium text-gray-900 mb-4">Route Preference</h3>
        <div className="space-y-3">
          {routePreferences.map(({ id, label }) => (
            <label key={id} className="flex items-center space-x-3">
              <input
                type="radio"
                name="routePreference"
                value={id}
                checked={routePreference === id}
                onChange={(e) => handleRoutePreferenceChange(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}