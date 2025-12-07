import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const BackendTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    // Get the API base URL being used
    const url = import.meta.env.VITE_API_URL || '';
    setApiBaseUrl(url || '(empty - using relative URLs)');
  }, []);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
  };

  const testBackendConnection = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: Array<{
      name: string;
      url: string;
      method?: string;
      body?: any;
      expectedStatus?: number;
    }> = [
      {
        name: '1. Backend Health Check (Direct)',
        url: 'https://iru-chat-be-production.up.railway.app',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: '2. Backend API Endpoint (Direct)',
        url: 'https://iru-chat-be-production.up.railway.app/api',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: '3. Backend via Proxy (Frontend)',
        url: '/api',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: '4. Registration Endpoint (Direct)',
        url: 'https://iru-chat-be-production.up.railway.app/api/users/register',
        method: 'POST',
        body: {
          name: 'Test User',
          email: `test${Date.now()}@test.com`,
          password: 'test123'
        },
        expectedStatus: 201
      },
      {
        name: '5. Registration Endpoint (via Proxy)',
        url: '/api/users/register',
        method: 'POST',
        body: {
          name: 'Test User Proxy',
          email: `testproxy${Date.now()}@test.com`,
          password: 'test123'
        },
        expectedStatus: 201
      },
      {
        name: '6. Login Endpoint (Direct)',
        url: 'https://iru-chat-be-production.up.railway.app/api/users/login',
        method: 'POST',
        body: {
          email: 'nonexistent@test.com',
          password: 'wrong'
        },
        expectedStatus: 401 // Expected to fail with wrong credentials
      },
      {
        name: '7. Login Endpoint (via Proxy)',
        url: '/api/users/login',
        method: 'POST',
        body: {
          email: 'nonexistent@test.com',
          password: 'wrong'
        },
        expectedStatus: 401 // Expected to fail with wrong credentials
      }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      addResult({
        name: test.name,
        status: 'pending',
        message: 'Testing...'
      });

      try {
        const startTime = Date.now();
        const options: RequestInit = {
          method: test.method || 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (test.body) {
          options.body = JSON.stringify(test.body);
        }

        const response = await fetch(test.url, options);
        const endTime = Date.now();
        const duration = endTime - startTime;

        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        const isSuccess = test.expectedStatus 
          ? response.status === test.expectedStatus 
          : response.ok;

        updateResult(i, {
          status: isSuccess ? 'success' : 'error',
          message: isSuccess 
            ? `✅ Success (${response.status}) - ${duration}ms`
            : `❌ Failed (${response.status}) - Expected ${test.expectedStatus || '2xx'}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseData,
            url: test.url,
            method: test.method
          }
        });

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        updateResult(i, {
          status: 'error',
          message: `❌ Error: ${error.message}`,
          details: {
            error: error.message,
            stack: error.stack,
            url: test.url,
            method: test.method
          }
        });
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text mb-2">Backend Connection Test</h1>
              <p className="text-text-secondary">
                This page tests the connection between frontend and backend
              </p>
            </div>

            <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
              <h2 className="text-lg font-semibold text-text mb-2">Configuration</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-text-secondary">API Base URL:</span>{' '}
                  <code className="bg-bg p-1 rounded text-text">{apiBaseUrl}</code>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Frontend URL:</span>{' '}
                  <code className="bg-bg p-1 rounded text-text">{window.location.origin}</code>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Backend URL:</span>{' '}
                  <code className="bg-bg p-1 rounded text-text">https://iru-chat-be-production.up.railway.app</code>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Button
                onClick={testBackendConnection}
                disabled={isRunning}
                className="btn-hero"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run Connection Tests'
                )}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text">Test Results</h2>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-semibold text-text">{result.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-bg rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Troubleshooting Tips</h3>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>If direct backend tests fail, check if backend server is running on port 5000</li>
                    <li>If proxy tests fail, restart the frontend dev server</li>
                    <li>Check browser console and backend terminal for error messages</li>
                    <li>Verify CORS settings in backend if you see CORS errors</li>
                    <li>Check network tab in browser DevTools to see actual requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BackendTest;


