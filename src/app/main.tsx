import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/design-system/styles/globals.css';
import '@/core/i18n';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
