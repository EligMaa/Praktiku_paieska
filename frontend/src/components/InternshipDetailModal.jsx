import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import './InternshipDetailModal.css';

export default function InternshipDetailModal({ open, internshipId, onClose }) {
  const { user } = useUser();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    if (!open || !internshipId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setApplicationStatus(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos/${internshipId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load internship');
        const data = await res.json();
        setInternship(data);
        
        // If user is a student, check application status
        if (user?.role === 'studentas' && user?.id) {
          try {
            const statusRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos/${internshipId}/application-status`, { credentials: 'include' });
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              setApplicationStatus(statusData.status);
            }
          } catch (err) {
            console.log('No application found or error fetching status');
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Klaida');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, internshipId, user]);

  if (!open) return null;

  return (
    <div className="internship-detail-backdrop">
      <div className="internship-detail-modal">
        <button onClick={onClose} className="internship-detail-close">✕</button>
        {loading && <div className="internship-detail-loading">Kraunama...</div>}
        {error && <div className="internship-detail-error">Error: {error}</div>}
        {internship && (
          <div>
            <h2 className="internship-detail-title">{internship.pavadinimas}</h2>
            <p className="internship-detail-subtitle">{internship.imones_pavadinimas} • {internship.miestas || internship.lokacija}</p>
            <div className="internship-detail-section">
              <p><strong>Aprašymas:</strong></p>
              <p className="internship-detail-text">{internship.aprasymas}</p>
            </div>
            <div className="internship-detail-section">
              <p><strong>Reikalavimai:</strong></p>
              <p className="internship-detail-text">{internship.reikalavimai}</p>
            </div>
            <div className="internship-detail-mentor">
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
            
            
            {/* Application status for students */}
            {user?.role === 'studentas' && applicationStatus && (
              <div className={`application-status-banner status-${applicationStatus}`}>
                {applicationStatus === 'patvirtinta' && (
                  <div>
                    <strong>✓ Priimta</strong>
                    <p>Sveikiname! Jūsų aplikacija buvo priimta.</p>
                  </div>
                )}
                {applicationStatus === 'atmesta' && (
                  <div>
                    <strong>✗ Atmesta</strong>
                    <p>Deja, jūsų aplikacija nebuvo pasirinkta.</p>
                  </div>
                )}
                {applicationStatus === 'laukia' && (
                  <div>
                    <strong>⏳ Laukiama patvirtinimo</strong>
                    <p>Jūsų aplikacija yra peržiūrima.</p>
                  </div>
                )}
                
              </div>
            )}
            {internship.expires_at && (
              <div className="internship-detail-expiry"><strong>Galioja iki:</strong> {new Date(internship.expires_at).toLocaleString()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
