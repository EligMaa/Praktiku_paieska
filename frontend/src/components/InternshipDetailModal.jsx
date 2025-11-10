import React, { useEffect, useState } from 'react';

export default function InternshipDetailModal({ open, internshipId, onClose }) {
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !internshipId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos/${internshipId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load internship');
        const data = await res.json();
        setInternship(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Klaida');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, internshipId]);

  if (!open) return null;

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
      <div style={{background:'#fff', color:'#000', borderRadius:8, width:'min(800px,95%)', maxHeight:'90vh', overflowY:'auto', padding:20}}>
        <button onClick={onClose} style={{float:'right', background:'transparent', border:'none', fontSize:18, cursor:'pointer'}}>✕</button>
        {loading && <div>Kraunama...</div>}
        {error && <div style={{color:'red'}}>Error: {error}</div>}
        {internship && (
          <div>
            <h2 style={{marginTop:4}}>{internship.pavadinimas}</h2>
            <p style={{color:'#666'}}>{internship.imones_pavadinimas} • {internship.miestas || internship.lokacija}</p>
            <p><strong>Aprašymas:</strong></p>
            <p style={{whiteSpace:'pre-wrap'}}>{internship.aprasymas}</p>
            <p><strong>Reikalavimai:</strong></p>
            <p style={{whiteSpace:'pre-wrap'}}>{internship.reikalavimai}</p>
            <div style={{marginTop:12}}>
              <h4>Praktikos vadovas</h4>
              <p>
                {internship.vadovas_vardas || internship.vardas || ''} {internship.vadovas_pavarde || internship.pavarde || ''}
              </p>
              <p>{internship.vadovas_email || internship.el_pastas || ''}</p>
              { (internship.telefonas || internship.vadovas_telefonas) && (
                <p>{internship.telefonas || internship.vadovas_telefonas}</p>
              )}
              {/* if CV file path is available, show a download link */}
              {internship.CV_failo_kelias && (
                <p>
                  <a href={`${import.meta.env.VITE_SERVER_URL}/uploads/${internship.CV_failo_kelias}`} target="_blank" rel="noreferrer">Atsisiųsti vadovo CV</a>
                </p>
              )}
            </div>
            {internship.expires_at && (
              <div style={{marginTop:12}}><strong>Galioja iki:</strong> {new Date(internship.expires_at).toLocaleString()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
