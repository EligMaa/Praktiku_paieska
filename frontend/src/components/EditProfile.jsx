import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './EditProfile.css';
import { MAX_NAME, MAX_SKILLS, MAX_DESC, enforceLimits, validateFile, MAX_FILE_SIZE } from '../hooks/useFieldLimits';
import { UNIVERSITIES } from '../data/universities';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [form, setForm] = useState({
    role: '', 
    vardas: '',
    pavarde: '',
    // sudentu info
    universitetas: '',
    igudziai: '',
    CV: null,
    // imoniu info
    pavadinimas: '',
    aprasymas: '',
    logotipo_failo: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Loadina jau egzistuojancia info
  useEffect(() => {
    if (!user || !user.loggedIn) {
      // Authentication/protection is handled by PrivateRoute; when user info is not present
      // just keep loading state until the context provides the user.
      setLoading(true);
      return;
    }
    
    console.log('User data in EditProfile:', user);

    // Pre-fill jau esancia info
    setForm(prevForm => ({
      ...prevForm,
      role: user.role || '', 
      vardas: user.vardas || '',
      pavarde: user.pavarde || '',
      universitetas: user.universitetas || '',
      igudziai: user.igudziai || '',
      pavadinimas: user.pavadinimas || '',
      aprasymas: user.aprasymas || '',
    }));

    setLoading(false);
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    
    // Clear errors when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
        
    // files: validate CV upload and set into form
    if (files) {
      const file = files[0];
      if (name === 'CV') {
        const ok = validateFile(name, file, setErrors);
        if (!ok) {
          setForm(f => ({ ...f, [name]: null }));
          return;
        }
      }

      setForm(f => ({ ...f, [name]: file }));
      return;
    }

    // apply shared limits/validation helper (trimming + set short errors)
    const newValue = enforceLimits(name, value, setErrors);

    setForm(f => ({
      ...f,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (form.role === 'studentas') {
      if (!form.vardas) newErrors.vardas = 'Vardas yra privalomas';
      if (form.vardas && form.vardas.includes(' ')) newErrors.vardas = 'Vardas negali turėti tarpų';
      if (!form.pavarde) newErrors.pavarde = 'Pavardė yra privaloma';
      if (form.pavarde && form.pavarde.includes(' ')) newErrors.pavarde = 'Pavardė negali turėti tarpų';
      if (!form.universitetas) newErrors.universitetas = 'Universitetas yra privalomas';
      else if (!UNIVERSITIES.includes(form.universitetas)) newErrors.universitetas = 'Pasirinkite universitetą iš sąrašo';
      if (!form.igudziai) newErrors.igudziai = 'Įgūdžiai yra privalomi';

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
    
    data.append('role', form.role);
    
    if (form.role === 'studentas') {
      data.append('vardas', form.vardas);
      data.append('pavarde', form.pavarde);
      data.append('universitetas', form.universitetas);
      data.append('igudziai', form.igudziai);
      if (form.CV) {
        data.append('CV', form.CV);
      }
    } else if (form.role === 'imone') {
      data.append('pavadinimas', form.pavadinimas);
      data.append('aprasymas', form.aprasymas);
      if (form.logotipo_failo) {
        data.append('logotipo_failo', form.logotipo_failo);
      }
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile/update`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Nepavyko atnaujinti profilio');
      }
      
      // Updatina vartotojo informacija
      const updatedUser = await res.json();
      if (updatedUser.success) {
        // Fetchina nauja info
        const userRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/account`, { 
          credentials: 'include' 
        });
        const userData = await userRes.json();
        setUser({ ...userData, loggedIn: true });
      }
      
      // alert('Profilis atnaujintas sėkmingai!');

      navigate('/profile');
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="edit-profile-form">
        <h2>Redaguoti profilį</h2>
        <div className="loading-container">
          <div className="spinner"></div> Kraunami duomenys...
        </div>
      </div>
    );
  }

  console.log('Current form state:', form);
  
  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <h2 style={{ color: 'white' }}> Redaguoti profilį</h2>
      
      {errors.form && <div className="form-error">{errors.form}</div>}
      

      
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
            <div className="field-meta">
              <small>{form.vardas.length}/{MAX_NAME}</small>
            </div>
            {form.vardas.length >= MAX_NAME && (
              <div className="limit-message">Pasiekta maksimalus ilgis — ne daugiau nei {MAX_NAME} simbolių</div>
            )}
            {errors.vardas && !errors.vardas.startsWith('Ne daugiau nei') && (
              <div className="error-message">{errors.vardas}</div>
            )}
          </div>
          
          <div className="field-group">
            <label>Pavardė:</label>
            <input 
              name="pavarde" 
              value={form.pavarde} 
              onChange={handleChange}
              placeholder="Pavardė (be tarpų)"
            />
            <div className="field-meta">
              <small>{form.pavarde.length}/{MAX_NAME}</small>
            </div>
            {form.pavarde.length >= MAX_NAME && (
              <div className="limit-message">Pasiekta maksimalus ilgis — ne daugiau nei {MAX_NAME} simbolių</div>
            )}
            {errors.pavarde && !errors.pavarde.startsWith('Ne daugiau nei') && (
              <div className="error-message">{errors.pavarde}</div>
            )}
          </div>
        
          <div className="field-group">
            <label>Universitetas:</label>
            <input 
              name="universitetas" 
              value={form.universitetas} 
              onChange={handleChange}
              list="universities-list"
              onBlur={(e) => {
                const val = e.target.value?.trim();
                if (!val) return;
                if (!UNIVERSITIES.includes(val)) {
                  
                  setErrors(prev => ({ ...prev, universitetas: 'Pasirinkite universitetą iš sąrašo' }));
                }
              }}
            />
            <datalist id="universities-list">
              {UNIVERSITIES.map(u => (
                <option key={u} value={u} />
              ))}
            </datalist>
            {errors.universitetas && <div className="error-message">{errors.universitetas}</div>}
          </div>
          
          <div className="field-group">
            <label>Įgūdžiai:</label>
            <textarea 
              name="igudziai" 
              value={form.igudziai} 
              onChange={handleChange}
            />
            <div className="field-meta">
              <small>{form.igudziai.length}/{MAX_SKILLS}</small>
            </div>
            {form.igudziai.length >= MAX_SKILLS && (
              <div className="limit-message">Pasiekta maksimalus ilgis — ne daugiau nei {MAX_SKILLS} simbolių</div>
            )}
            {errors.igudziai && !errors.igudziai.startsWith('Ne daugiau nei') && (
              <div className="error-message">{errors.igudziai}</div>
            )}
          </div>
          
          <div className="field-group">
            <label>CV failas (palikite tuščią, jei nenorite keisti):</label>
            <input 
              type="file" 
              name="CV" 
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
            />
            {errors.CV && <div className="error-message">{errors.CV}</div>}
            
            {/* Show current CV file name if available */}
            {(user.cv_failo_kelias || user.CV_failo_kelias) && (
              <div className="file-info">
                Dabartinis CV: {user.cv_original_filename || user.CV_original_filename || 'CV failas'}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Company-specific fields */}
      {form.role === 'imone' && (
        <>
          <div className="field-group">
            <label>Pavadinimas:</label>
            <input 
              name="pavadinimas" 
              value={form.pavadinimas} 
              maxLength={MAX_NAME}
              onChange={handleChange}
            />
            <div className="field-meta">
              <small>{form.pavadinimas.length}/{MAX_NAME}</small>
            </div>
            {form.pavadinimas.length >= MAX_NAME && (
              <div className="limit-message">Pasiekta maksimalus ilgis — ne daugiau nei {MAX_NAME} simbolių</div>
            )}
            {errors.pavadinimas && !errors.pavadinimas.startsWith('Ne daugiau nei') && (
              <div className="error-message">{errors.pavadinimas}</div>
            )}
          </div>
          
          <div className="field-group">
            <label>Aprašymas:</label>
            <textarea 
              name="aprasymas" 
              value={form.aprasymas} 
              onChange={handleChange}
            />
            <div className="field-meta">
              <small>{form.aprasymas.length}/{MAX_DESC}</small>
            </div>
            {form.aprasymas.length >= MAX_DESC && (
              <div className="limit-message">Pasiekta maksimalus ilgis — ne daugiau nei {MAX_DESC} simbolių</div>
            )}
            {errors.aprasymas && !errors.aprasymas.startsWith('Ne daugiau nei') && (
              <div className="error-message">{errors.aprasymas}</div>
            )}
          </div>
          
          <div className="field-group">
            <label>Logotipas (palikite tuščią, jei nenorite keisti):</label>
            <input 
              type="file" 
              name="logotipo_failo" 
              onChange={handleChange}
              accept="image/*"
            />
            
            {/* Show current logo file name if available */}
            {(user.logotipo_failo_kelias) && (
              <div className="file-info">
                Dabartinis logotipas: {user.logotipo_original_filename || 'Logotipas'}
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="button-group">
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="submit-button"
        >
          {isSubmitting ? 'Siunčiama...' : 'Išsaugoti pakeitimus'}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/profile')} 
          className="cancel-button"
        >
          Atšaukti
        </button>
      </div>
    </form>
  );
}