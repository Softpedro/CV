// app/main.tsx — entry. Monta React; React monta el canvas del engine.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
