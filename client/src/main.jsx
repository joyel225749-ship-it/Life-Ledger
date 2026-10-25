import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles.css';

// On GitHub Pages the app is served under /Life-Ledger/.
// import.meta.env.BASE_URL is set by Vite's `base` config:
//   → '/Life-Ledger/' in production builds
//   → '/'            in local dev
const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
