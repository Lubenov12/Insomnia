'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  timestamp?: string;
  tests?: any;
  error?: string;
  details?: string;
}

export default function TestConnectionPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: 'Failed to run connection test',
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testProductsAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Products API Success!\nFound ${data.products?.length || 0} products`);
      } else {
        alert(`❌ Products API Failed!\nError: ${data.error}\nDetails: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      alert(`❌ Products API Error!\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleProduct = async () => {
    setLoading(true);
    try {
      const sampleProduct = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 29.99,
        image_url: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
        category: 'test',
        stock_quantity: 10,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token', // This will fail auth, but we can see the error
        },
        body: JSON.stringify(sampleProduct),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Product Created Successfully!\n${JSON.stringify(data, null, 2)}`);
      } else {
        alert(`❌ Product Creation Failed!\nStatus: ${response.status}\nError: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Product Creation Error!\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={runConnectionTest}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Database Connection'}
              </button>
              
              <button
                onClick={testProductsAPI}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Products API'}
              </button>

              <button
                onClick={createSampleProduct}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Test Create Product'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            {result?.tests?.environment && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${result.tests.environment.hasUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Supabase URL: {result.tests.environment.hasUrl ? 'Set' : 'Missing'}</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${result.tests.environment.hasAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Anon Key: {result.tests.environment.hasAnonKey ? 'Set' : 'Missing'}</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${result.tests.environment.hasServiceKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>Service Key: {result.tests.environment.hasServiceKey ? 'Set' : 'Missing'}</span>
                </div>
                {result.tests.environment.urlPreview && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    URL Preview: {result.tests.environment.urlPreview}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className={`p-4 rounded mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className={`text-lg font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Database Connection Successful' : '❌ Database Connection Failed'}
              </h2>
              {result.timestamp && (
                <p className="text-sm text-gray-600 mt-1">Last tested: {new Date(result.timestamp).toLocaleString()}</p>
              )}
              {result.error && (
                <div className="mt-3">
                  <p className="text-red-600 font-medium">{result.error}</p>
                  {result.details && (
                    <pre className="text-xs bg-red-100 p-2 rounded mt-2 overflow-auto">{result.details}</pre>
                  )}
                </div>
              )}
            </div>

            {result.tests && (
              <div className="space-y-6">
                {Object.entries(result.tests).map(([testName, testResult]: [string, any]) => (
                  <div key={testName} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 capitalize flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${testResult.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {testName} Test
                    </h3>
                    
                    {testResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                        <p className="text-red-700 text-sm font-medium">Error: {testResult.error}</p>
                      </div>
                    )}
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-auto max-h-40">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">Troubleshooting Guide</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>1. Environment Variables:</strong> Ensure your .env.local file is in the root directory with correct Supabase credentials</p>
            <p><strong>2. Database Tables:</strong> Run the migration files in your Supabase SQL Editor to create the required tables</p>
            <p><strong>3. Row Level Security:</strong> Make sure RLS policies are properly configured for public access to products</p>
            <p><strong>4. Network Issues:</strong> Check if your Supabase project is active and accessible</p>
            <p><strong>5. API Keys:</strong> Verify your anon key has the correct permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}