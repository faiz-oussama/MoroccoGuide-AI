import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { motion } from 'framer-motion';
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import AccommodationPreferences from './AccommodationPreferences';
import ActivityPreferences from './ActivityPreferences';
import BudgetSelector from './BudgetSelector';
import { LoadingIndicator } from './LoadingIndicator';
import TransportationPreferences from './TransportationPreferences';


function CreateTrip() {
    const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 20),
  });
  const navigate = useNavigate();
  const [budgetData, setBudgetData] = useState(null);
  const [place, setPlace] = useState(null);
  const [DepartureCity , setDepartureCity] = useState(null);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [isDepartureLoading, setIsDepartureLoading] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(null);
  const [selectedTransportation, setSelectedTransportation] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState(null);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const commonInputStyles = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      border: state.isFocused ? '2px solid #6366F1' : '1px solid #E5E7EB',
      borderRadius: '1rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
      backgroundColor: 'white',
      padding: '0.25rem',
      transition: 'all 0.2s ease',
      '&:hover': {
      cursor: 'text',
      borderColor: '#6366F1'
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'none'
    }
    }),
    input: (provided) => ({
      ...provided,
      color: '#111827',
      fontSize: '1rem',
      fontWeight: '500',
      padding: '0.5rem',
      margin: '0',
      '& input': {
      padding: '0 !important',
      margin: '0 !important',
      textIndent: '0 !important',
      textAlign: 'left !important',
      cursor: 'text !important',
      caretColor: '#6366F1 !important',
      outline: 'none !important',
      boxShadow: 'none !important',
      border: 'none !important',
      background: 'transparent !important',
      letterSpacing: 'normal !important',
      '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important'
      }
    }
    })
  };

  const searchOptions = {
    componentRestrictions: { country: 'ma' },
    types: ['(cities)']
  };

  useEffect(() => {
    if (isDestinationLoading) {
      const timer = setTimeout(() => {
        setIsDestinationLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDestinationLoading]);

  useEffect(() => {
    if (isDepartureLoading) {
      const timer = setTimeout(() => {
        setIsDepartureLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDepartureLoading]);

  const handleDestinationChange = (inputValue) => {
    if (inputValue) {
      setIsDestinationLoading(true);
      const selectedValue = inputValue.label || inputValue;
      setPlace(selectedValue);
      console.log('Destination:', selectedValue);
    }
  };

  const handleDepartureChange = (inputValue) => {
    if (inputValue) {
      setIsDepartureLoading(true);
      const selectedValue = inputValue.label || inputValue;
      setDepartureCity(selectedValue);
      console.log('Departure:', selectedValue);
    }
  };

  const handleNumberOfPeopleChange = (numberOfPeople) => {
    setNumberOfPeople(numberOfPeople);
    console.log('Number of people:', numberOfPeople.value);
  }
  const handleBudgetSelection = useCallback((budgetData) => {
    console.log("Budget Data Received:", budgetData);
    setBudgetData(budgetData);
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate); 
    if (newDate?.from && newDate?.to) {
      const tripDuration = Math.ceil(
        (newDate.to.getTime() - newDate.from.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log('Trip duration:', tripDuration, 'days');
    }
  };

  const handleTransportationSelection = (transportationData) => {
    setSelectedTransportation(transportationData);
    console.log('Transportation preferences:', transportationData);
  };

  const handleAccommodationSelection = (accommodationData) => {
    setSelectedAccommodation(accommodationData);
    console.log('Accommodation preferences:', accommodationData);
  };

  const handleActivitySelect = (activityData) => {
    setSelectedActivities(activityData);
    console.log('Activity preferences:', activityData);
  };

  // Add this new function after your existing handlers
  const handleCreateTrip = async () => {
    setIsGenerating(true);
    
    // Add validation for required fields
    if (!place || !numberOfPeople || !date.from || !date.to || !budgetData) {
      console.error('Missing required fields');
      setIsGenerating(false);
      // Add error notification here
      return;
    }
  
  
    const tripData = {
      origin: DepartureCity?.label || DepartureCity,
      destination: place?.label || place,
      travelers: {
        count: numberOfPeople?.value,
        label: numberOfPeople?.label
      },
      dates: {
        startDate: format(date.from, "LLL dd, y"),
        endDate: format(date.to, "LLL dd, y"),
        duration: Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
      },
      budget: {
        level: budgetData?.budget,
        allocations: {
          transportation: budgetData?.allocations?.transportation || 0,
          accommodation: budgetData?.allocations?.accommodation || 0,
          food: budgetData?.allocations?.food || 0,
          activities: budgetData?.allocations?.activities || 0
        }
      },
      transportation: {
        modes: selectedTransportation?.transportModes || {},
        routePreference: selectedTransportation?.routePreference || ''
      },
      accommodation: {
        type: selectedAccommodation?.type || '',
        rating: selectedAccommodation?.rating || 0,
        amenities: selectedAccommodation?.amenities || []
      },
      activities: {
        interests: selectedActivities?.interests || [],
        pace: selectedActivities?.pace || '',
        schedule: {
          restDays: selectedActivities?.schedule?.restDays || '',
          specialRequirements: selectedActivities?.schedule?.specialRequirements || ''
        }
      }
    };
  
  
    try {
      const response = await fetch('http://localhost:5000/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      });
  
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate trip plan');
      }
  
      const result= await response.json();
      console.log('Received trip plan:', result);
      navigate('/trip-results', { 
        state: { tripPlan: result.data , savedTrip: false }
      });
      
    } catch (error) {
      console.error('Error generating trip plan:', error);
      // Add error state and user notification
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 py-24"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sahara-red to-chefchaouen-blue sm:text-6xl md:text-7xl tracking-tight">
            Experience the Magic of
            <span className="block mt-2">Authentic Morocco</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From ancient medinas to stunning desert landscapes, let us craft your personalized Moroccan journey with local insights and authentic experiences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 w-full backdrop-blur-sm bg-white/70 p-10 md:p-16 lg:p-20"
        >
          <div className="max-w-3xl mx-auto space-y-5">

            {/* First Section: General Trip Information */}
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-indigo-600 tracking-wide uppercase mb-2 block">
                Step 1: Trip Details
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Tell Us About Your Trip
              </h2>
              <p className="text-gray-600 text-base">
                Let's start with the essential details to craft your perfect Moroccan experience
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which Moroccan city interests you?
            </label>
            <div className="relative">
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                apiOptions={{ language: 'en' }}
                autocompletionRequest={searchOptions}
                selectProps={{
                  value: place,
                  onChange: (option) => {
                    setIsDestinationLoading(true);
                    setPlace(option);
                    console.log('Selected place:', option);
                  },
                  styles: commonInputStyles,
                  placeholder: 'Discover Marrakech, Fes, Casablanca, and more...',
                  isLoading: isDestinationLoading,
                  onInputChange: handleDestinationChange,
                  components: {
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    LoadingIndicator: () => isDestinationLoading ? <LoadingIndicator /> : null
                  }
                }}
              />
            </div>

            <div className="space-y-8">
              <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Departure City</Label>
              <div className="relative">
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                apiOptions={{ language: 'en' }}
                selectProps={{
                  value: DepartureCity,
                  onChange: (option) => {
                    setIsDepartureLoading(true);
                    setDepartureCity(option);
                    console.log('Selected departure:', option);
                  },
                  styles: commonInputStyles,
                  placeholder: 'From where you want to go?',
                  isLoading: isDepartureLoading,
                  onInputChange: handleDepartureChange,
                  components: {
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    LoadingIndicator: () => isDepartureLoading ? <LoadingIndicator /> : null
                  }
                }}
              />
            </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Number of people</Label>
                <Select
                  styles={commonInputStyles}
                  options={[
                    { value: '1', label: '1 person' },
                    { value: '2', label: '2 people' },
                    { value: '3', label: '3 people' },
                    { value: '4', label: '4 people' },
                    { value: '5', label: '5 people' },
                    { value: '6', label: '6+ people' }
                  ]}
                  placeholder="Select number of travelers"
                  value={numberOfPeople}
                  onChange={handleNumberOfPeopleChange}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Travel dates</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        "min-h-[55px] p-3 rounded-2xl border border-gray-200",
                        "hover:border-indigo-500 hover:border-2",
                        "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10",
                        "transition-all duration-200",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick your travel dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 border-2 rounded-2xl shadow-lg" 
                    align="start"
                  >
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={handleDateChange}
                      numberOfMonths={2}
                      className="rounded-2xl p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              

              {/* Second Section: Budget Planning */}        
              
                  <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white/70 px-4 text-sm text-gray-500">
                        Budget Planning
                      </span>
                    </div>
                  </div>
                  <BudgetSelector onBudgetSelect={handleBudgetSelection} />

                  {/* Third Section: Transportation and Accommodation Preferences */}
                  <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white/70 px-4 text-sm text-gray-500">
                          Transportation Preferences
                        </span>
                      </div>
                  </div>
                  <TransportationPreferences onTransportationSelect={handleTransportationSelection} />
                  


                  {/* Fourth Section: Accommodation Preferences */}
                  <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white/70 px-4 text-sm text-gray-500">
                          Accommodation Preferences
                        </span>
                      </div>
                  </div>
                  <AccommodationPreferences onAccommodationSelect={handleAccommodationSelection} />


                  {/* Fifth Section: Activity Preferences */}
                  <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white/70 px-4 text-sm text-gray-500">
                          Activity Preferences
                        </span>
                      </div>
                  </div>
                  <ActivityPreferences onActivitySelect={handleActivitySelect} />
                
              {place && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6"
                >
                  <button
                    type="button"
                    onClick={handleCreateTrip}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingIndicator className="mr-2" />
                        Generating Your Trip Plan...
                      </>
                    ) : (
                      'Create My Moroccan Journey'
                    )}
                  </button>
                </motion.div>
              )}
              
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

CreateTrip.propTypes = {
};

export default CreateTrip;