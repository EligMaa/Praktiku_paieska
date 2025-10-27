import React, { useState, useRef } from 'react';
import './CreateInternship.css';
import { INTERNSHIP_TYPES } from '../data/internshipTypes';

export default function CreateInternshipNew({ open, onClose, company, onCreated }) {
  const [form, setForm] = useState({
    pavadinimas: '',
    aprasymas: '',
    lokacija: '',
    tipas: '',
    praktikos_vadovas_vardas: '',
    praktikos_vadovas_pavarde: '',
    praktikos_vadovas_el_pastas: '',
    praktikos_vadovas_tel: '',
    reikalavimai: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.pavadinimas || !form.aprasymas || !form.lokacija) {
      setError('Pavadinimas, aprašymas ir lokacija yra privalomi');
      return;
    }

    if (!form.tipas) {
      setError('Pasirinkite praktikos sritį / tipą');
      return;
    }

    const nameRe = /^[A-Za-z '\-]+$/;
    if (!nameRe.test(form.praktikos_vadovas_vardas || '')) {
      setError('Vadovo vardas turi būti tik raidės');
      return;
    }
    if (!nameRe.test(form.praktikos_vadovas_pavarde || '')) {
      setError('Vadovo pavardė turi būti tik raidės');
      return;
    }

    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(form.praktikos_vadovas_el_pastas || '')) {
      setError('Neteisingas vadovo el. pašto adresas');
      return;
    }

    const phoneRe = /^[0-9+()\-\s]*$/;
    if (form.praktikos_vadovas_tel && !phoneRe.test(form.praktikos_vadovas_tel)) {
      setError('Telefonas gali turėti tik skaičius, tarpus, +, -, ( )');
      return;
    }

    const fd = new FormData();
    fd.append('pavadinimas', form.pavadinimas);
    fd.append('aprasymas', form.aprasymas);
    fd.append('lokacija', form.lokacija);
  fd.append('tipas', form.tipas);
    fd.append('reikalavimai', form.reikalavimai || '');
    fd.append('vadovas_vardas', form.praktikos_vadovas_vardas);
    fd.append('vadovas_pavarde', form.praktikos_vadovas_pavarde);
    fd.append('vadovas_el_pastas', form.praktikos_vadovas_el_pastas);
    fd.append('vadovas_telefonas', form.praktikos_vadovas_tel || '');
    if (company?.id) fd.append('imones_id', company.id);

    const file = fileRef.current?.files?.[0];
    if (file) fd.append('vadovas_CV', file);

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }

      const created = await res.json();
      setSuccess('Praktikos skelbimas sukurtas');
      setToast('Praktikos skelbimas sukurtas');
      setForm({ pavadinimas: '', aprasymas: '', lokacija: '', praktikos_vadovas_vardas: '', praktikos_vadovas_pavarde: '', praktikos_vadovas_el_pastas: '', praktikos_vadovas_tel: '', reikalavimai: '' });
  // reset tipas as well
  setForm(prev => ({ ...prev, tipas: '' }));
      if (fileRef.current) fileRef.current.value = null;
      if (onCreated) onCreated(created);
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1400);
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
            <label>Sritys / Tipas<br />
              <select name="tipas" value={form.tipas} onChange={handleChange}>
                <option value="">Pasirinkite</option>
                {INTERNSHIP_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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

          <div className="create-internship-row">
            <label>Reikalavimai (neprivaloma)<br />
              <textarea name="reikalavimai" value={form.reikalavimai} onChange={handleChange} rows={2} />
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

          <div className="create-internship-row">
            <label>Vadovo CV (PDF/DOC/DOCX)<br />
              <input ref={fileRef} type="file" name="vadovas_CV" accept=".pdf,.doc,.docx" />
            </label>
          </div>

          {error && <div className="create-internship-error">{error}</div>}
          {success && <div className="create-internship-success">{success}</div>}

          <div className="create-internship-buttons">
            <button className="primary" type="submit" disabled={loading}>{loading ? 'Kuriama...' : 'Sukurti'}</button>
            <button type="button" onClick={onClose}>Atšaukti</button>
          </div>
        </form>
        {toast && <div className="create-internship-toast">{toast}</div>}
      </div>
    </div>
  );
}
