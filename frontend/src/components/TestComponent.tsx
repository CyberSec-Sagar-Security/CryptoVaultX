import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      color: '#333',
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 10000,
      borderRadius: '8px',
      fontSize: '12px'
    }}>
      ✅ React App is Loading Correctly
    </div>
  );
};

export default TestComponent;
