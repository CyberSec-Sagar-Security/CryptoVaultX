/**
 * Download Test Component
 * Component to test and validate download/decrypt functionality
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { downloadFileEnhanced } from '../lib/enhancedDownload';

interface TestFile {
  id: string;
  filename: string;
  is_encrypted: boolean;
  size: number;
}

const DownloadTestComponent: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const runDownloadTest = async () => {
    setTesting(true);
    setProgress(0);
    setStatus('Starting test...');
    setResults(null);

    try {
      // Test 1: Check authentication
      setStatus('Checking authentication...');
      setProgress(10);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Test 2: Fetch file list
      setStatus('Fetching file list...');
      setProgress(20);
      
      const listResponse = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!listResponse.ok) {
        throw new Error(`File list API failed: ${listResponse.status}`);
      }

      const files = await listResponse.json();
      
      if (!files || files.length === 0) {
        throw new Error('No files found for testing');
      }

      // Test 3: Find test file
      setStatus('Finding test file...');
      setProgress(30);
      
      const testFile = files.find((f: TestFile) => f.is_encrypted) || files[0];
      
      if (!testFile) {
        throw new Error('No suitable test file found');
      }

      // Test 4: Download test
      setStatus(`Testing download: ${testFile.filename}`);
      setProgress(40);
      
      await downloadFileEnhanced(testFile, (fileProgress, fileStatus) => {
        setProgress(40 + (fileProgress * 0.6)); // Map to 40-100% range
        setStatus(`${fileStatus}: ${testFile.filename}`);
      });

      // Test completed
      setStatus('Test completed successfully!');
      setProgress(100);
      setResults({
        success: true,
        message: 'Download and decrypt functionality is working correctly!',
        details: {
          testedFile: testFile.filename,
          fileSize: testFile.size,
          encrypted: testFile.is_encrypted
        }
      });

    } catch (error) {
      console.error('Download test failed:', error);
      setResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) }
      });
      setStatus('Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Download Test
      </h3>
      
      <div className="space-y-4">
        <Button 
          onClick={runDownloadTest} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Test Download Functionality
            </>
          )}
        </Button>

        {testing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">{status}</p>
          </div>
        )}

        {results && (
          <Alert className={results.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <div className="flex items-start gap-2">
              {results.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className={results.success ? 'text-green-800' : 'text-red-800'}>
                  {results.message}
                </AlertDescription>
                {results.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DownloadTestComponent;