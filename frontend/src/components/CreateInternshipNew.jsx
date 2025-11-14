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
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

 
  const validateField = (name, value) => {
    
    const errs = { ...fieldErrors };
    const trimmed = typeof value === 'string' ? value.trim() : value;

    const setErr = (key, msg) => { errs[key] = msg; };
    const delErr = (key) => { if (errs[key]) delete errs[key]; };

    if (name === 'pavadinimas') {
      if (!trimmed) setErr('pavadinimas', 'Pavadinimas yra privalomas');
      else if (trimmed.length > 50) setErr('pavadinimas', 'Pavadinimas negali viršyti 50 simbolių');
      else delErr('pavadinimas');
    }
    if (name === 'aprasymas') {
      if (!trimmed) setErr('aprasymas', 'Aprašymas yra privalomas');
      else if (trimmed.length > 1000) setErr('aprasymas', 'Aprašymas negali viršyti 1000 simbolių');
      else delErr('aprasymas');
    }
    if (name === 'lokacija') {
      if (!trimmed) setErr('lokacija', 'Adresas yra privalomas');
      else if (trimmed.length > 50) setErr('lokacija', 'Adresas negali viršyti 50 simbolių');
      else if (!/\d/.test(trimmed)) setErr('lokacija', 'Adresas turi turėti namo numerį');
      else delErr('lokacija');
    }
    if (name === 'reikalavimai') {
      if (!trimmed) setErr('reikalavimai', 'Reikalavimai yra privalomi');
      else if (trimmed.length > 1000) setErr('reikalavimai', 'Reikalavimai negali viršyti 1000 simbolių');
      else delErr('reikalavimai');
    }
    if (name === 'miestas') {
      if (!trimmed) setErr('miestas', 'Pasirinkite miestą'); else delErr('miestas');
    }
    if (name === 'tipas') {
      if (!trimmed) setErr('tipas', 'Pasirinkite praktikos sritį / tipą'); else delErr('tipas');
    }
    if (name === 'expires_at') {
      if (!trimmed) {
        setErr('expires_at', 'Pasirinkite galiojimo datą');
      } else {
        const dt = new Date(trimmed);
        const now = new Date();
        if (isNaN(dt.getTime())) setErr('expires_at', 'Neteisinga data');
        else if (dt <= now) setErr('expires_at', 'Pasirinkite ateities datą');
        else if (dt.getFullYear() > 2100) setErr('expires_at', 'Pasirinkite datą ne vėlesnę nei 2100-12-31');
        else delErr('expires_at');
      }
    }
    if (name === 'praktikos_vadovas_vardas') {
      if (!trimmed) setErr('praktikos_vadovas_vardas', 'Vadovo vardas yra privalomas');
      else if (trimmed.length > 50) setErr('praktikos_vadovas_vardas', 'Vardas negali viršyti 50 simbolių');
      else if (!/^[A-Za-z '\\-]+$/.test(trimmed)) setErr('praktikos_vadovas_vardas', 'Vadovo vardas gali turėti tik raides ir -');
      else delErr('praktikos_vadovas_vardas');
    }
    if (name === 'praktikos_vadovas_pavarde') {
      if (!trimmed) setErr('praktikos_vadovas_pavarde', 'Vadovo pavardė yra privaloma');
      else if (trimmed.length > 50) setErr('praktikos_vadovas_pavarde', 'Pavardė negali viršyti 50 simbolių');
      else if (!/^[A-Za-z '\\-]+$/.test(trimmed)) setErr('praktikos_vadovas_pavarde', 'Vadovo pavardė gali turėti tik raides ir -');
      else delErr('praktikos_vadovas_pavarde');
    }
    if (name === 'praktikos_vadovas_el_pastas') {
      if (!trimmed) setErr('praktikos_vadovas_el_pastas', 'Vadovo el. paštas yra privalomas');
      else if (trimmed.length > 50) setErr('praktikos_vadovas_el_pastas', 'El. paštas negali viršyti 50 simbolių');
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) setErr('praktikos_vadovas_el_pastas', 'Neteisingas vadovo el. pašto adresas');
      else delErr('praktikos_vadovas_el_pastas');
    }
    if (name === 'praktikos_vadovas_tel') {
      if (!trimmed) setErr('praktikos_vadovas_tel', 'Vadovo telefono numeris yra privalomas');
      else if (!/^\+370\d{8}$/.test(trimmed)) setErr('praktikos_vadovas_tel', 'Telefono numeris turi prasidėti +370 ir būti 12 simbolių, pvz. +37069696996');
      else delErr('praktikos_vadovas_tel');
    }

    setFieldErrors(errs);
  };

  // loadina priestai issaugota adresa is localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) setSuggestions(JSON.parse(saved).slice(0, 5));
  }, []);

  // Clear transient UI state when the modal is opened so previous toasts/errors don't persist
  useEffect(() => {
    if (open) {
      // clear any lingering toast or timers when opening the modal again
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setToast(null);
      setError(null);
      setSuccess(null);
      setFieldErrors({});
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = null;
    }
    // no cleanup needed here
  }, [open]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // real-time validation for this field
    validateField(name, value);
    if (name === 'lokacija') {
      // siulymai pagal praitas ivestis
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
    setFieldErrors({});

  const errors = {};
  if (!form.pavadinimas || !form.pavadinimas.trim()) errors.pavadinimas = 'Pavadinimas yra privalomas';
  if (!form.aprasymas || !form.aprasymas.trim()) errors.aprasymas = 'Aprašymas yra privalomas';
  if (!form.lokacija || !form.lokacija.trim()) errors.lokacija = 'Adresas yra privalomas';
  if (!form.reikalavimai || !form.reikalavimai.trim()) errors.reikalavimai = 'Reikalavimai yra privalomi';

  if (form.pavadinimas && form.pavadinimas.trim().length > 50) errors.pavadinimas = 'Pavadinimas negali viršyti 50 simbolių';
  if (form.aprasymas && form.aprasymas.trim().length > 1000) errors.aprasymas = 'Aprašymas negali viršyti 1000 simbolių';
  if (form.reikalavimai && form.reikalavimai.trim().length > 1000) errors.reikalavimai = 'Reikalavimai negali viršyti 1000 simbolių';
  if (form.lokacija && form.lokacija.trim().length > 50) errors.lokacija = 'Adresas negali viršyti 50 simbolių';

    // adresas privalo turetu bent viena numeri
    if (form.lokacija && !/\d/.test(form.lokacija)) errors.lokacija = 'Adresas turi turėti namo numerį';

  if (!form.praktikos_vadovas_vardas || !form.praktikos_vadovas_vardas.trim()) errors.praktikos_vadovas_vardas = 'Vadovo vardas yra privalomas';
  if (!form.praktikos_vadovas_pavarde || !form.praktikos_vadovas_pavarde.trim()) errors.praktikos_vadovas_pavarde = 'Vadovo pavardė yra privaloma';
  if (!form.praktikos_vadovas_el_pastas || !form.praktikos_vadovas_el_pastas.trim()) errors.praktikos_vadovas_el_pastas = 'Vadovo el. paštas yra privalomas';
  if (!form.praktikos_vadovas_tel || !form.praktikos_vadovas_tel.trim()) errors.praktikos_vadovas_tel = 'Vadovo telefono numeris yra privalomas';

  if (form.praktikos_vadovas_vardas && form.praktikos_vadovas_vardas.trim().length > 50) errors.praktikos_vadovas_vardas = 'Vardas negali viršyti 50 simbolių';
  if (form.praktikos_vadovas_pavarde && form.praktikos_vadovas_pavarde.trim().length > 50) errors.praktikos_vadovas_pavarde = 'Pavardė negali viršyti 50 simbolių';
  if (form.praktikos_vadovas_el_pastas && form.praktikos_vadovas_el_pastas.trim().length > 50) errors.praktikos_vadovas_el_pastas = 'El. paštas negali viršyti 50 simbolių';

    if (!form.miestas) {
      errors.miestas = 'Pasirinkite miestą';
    }

    if (!form.tipas) {
      errors.tipas = 'Pasirinkite praktikos sritį / tipą';
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
    if (form.praktikos_vadovas_vardas && !nameRe.test(form.praktikos_vadovas_vardas)) {
      errors.praktikos_vadovas_vardas = 'Vadovo vardas gali turėti tik raides ir -';
    }
    if (form.praktikos_vadovas_pavarde && !nameRe.test(form.praktikos_vadovas_pavarde)) {
      errors.praktikos_vadovas_pavarde = 'Vadovo pavardė gali turėti tik raides ir -';
    }

    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (form.praktikos_vadovas_el_pastas && !emailRe.test(form.praktikos_vadovas_el_pastas)) {
      errors.praktikos_vadovas_el_pastas = 'Neteisingas vadovo el. pašto adresas';
    }

    // Phone must start with +370 and be exactly 12 characters (including the +)
    const phoneStrictRe = /^\+370\d{8}$/;
    if (form.praktikos_vadovas_tel) {
      const phoneTrim = form.praktikos_vadovas_tel.trim();
      if (!phoneStrictRe.test(phoneTrim)) {
        errors.praktikos_vadovas_tel = 'Telefono numeris turi prasidėti +370 ir būti 12 simbolių, pvz. +37069696996';
      }
    }

    // if any errors, display them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Prašome pataisyti formos klaidas');
      return;
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

    const file = fileRef.current?.files?.[0] || selectedFile;
    if (!file) {
      errors.vadovas_CV = 'Pridėkite vadovo CV (PDF/DOC/DOCX)';
    } else {
      fd.append('vadovas_CV', file);
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.fieldErrors) {
          // merge legacy server keys into frontend-friendly keys
          const serverErrors = body.fieldErrors;
          const mapped = { ...serverErrors };
          if (serverErrors.vardas) mapped.praktikos_vadovas_vardas = serverErrors.vardas;
          if (serverErrors.pavarde) mapped.praktikos_vadovas_pavarde = serverErrors.pavarde;
          if (serverErrors.elpastas) mapped.praktikos_vadovas_el_pastas = serverErrors.elpastas;
          if (serverErrors.telefonas) mapped.praktikos_vadovas_tel = serverErrors.telefonas;
          // remove legacy keys to avoid showing duplicates
          delete mapped.vardas; delete mapped.pavarde; delete mapped.elpastas; delete mapped.telefonas;
          setFieldErrors(mapped);
          // focus first invalid field if present
          const first = Object.keys(mapped)[0];
          if (first) {
            const el = document.querySelector(`[name="${first}"]`);
            if (el && typeof el.focus === 'function') el.focus();
          }
        }

        setError(body.error || `Server returned ${res.status}`);
        return;
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
      // clear any existing timer and set a new one to close the modal after showing toast
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = setTimeout(() => {
        setToast(null);
        onClose();
        timerRef.current = null;
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
              <input name="pavadinimas" value={form.pavadinimas} onChange={handleChange} maxLength={50} />
              <div className="char-counter">{form.pavadinimas.length}/50</div>
              {fieldErrors.pavadinimas && <div className="field-error">{fieldErrors.pavadinimas}</div>}
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
              <textarea name="aprasymas" value={form.aprasymas} onChange={handleChange} rows={4} maxLength={1000} />
              <div className="char-counter">{form.aprasymas.length}/1000</div>
              {fieldErrors.aprasymas && <div className="field-error">{fieldErrors.aprasymas}</div>}
            </label>
          </div>

          <div className="create-internship-row">
            <label>Adresas<br />
              <input name="lokacija" value={form.lokacija} onChange={handleChange} autoComplete="off" maxLength={50} />
              <div className="char-counter">{form.lokacija.length}/50</div>
              {fieldErrors.lokacija && <div className="field-error">{fieldErrors.lokacija}</div>}
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
              {fieldErrors.expires_at && <div className="field-error">{fieldErrors.expires_at}</div>}
            </label>
          </div>

         

          <div className="create-internship-row">
            <label>Reikalavimai<br />
              <textarea name="reikalavimai" value={form.reikalavimai} onChange={handleChange} rows={2} maxLength={1000} />
              <div className="char-counter">{form.reikalavimai.length}/1000</div>
              {fieldErrors.reikalavimai && <div className="field-error">{fieldErrors.reikalavimai}</div>}
            </label>
          </div>

          <hr />
          <div className="create-internship-subtitle">Praktikos vadovas</div>

          <div className="create-internship-row">
            <label>Vardas<br />
              <input name="praktikos_vadovas_vardas" value={form.praktikos_vadovas_vardas} onChange={handleChange} maxLength={50} />
              <div className="char-counter">{form.praktikos_vadovas_vardas.length}/50</div>
              {fieldErrors.praktikos_vadovas_vardas && <div className="field-error">{fieldErrors.praktikos_vadovas_vardas}</div>}
            </label>
            <label>Pavardė<br />
              <input name="praktikos_vadovas_pavarde" value={form.praktikos_vadovas_pavarde} onChange={handleChange} maxLength={50} />
              <div className="char-counter">{form.praktikos_vadovas_pavarde.length}/50</div>
              {fieldErrors.praktikos_vadovas_pavarde && <div className="field-error">{fieldErrors.praktikos_vadovas_pavarde}</div>}
            </label>
          </div>

          <div className="create-internship-row">
            <label>El. paštas<br />
              <input name="praktikos_vadovas_el_pastas" value={form.praktikos_vadovas_el_pastas} onChange={handleChange} maxLength={50} />
              <div className="char-counter">{form.praktikos_vadovas_el_pastas.length}/50</div>
              {fieldErrors.praktikos_vadovas_el_pastas && <div className="field-error">{fieldErrors.praktikos_vadovas_el_pastas}</div>}
            </label>
            <label>Tel. numeris<br />
              <input name="praktikos_vadovas_tel" value={form.praktikos_vadovas_tel} onChange={handleChange} maxLength={12} placeholder="+3706xxxxxxx" />
              {fieldErrors.praktikos_vadovas_tel && <div className="field-error">{fieldErrors.praktikos_vadovas_tel}</div>}
            </label>
          </div>

          <div className="create-internship-row">
            <label>Vadovo CV (PDF/DOC/DOCX)<br />
              <input ref={fileRef} type="file" name="vadovas_CV" accept=".pdf,.doc,.docx" onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelectedFile(f);
                if (!f) setFieldErrors(prev => ({ ...prev, vadovas_CV: 'Pridėkite vadovo CV' }));
                else setFieldErrors(prev => { const c = { ...prev }; delete c.vadovas_CV; return c; });
              }} />
              {fieldErrors.vadovas_CV && <div className="field-error">{fieldErrors.vadovas_CV}</div>}
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
