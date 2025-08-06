import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Check backend connection
    const checkBackend = async () => {
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/`);
        if (response.ok) {
          const data = await response.json();
          setBackendStatus(`✅ ${data.message}`);
        } else {
          setBackendStatus('❌ Backend not responding');
        }
      } catch (_error) {
        setBackendStatus('❌ Backend connection failed');
      }
    };

    checkBackend();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>CryptoVault 🔐</h1>
      <div className="card">
        <p>Backend Status: {backendStatus}</p>
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Secure File Sharing System - Phase 1 Complete!
      </p>
    </>
  );
}

export default App;
