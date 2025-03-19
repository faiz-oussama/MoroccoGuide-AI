import { useState } from 'react';
import api from '@/utils/api';

export function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the api utility instead of axios with hardcoded URL
      const response = await api.get('/test-db');
      
      setConnectionStatus(response.data);
    } catch (err) {
      console.error('Database test failed:', err);
      setError(err.message || 'An error occurred while testing the database');
      setConnectionStatus({
        status: 'error',
        message: err.message || 'An error occurred while testing the database'
      });
    } finally {
      setLoading(false);
    }
  };

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