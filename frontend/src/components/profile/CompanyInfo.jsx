import React from 'react';
import './CompanyInfo.css';

export default function CompanyInfo({ user }) {
  // Log for debugging
  console.log("CompanyInfo component received:", user);
  
  return (
    <div className="company-info">
      {user.pavadinimas && <p><strong>Pavadinimas:</strong> {user.pavadinimas}</p>}
      {user.aprasymas && <p><strong>Aprašymas:</strong> {user.aprasymas}</p>}
    </div>
  );
}