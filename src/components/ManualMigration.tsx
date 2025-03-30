import React, { useState } from 'react';
import { migrateSpecificEvent } from '../lib/auth';

const ManualMigration: React.FC = () => {
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMigration = async () => {
    setLoading(true);
    try {
      const migrationResult = await migrateSpecificEvent(oldId, newId);
      setResult(migrationResult);
    } catch (error) {
      setResult({ error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Manual Event Migration Tool</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Old Creator ID (Anonymous)</label>
          <input
            type="text"
            value={oldId}
            onChange={(e) => setOldId(e.target.value)}
            placeholder="Enter the old creator ID"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">New User ID</label>
          <input
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="Enter the new user ID"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <button
          onClick={handleMigration}
          disabled={loading || !oldId || !newId}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Migrating...' : 'Migrate Events'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium">Migration Result:</h3>
          <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ManualMigration;
