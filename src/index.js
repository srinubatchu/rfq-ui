import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ✅ import your contexts
import { LoaderProvider } from './context/LoaderContext';
import { ToastProvider } from './context/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap App with global providers */}
    <LoaderProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LoaderProvider>
  </React.StrictMode>
);
reportWebVitals();
