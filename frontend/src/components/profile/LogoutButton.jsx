import React from 'react';
import './LogoutButton.css';

export default function LogoutButton({ onLogout }) {
  return (
    <button 
      onClick={onLogout} 
      className="logout-button"
    >
      Atsijungti
    </button>
  );
}