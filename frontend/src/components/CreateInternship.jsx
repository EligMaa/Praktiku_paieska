import React, { useState } from 'react';
import './CreateInternship.css';

export default function CreateInternship({ open, onClose, company }) {
  const [form, setForm] = useState({
    pavadinimas: '',
    aprasymas: '',
    lokacija: '',
    praktikos_vadovas_vardas: '',
    praktikos_vadovas_pavarde: '',
    praktikos_vadovas_el_pastas: '',
    praktikos_vadovas_tel: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.pavadinimas || !form.aprasymas) {
      setError('Pavadinimas ir aprašymas yra privalomi');
      return;
    }

    const payload = {
      imones_id: company?.id || null,
      pavadinimas: form.pavadinimas,
      aprasymas: form.aprasymas,
      lokacija: form.lokacija,
      praktikos_vadovas: {
        vardas: form.praktikos_vadovas_vardas,
        pavarde: form.praktikos_vadovas_pavarde,
        el_pastas: form.praktikos_vadovas_el_pastas,
        tel_numeris: form.praktikos_vadovas_tel,
      }
    };

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }

      setSuccess('Praktikos skelbimas sukurtas (serveris patvirtino)');
      setForm({
        pavadinimas: '', aprasymas: '', lokacija: '', praktikos_vadovas_vardas: '', praktikos_vadovas_pavarde: '', praktikos_vadovas_el_pastas: '', praktikos_vadovas_tel: ''
      });
    } catch (err) {
      console.error('Create internship failed', err);
      setError(err.message || 'Klaida siunčiant skelbimą');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-internship-backdrop">
      <div className="create-internship-modal">
        <h3>Sukurti praktiką</h3>
        {company?.name && (
          <div className="create-internship-company">
            <strong>Įmonė:</strong> {company.name}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="create-internship-row">
            <label>Pavadinimas<br />
              <input name="pavadinimas" value={form.pavadinimas} onChange={handleChange} />
            </label>
          </div>

          <div className="create-internship-row">
            <label>Aprašymas<br />
              <textarea name="aprasymas" value={form.aprasymas} onChange={handleChange} rows={4} />
            </label>
          </div>

          <div className="create-internship-row">
            <label>Lokacija<br />
              <input name="lokacija" value={form.lokacija} onChange={handleChange} />
            </label>
          </div>

          <hr />
          <div className="create-internship-subtitle">Praktikos vadovas</div>

          <div className="create-internship-row">
            <label>Vardas<br />
              <input name="praktikos_vadovas_vardas" value={form.praktikos_vadovas_vardas} onChange={handleChange} />
            </label>
            <label>Pavardė<br />
              <input name="praktikos_vadovas_pavarde" value={form.praktikos_vadovas_pavarde} onChange={handleChange} />
            </label>
          </div>

          <div className="create-internship-row">
            <label>El. paštas<br />
              <input name="praktikos_vadovas_el_pastas" value={form.praktikos_vadovas_el_pastas} onChange={handleChange} />
            </label>
            <label>Tel. numeris<br />
              <input name="praktikos_vadovas_tel" value={form.praktikos_vadovas_tel} onChange={handleChange} />
            </label>
          </div>

          {error && <div className="create-internship-error">{error}</div>}
          {success && <div className="create-internship-success">{success}</div>}

          <div className="create-internship-buttons">
            <button type="submit" disabled={loading}>{loading ? 'Kuriama...' : 'Sukurti'}</button>
            <button type="button" onClick={onClose}>Atšaukti</button>
          </div>
        </form>
      </div>
    </div>
  );
}
