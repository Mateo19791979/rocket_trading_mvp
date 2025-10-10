import React from 'react';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;