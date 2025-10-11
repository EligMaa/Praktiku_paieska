import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Signup from './components/Signup.jsx';     
import Login from './components/Login.jsx';
import ProfileSetup from './components/ProfileSetup.jsx';
import Profile from './components/Profile.jsx';
import App from './App.jsx';
import CreateProfile from './components/CreateProfile.jsx';
import EditProfile from './components/EditProfile.jsx';

// Internship-related components
import InternshipList from './components/InternshipList.jsx';
import MyApplications from './components/student/MyApplications.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profile-setup" element={<ProfileSetup />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/create-profile" element={<CreateProfile />} />
    <Route path="/edit-profile" element={<EditProfile />} />
    
    {/* Internship routes */}
    <Route path="/internships" element={<InternshipList />} />
    <Route path="/my-applications" element={<MyApplications />} />
  </Routes>
);

export default AppRoutes;