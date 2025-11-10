import React, { useState, useRef } from 'react';
import './CreateInternship.css';
import { INTERNSHIP_TYPES } from '../data/internshipTypes';
import {CITY_LIST} from '../data/cityList';
import { useEffect } from 'react';

export default function CreateInternshipNew({ open, onClose, company, onCreated }) {
  const [form, setForm] = useState({
    pavadinimas: '',
    aprasymas: '',
    lokacija: '',
    miestas: '',
    expires_at: '',
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
  const [suggestions, setSuggestions] = useState([]);

  // load previously saved addresses for autocomplete
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) setSuggestions(JSON.parse(saved).slice(0, 5));
  }, []);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'lokacija') {
      // build simple suggestions: previous addresses plus city name matches
      const input = value.trim().toLowerCase();
      const prev = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      const matchedPrev = prev.filter(a => a.toLowerCase().includes(input)).slice(0,3);
      const cityMatches = CITY_LIST.filter(c => c.toLowerCase().includes(input)).slice(0,3);
      // combine and dedupe
      const combined = Array.from(new Set([...matchedPrev, ...cityMatches]));
      setSuggestions(combined);
    }
  };

  const pickSuggestion = (s) => {
    // if suggestion is a city name, set miestas; otherwise set lokacija
    if (CITY_LIST.includes(s)) {
      setForm(prev => ({ ...prev, miestas: s }));
    } else {
      setForm(prev => ({ ...prev, lokacija: s }));
    }
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.pavadinimas || !form.aprasymas || !form.lokacija) {
      setError('Pavadinimas, aprašymas ir lokacija yra privalomi');
      return;
    }

    if (!form.miestas) {
      setError('Pasirinkite miestą');
      return;
    }

    if (!form.tipas) {
      setError('Pasirinkite praktikos sritį / tipą');
      return;
    }

    // optional expiration validation (if provided, must be a future date)
    if (form.expires_at) {
      const chosen = new Date(form.expires_at);
      const now = new Date();
      if (isNaN(chosen.getTime()) || chosen <= now) {
        setError('Pasirinkite galiojančią ateities datą pasibaigimui');
        return;
      }
      // disallow absurdly large years (>2100)
      if (chosen.getFullYear() > 2100) {
        setError('Pasirinkite datą ne vėlesnę nei 2100-12-31');
        return;
      }
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

    // Phone must start with +370 and be exactly 12 characters (including the +)
    const phoneStrictRe = /^\+370\d{8}$/;
    if (form.praktikos_vadovas_tel) {
      const phoneTrim = form.praktikos_vadovas_tel.trim();
      if (!phoneStrictRe.test(phoneTrim)) {
        setError('Telefono numeris turi prasidėti +370 ir būti 12 simbolių, pvz. +37069696996');
        return;
      }
    }

    const fd = new FormData();
    fd.append('pavadinimas', form.pavadinimas);
    fd.append('aprasymas', form.aprasymas);
    fd.append('lokacija', form.lokacija);
    fd.append('miestas', form.miestas);
    fd.append('expires_at', form.expires_at || '');
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
      // reset entire form in one go (include miestas and tipas)
      setForm({
        pavadinimas: '',
        aprasymas: '',
        lokacija: '',
        miestas: '',
        expires_at: '',
        tipas: '',
        praktikos_vadovas_vardas: '',
        praktikos_vadovas_pavarde: '',
        praktikos_vadovas_el_pastas: '',
        praktikos_vadovas_tel: '',
        reikalavimai: ''
      });
      if (fileRef.current) fileRef.current.value = null;
      // save address in localStorage for future autocomplete suggestions
      try {
        const saved = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        const entry = `${form.miestas} — ${form.lokacija}`.trim();
        if (entry && !saved.includes(entry)) {
          saved.unshift(entry);
          localStorage.setItem('savedAddresses', JSON.stringify(saved.slice(0, 20)));
        }
      } catch (e) {
        // ignore localStorage errors
      }
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
            <label>Adresas<br />
              <input name="lokacija" value={form.lokacija} onChange={handleChange} autoComplete="off" />
              {/* {suggestions.length > 0 && (
                <ul className="address-suggestions">
                  {suggestions.map(s => (
                    <li key={s} onClick={() => pickSuggestion(s)}>{s}</li>
                  ))}
                </ul>
              )} */}
            </label>

            <label>Miestas<br />
              <select name="miestas" value={form.miestas} onChange={handleChange}>
                <option value="">Pasirinkite</option>
                {CITY_LIST.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>Galioja iki (data)<br />
              <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} max="2100-12-31" />
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
              <input name="praktikos_vadovas_tel" value={form.praktikos_vadovas_tel} onChange={handleChange} maxLength={12} placeholder="+3706xxxxxxx" />
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
