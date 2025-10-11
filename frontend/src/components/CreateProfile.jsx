import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: '',
    vardas: '',
    pavarde: '',
    // Student-specific fields
    universitetas: '',
    igudziai: '',
    CV: null,
    // Company-specific fields
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
    if (name === "role") {
      // Reset form fields based on selected role
      setForm(f => ({
        ...f,
        role: value,
        // Reset all fields except role and basic info
        universitetas: value === 'studentas' ? f.universitetas : '',
        igudziai: value === 'studentas' ? f.igudziai : '',
        CV: value === 'studentas' ? f.CV : null,
        pavadinimas: value === 'imone' ? f.pavadinimas : '',
        aprasymas: value === 'imone' ? f.aprasymas : '',
        logotipo_failo: value === 'imone' ? f.logotipo_failo : null,
      }));
      return;
    }
    
    // Validate vardas and pavarde - no spaces allowed
    if ((name === "vardas" || name === "pavarde") && value.includes(' ')) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: 'Negalima naudoti tarpų' 
      }));
    }
    
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  // Validate form based on role
  const validateForm = () => {
    const newErrors = {};
    
    // Required field for all roles
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
      // Company-specific validation
      if (!form.pavadinimas) newErrors.pavadinimas = 'Pavadinimas yra privalomas';
      if (!form.aprasymas) newErrors.aprasymas = 'Aprašymas yra privalomas';
      // Logo is optional for companies
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
    
    // Only add relevant fields based on role
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
      
      alert('Profilis sukurtas sėkmingai!');
      // Redirect to main page after successful profile creation
      navigate('/');
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
      setIsSubmitting(false);
    }
  };

  // Styles for form elements
  const styles = {
    form: { 
      maxWidth: 400, 
      margin: '40px auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 16 
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '12px'
    },
    label: {
      marginBottom: '4px',
      fontWeight: 500
    },
    input: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc'
    },
    error: {
      color: 'red',
      fontSize: '0.85rem',
      marginTop: '4px'
    },
    button: {
      backgroundColor: isSubmitting ? '#cccccc' : '#4CAF50',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s',
      marginTop: '16px'
    },
    loadingContainer: {
      textAlign: 'center', 
      marginTop: '10px'
    },
    spinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(0, 0, 0, 0.1)',
      borderTopColor: '#4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '10px'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Sukurti profilį</h2>
      
      {errors.form && <div style={styles.error}>{errors.form}</div>}
      
      {/* Role selection - always visible */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Rolė:</label>
        <select 
          name="role" 
          value={form.role} 
          onChange={handleChange} 
          style={styles.input}
        >
          <option value="">Pasirinkite</option>
          <option value="studentas">Studentas</option>
          <option value="imone">Įmonė</option>
        </select>
        {errors.role && <div style={styles.error}>{errors.role}</div>}
      </div>
      
      {/* Student-specific fields */}
      {form.role === 'studentas' && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Vardas:</label>
            <input 
              name="vardas" 
              value={form.vardas} 
              onChange={handleChange}
              style={styles.input} 
              placeholder="Vardas (be tarpų)"
            />
            {errors.vardas && <div style={styles.error}>{errors.vardas}</div>}
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Pavardė:</label>
            <input 
              name="pavarde" 
              value={form.pavarde} 
              onChange={handleChange} 
              style={styles.input}
              placeholder="Pavardė (be tarpų)"
            />
            {errors.pavarde && <div style={styles.error}>{errors.pavarde}</div>}
          </div>
        
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Universitetas:</label>
            <input 
              name="universitetas" 
              value={form.universitetas} 
              onChange={handleChange} 
              style={styles.input}
            />
            {errors.universitetas && <div style={styles.error}>{errors.universitetas}</div>}
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Įgūdžiai:</label>
            <input 
              name="igudziai" 
              value={form.igudziai} 
              onChange={handleChange}
              style={styles.input} 
            />
            {errors.igudziai && <div style={styles.error}>{errors.igudziai}</div>}
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>CV failas:</label>
            <input 
              type="file" 
              name="CV" 
              accept=".pdf,.doc,.docx" 
              onChange={handleChange}
              style={styles.input} 
            />
            {errors.CV && <div style={styles.error}>{errors.CV}</div>}
          </div>
        </>
      )}
      
      {/* Company-specific fields */}
      {form.role === 'imone' && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Įmonės pavadinimas:</label>
            <input 
              name="pavadinimas" 
              value={form.pavadinimas} 
              onChange={handleChange}
              style={styles.input} 
            />
            {errors.pavadinimas && <div style={styles.error}>{errors.pavadinimas}</div>}
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Aprašymas:</label>
            <textarea 
              name="aprasymas" 
              value={form.aprasymas} 
              onChange={handleChange}
              rows="4"
              style={{...styles.input, resize: 'vertical'}}
            />
            {errors.aprasymas && <div style={styles.error}>{errors.aprasymas}</div>}
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Logotipas (neprivaloma):</label>
            <input 
              type="file" 
              name="logotipo_failo" 
              accept="image/*" 
              onChange={handleChange}
              style={styles.input} 
            />
            {errors.logotipo_failo && <div style={styles.error}>{errors.logotipo_failo}</div>}
          </div>
        </>
      )}
      
      {/* Submit button */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        style={styles.button}
      >
        {isSubmitting ? 'Saugoma...' : 'Išsaugoti profilį'}
      </button>
      
      {/* Loading indicator */}
      {isSubmitting && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          Profilio duomenys saugomi...
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
