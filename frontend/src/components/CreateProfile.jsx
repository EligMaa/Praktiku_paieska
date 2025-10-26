import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

export default function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: '',
    vardas: '',
    pavarde: '',
    // Studento info
    universitetas: '',
    igudziai: '',
    CV: null,
    // imones infos
    pavadinimas: '',
    aprasymas: '',
    logotipo_failo: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;

    // Clear errors when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Special handling for role changes
    if (name === 'role') {
      // pagal role pakeitima, resetinam nesusijusius laukus
      setForm(f => ({
        ...f,
        role: value,

        universitetas: value === 'studentas' ? f.universitetas : '',
        igudziai: value === 'studentas' ? f.igudziai : '',
        CV: value === 'studentas' ? f.CV : null,
        pavadinimas: value === 'imone' ? f.pavadinimas : '',
        aprasymas: value === 'imone' ? f.aprasymas : '',
        logotipo_failo: value === 'imone' ? f.logotipo_failo : null,
      }));
      return;
    }

    // tarpai neleidziami vardui ir pavardei
    if ((name === 'vardas' || name === 'pavarde') && value.includes(' ')) {
      setErrors(prev => ({ ...prev, [name]: 'Negalima naudoti tarpų' }));
    }

    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  // Formos validacija
  const validateForm = () => {
    const newErrors = {};

    if (!form.role) newErrors.role = 'Rolė yra privaloma';

    // Role-specific validation
    if (form.role === 'studentas') {
      // Student-specific validation
      if (!form.vardas) newErrors.vardas = 'Vardas yra privalomas';
      if (form.vardas && form.vardas.includes(' ')) newErrors.vardas = 'Vardas negali turėti tarpų';
      if (!form.pavarde) newErrors.pavarde = 'Pavardė yra privaloma';
      if (form.pavarde && form.pavarde.includes(' ')) newErrors.pavarde = 'Pavardė negali turėti tarpų';
      if (!form.universitetas) newErrors.universitetas = 'Universitetas yra privalomas';
      if (!form.igudziai) newErrors.igudziai = 'Įgūdžiai yra privalomi';
      if (!form.CV) newErrors.CV = 'CV failas yra privalomas';
    } else if (form.role === 'imone') {
      if (!form.pavadinimas) newErrors.pavadinimas = 'Pavadinimas yra privalomas';
      if (!form.aprasymas) newErrors.aprasymas = 'Aprašymas yra privalomas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();

    // info pagal role
    data.append('role', form.role);

    if (form.role === 'studentas') {
      data.append('vardas', form.vardas);
      data.append('pavarde', form.pavarde);
      data.append('universitetas', form.universitetas);
      data.append('igudziai', form.igudziai);
      data.append('CV', form.CV);
    } else if (form.role === 'imone') {
      data.append('pavadinimas', form.pavadinimas);
      data.append('aprasymas', form.aprasymas);
      if (form.logotipo_failo) {
        data.append('logotipo_failo', form.logotipo_failo);
      }
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Nepavyko išsaugoti profilio');
      }

      // alert('Profilis sukurtas sėkmingai!');
      // po sėkmingo sukūrimo nukreipiame į pagrindinį puslapį
      navigate('/');
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <h2>Sukurti profilį</h2>

      {errors.form && <div className="form-error">{errors.form}</div>}

      {/* Role selection - always visible */}
      <div className="field-group">
        <label>Rolė:</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">Pasirinkite</option>
          <option value="studentas">Studentas</option>
          <option value="imone">Įmonė</option>
        </select>
        {errors.role && <div className="error-message">{errors.role}</div>}
      </div>

      {/* Student-specific fields */}
      {form.role === 'studentas' && (
        <>
          <div className="field-group">
            <label>Vardas:</label>
            <input
              name="vardas"
              value={form.vardas}
              onChange={handleChange}
              placeholder="Vardas (be tarpų)"
            />
            {errors.vardas && <div className="error-message">{errors.vardas}</div>}
          </div>

          <div className="field-group">
            <label>Pavardė:</label>
            <input
              name="pavarde"
              value={form.pavarde}
              onChange={handleChange}
              placeholder="Pavardė (be tarpų)"
            />
            {errors.pavarde && <div className="error-message">{errors.pavarde}</div>}
          </div>

          <div className="field-group">
            <label>Universitetas:</label>
            <input
              name="universitetas"
              value={form.universitetas}
              onChange={handleChange}
            />
            {errors.universitetas && <div className="error-message">{errors.universitetas}</div>}
          </div>

          <div className="field-group">
            <label>Įgūdžiai:</label>
            <input
              name="igudziai"
              value={form.igudziai}
              onChange={handleChange}
            />
            {errors.igudziai && <div className="error-message">{errors.igudziai}</div>}
          </div>

          <div className="field-group">
            <label>CV failas:</label>
            <input
              type="file"
              name="CV"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
            />
            {errors.CV && <div className="error-message">{errors.CV}</div>}
          </div>
        </>
      )}

      {/* Company-specific fields */}
      {form.role === 'imone' && (
        <>
          <div className="field-group">
            <label>Įmonės pavadinimas:</label>
            <input
              name="pavadinimas"
              value={form.pavadinimas}
              onChange={handleChange}
            />
            {errors.pavadinimas && <div className="error-message">{errors.pavadinimas}</div>}
          </div>

          <div className="field-group">
            <label>Aprašymas:</label>
            <textarea
              name="aprasymas"
              value={form.aprasymas}
              onChange={handleChange}
              rows="4"
            />
            {errors.aprasymas && <div className="error-message">{errors.aprasymas}</div>}
          </div>

          <div className="field-group">
            <label>Logotipas (neprivaloma):</label>
            <input
              type="file"
              name="logotipo_failo"
              accept="image/*"
              onChange={handleChange}
            />
            {errors.logotipo_failo && <div className="error-message">{errors.logotipo_failo}</div>}
          </div>
        </>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-button"
      >
        {isSubmitting ? 'Saugoma...' : 'Išsaugoti profilį'}
      </button>

      {/* Loading indicator */}
      {isSubmitting && (
        <div className="loading-container">
          <div className="spinner" />
          Profilio duomenys saugomi...
        </div>
      )}
    </form>
  );
}