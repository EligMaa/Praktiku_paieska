import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Import component CSS after index.css to ensure it has higher specificity
import './components/Header.css';
import AppRoutes from './AppRoutes.jsx';
import { UserProvider } from './components/UserContext.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
