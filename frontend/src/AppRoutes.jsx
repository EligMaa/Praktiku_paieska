import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Signup from './components/Signup.jsx';     
import Login from './components/Login.jsx';
import ProfileSetup from './components/ProfileSetup.jsx';
import Profile from './components/Profile.jsx';
import App from './App.jsx';
import CreateProfile from './components/CreateProfile.jsx';
import EditProfile from './components/EditProfile.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

// Internship-related components
import InternshipList from './components/InternshipList.jsx';
import InternshipDetailPage from './components/InternshipDetailPage.jsx';
import MyApplications from './components/student/MyApplications.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profile-setup" element={<ProfileSetup />} />
  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
  <Route path="/create-profile" element={<PrivateRoute><CreateProfile /></PrivateRoute>} />
  <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
    
    {/* Internship routes */}
    <Route path="/internships" element={<InternshipList />} />
  <Route path="/internship/:id" element={<InternshipDetailPage />} />
    <Route path="/my-applications" element={<PrivateRoute requiredRole="studentas"><MyApplications /></PrivateRoute>} />
  </Routes>
);

export default AppRoutes;