'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  tests?: any;
  environment?: any;
  error?: string;
  details?: string;
}

export default function TestDbPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Failed to run test',
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      console.log('Products API response:', data);
      alert(`Products API ${response.ok ? 'SUCCESS' : 'FAILED'}: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Products API error:', error);
      alert(`Products API ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Database Connection'}
            </button>
            
            <button
              onClick={testProducts}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Products API'}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h2 className={`text-lg font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Tests Completed' : '❌ Tests Failed'}
                </h2>
                {result.error && (
                  <p className="text-red-600 mt-2">{result.error}: {result.details}</p>
                )}
              </div>

              {result.environment && (
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-800 mb-2">Environment Variables</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Supabase URL: {result.environment.hasUrl ? '✅ Set' : '❌ Missing'} {result.environment.urlPreview && `(${result.environment.urlPreview})`}</li>
                    <li>Anon Key: {result.environment.hasAnonKey ? '✅ Set' : '❌ Missing'}</li>
                    <li>Service Key: {result.environment.hasServiceKey ? '✅ Set' : '❌ Missing'}</li>
                  </ul>
                </div>
              )}

              {result.tests && (
                <div className="space-y-4">
                  {Object.entries(result.tests).map(([testName, testResult]: [string, any]) => (
                    <div key={testName} className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-gray-800 mb-2 capitalize">
                        {testName} Test {testResult.success ? '✅' : '❌'}
                      </h3>
                      {testResult.error && (
                        <p className="text-red-600 text-sm mb-2">Error: {testResult.error}</p>
                      )}
                      <pre className="text-xs bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Make sure your <code>.env.local</code> file is in the root directory (same level as package.json)</li>
            <li>Verify your Supabase project URL and keys are correct</li>
            <li>Check that your Supabase project has the database tables created</li>
            <li>Ensure Row Level Security (RLS) policies are properly configured</li>
            <li>Restart your development server after changing environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  );
}