import React, { useState } from 'react';

const ProfileSetup = () => {
  const [role, setRole] = useState('');
  const [info, setInfo] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // POST info to backend, then redirect to dashboard
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            role: "studentas",
            vardas: "Jonas",
            pavarde: "Jonaitis",
            universitetas: "VU",
            igudziai: "JS, React",
            CV_failo_kelias: "/cv/jonas.pdf"
        })
    })
    .then(res => res.json())
    .then(data => console.log("Atsakymas iš serverio:", data))
    .catch(err => console.error("Klaida:", err));

            
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Set up your Profile</h2>
      <label>
        Choose Role:
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Select</option>
          <option value="studentas">Studentas</option>
          <option value="imone">Imone</option>
        </select>
      </label>
      {/* Add more fields for name, etc */}
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileSetup;