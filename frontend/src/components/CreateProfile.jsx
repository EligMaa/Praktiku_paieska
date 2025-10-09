import React, { useState } from 'react';

export default function CreateProfile() {
  const [form, setForm] = useState({
    role: '',
    vardas: '',
    pavarde: '',
    universitetas: '',
    igudziai: '',
    CV: null,
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.role || !form.vardas || !form.pavarde || !form.universitetas || !form.igudziai || !form.CV) {
      setError('Visi laukai privalomi!');
      return;
    }
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Nepavyko išsaugoti profilio');
      alert('Profilis sukurtas!');
      // Optionally redirect to profile or dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '40px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>Sukurti profilį</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <label>
        Rolė:
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="">Pasirinkite</option>
          <option value="studentas">Studentas</option>
          <option value="imone">Įmonė</option>
        </select>
      </label>
      <label>
        Vardas:
        <input name="vardas" value={form.vardas} onChange={handleChange} required />
      </label>
      <label>
        Pavardė:
        <input name="pavarde" value={form.pavarde} onChange={handleChange} required />
      </label>
      <label>
        Universitetas:
        <input name="universitetas" value={form.universitetas} onChange={handleChange} required />
      </label>
      <label>
        Įgūdžiai:
        <input name="igudziai" value={form.igudziai} onChange={handleChange} required />
      </label>
      <label>
        CV failas:
        <input type="file" name="CV" accept=".pdf,.doc,.docx" onChange={handleChange} required />
      </label>
      <button type="submit">Išsaugoti profilį</button>
    </form>
  );
}
