import { useState, useEffect } from 'react';
import axios from 'axios';

export function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Use full URL to the backend
        const response = await axios.get('http://localhost:5000/test-db', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setConnectionStatus(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Connection test error:', error);
        setError(error.message);
        setConnectionStatus({
          status: 'error',
          message: error.message
        });
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) return <div>Testing database connection...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`p-4 rounded ${
      connectionStatus.status === 'success' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      <h2>Database Connection Test</h2>
      <pre>{JSON.stringify(connectionStatus, null, 2)}</pre>
    </div>
  );
} 