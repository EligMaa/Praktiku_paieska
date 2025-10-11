import React from 'react';
import './ProfileHeader.css';

export default function ProfileHeader({ user }) {
  return (
    <div className="profile-header">
      <h1>Profilis</h1>
      {user.picture && (
        <img 
          src={user.picture} 
          alt="Google profile" 
          className="profile-picture" 
        />
      )}
    </div>
  );
}