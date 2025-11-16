import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Logo.css';

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div 
      className="logo-container"
      onClick={() => navigate("/")}
    >
      <img src={logo} alt="InternLink Logo" className="logo-image" />
    </div>
  );
}
