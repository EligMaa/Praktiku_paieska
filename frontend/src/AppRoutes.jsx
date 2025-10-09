import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup.jsx';     
import Login from './components/Login.jsx';
import ProfileSetup from './components/ProfileSetup.jsx';
import App from './App.jsx';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
    </Routes>
  </Router>
);

export default AppRoutes;