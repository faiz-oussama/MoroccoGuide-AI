import { Car, Compass, DollarSign, Home, Utensils } from 'lucide-react';
import { useState , useEffect } from 'react';

const budgetOptions = [
  { 
    level: 'Low', 
    range: '0 - 1000 MAD', 
    value: 'low',
    minValue: 0,
    maxValue: 1000
  },
  { 
    level: 'Medium', 
    range: '1000 - 2500 MAD', 
    value: 'medium',
    minValue: 1000,
    maxValue: 2500
  },
  { 
    level: 'High', 
    range: '2500+ MAD', 
    value: 'high',
    minValue: 2500,
    maxValue: Infinity
  }
];

const allocationCategories = [
  { 
    name: 'Transportation',
    icon: Car,
    key: 'transportation',
    description: 'Local travel, transfers, car rentals'
  },
  { 
    name: 'Accommodation',
    icon: Home,
    key: 'accommodation',
    description: 'Hotels, riads, desert camps'
  },
  { 
    name: 'Food & Dining',
    icon: Utensils,
    key: 'food',
    description: 'Restaurants, cafes, local cuisine'
  },
  { 
    name: 'Activities',
    icon: Compass,
    key: 'activities',
    description: 'Tours, experiences, entrance fees'
  }
];

export default function BudgetSelector({ onBudgetSelect }) {
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [allocations, setAllocations] = useState({
    transportation: 25,
    accommodation: 35,
    food: 20,
    activities: 20
  });

  const handleAllocationChange = (category, value) => {
    setAllocations((prevAllocations) => {
      const newAllocations = {
        ...prevAllocations,
        [category]: parseInt(value),
      };

      return newAllocations;
    });
  };

  const handleBudgetSelect = (budget) => {
      setSelectedBudget(budget);
    }

  useEffect(() => {
      if (selectedBudget) {
        onBudgetSelect({ budget: selectedBudget, allocations });
      }
    }, [selectedBudget, allocations, onBudgetSelect]);
  
  
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Existing budget selection */}
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            What is Your Budget?
          </h2>
          <p className="text-gray-600 text-sm">
            The budget is exclusively allocated for activities and dining purposes.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {budgetOptions.map((budget) => (
            <button
              key={budget.value}
              onClick={() => handleBudgetSelect(budget.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                flex flex-col items-center justify-center
                ${selectedBudget === budget.value 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              {selectedBudget === budget.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full">
                  <div className="w-full h-full bg-white rounded-full m-1"></div>
                </div>
              )}
              
              <DollarSign 
                className={`
                  mb-2 w-8 h-8
                  ${selectedBudget === budget.value 
                    ? 'text-indigo-600' 
                    : 'text-gray-400'}
                `}
              />
              
              <h3 
                className={`
                  font-semibold mb-1
                  ${selectedBudget === budget.value 
                    ? 'text-indigo-800' 
                    : 'text-gray-700'}
                `}
              >
                {budget.level}
              </h3>
              
              <p 
                className={`
                  text-xs
                  ${selectedBudget === budget.value 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'}
                `}
              >
                {budget.range}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget allocation section */}
      {selectedBudget && (
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              How would you like to allocate your budget?
            </h2>
            <p className="text-gray-600 text-sm">
              Adjust the sliders to set your spending priorities
            </p>
          </div>

          <div className="space-y-6">
            {allocationCategories.map(({ name, icon: Icon, key, description }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {allocations[key]}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={allocations[key]}
                  onChange={(e) => handleAllocationChange(key, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-gray-600">Total Allocation</span>
              <span className={`text-lg font-semibold ${
                Object.values(allocations).reduce((a, b) => a + b, 0) === 100 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {Object.values(allocations).reduce((a, b) => a + b, 0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}