import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Signup from './components/Signup.jsx';     
import Login from './components/Login.jsx';
import ProfileSetup from './components/ProfileSetup.jsx';
import Profile from './components/Profile.jsx';
import App from './App.jsx';
import CreateProfile from './components/CreateProfile.jsx'; // Import the CreateProfile component

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profile-setup" element={<ProfileSetup />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/create-profile" element={<CreateProfile />} /> {/* Add the new route here */}
  </Routes>
);

export default AppRoutes;