import React from 'react';
import './BasicInfo.css';

export default function BasicInfo({ user }) {
  // Log to check if user data is coming through
  console.log("BasicInfo component received user:", user);
  
  return (
    <div className="basic-info">
      <p><strong>Vardas:</strong> {user.vardas || user.name || user.given_name || 'Nenurodyta'}</p>
      {user.pavarde && <p><strong>Pavardė:</strong> {user.pavarde}</p>}
      <p><strong>Gmail:</strong> {user.email || 'Nenurodyta'}</p>
      <p><strong>Rolė:</strong> {user.role === 'studentas' ? 'Studentas' : 
                          user.role === 'imone' ? 'Įmonė' : 
                          'Nenurodyta'}</p>
    </div>
  );
}