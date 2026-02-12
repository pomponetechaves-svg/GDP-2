import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple UUID generator for browser environment without external deps issues in some sandboxes
// In a real project, we would just use the 'uuid' package imported in App.tsx
// But ensure it works here if package resolution is tricky
if (!window.crypto || !window.crypto.randomUUID) {
  // @ts-ignore
  window.crypto = window.crypto || {};
  // @ts-ignore
  window.crypto.randomUUID = function() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);