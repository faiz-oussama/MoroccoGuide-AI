import axios from 'axios';
import { useEffect, useState } from 'react';

export function useFlightData(origin, destination) {
  const [flightData, setFlightData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlightData = async () => {
      if (!origin || !destination) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First get the config (markets, currencies, etc)
        const configOptions = {
          method: 'GET',
          url: 'https://sky-scanner3.p.rapidapi.com/get-config',
          headers: {
            'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
            'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
          }
        };
        
        const configResponse = await axios.request(configOptions);
        
        // Then search for flights
        const searchOptions = {
          method: 'GET',
          url: 'https://sky-scanner3.p.rapidapi.com/flights-search-one-way',
          params: {
            origin: origin.split(',')[0].trim(),
            destination: destination.split(',')[0].trim(),
            date: new Date().toISOString().split('T')[0],
            adults: '1',
            currency: 'USD',
            market: 'en-US',
            limit: '5'
          },
          headers: {
            'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
            'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
          }
        };
        
        const searchResponse = await axios.request(searchOptions);
        setFlightData(searchResponse.data);
      } catch (err) {
        console.error("Error fetching flight data:", err);
        setError(err);
        // Use fallback data for demo/development
        setFlightData({
          flights: [
            {
              carrier: { name: "Royal Air Maroc" },
              price: { amount: 220, currency: "EUR" },
              duration: { hours: 2, minutes: 15 },
              departure: { time: "08:30", airport: "RAK" },
              arrival: { time: "10:45", airport: "CMN" }
            },
            {
              carrier: { name: "Air Arabia" },
              price: { amount: 175, currency: "EUR" },
              duration: { hours: 1, minutes: 45 },
              departure: { time: "14:20", airport: "RAK" },
              arrival: { time: "16:05", airport: "CMN" }
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlightData();
  }, [origin, destination]);

  return { flightData, isLoading, error };
}