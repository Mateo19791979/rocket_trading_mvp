import React from 'react';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './contexts/AuthContext';
import AIStabilityGuard from './components/AIStabilityGuard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AIStabilityGuard>
          <Routes />
        </AIStabilityGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;