import React from 'react';
import './EditButton.css';

export default function EditButton({ onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="edit-button"
    >
      <span className="edit-icon">✏️</span>
      Redaguoti profilį
    </button>
  );
}