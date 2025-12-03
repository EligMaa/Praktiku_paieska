import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInternshipById, applyForInternship } from '../services/internshipService';
import { useUser } from './UserContext';
import Logo from './Logo';
import './InternshipDetailPage.css';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getInternshipById(id);
        setInternship(data);
      } catch (err) {
        console.error(err);
        setError('Klaida kraunant praktiką');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApply = async () => {
    if (!user || !user.loggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/internship/${id}`)}`);
      return;
    }
    if (user.role !== 'studentas') {
      alert('Tik studentai gali aplikuoti į praktikas');
      return;
    }
    try {
      setApplying(true);
      await applyForInternship(id, {});
      // rodo pranesima, kai aplikacija PRIIMTA
      setSuccessMessage('Aplikacija priimta');
      // rodo tik 3 sekundes ir perveda i mano aplikaciju puslapi
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/my-applications');
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('I praktika galima aplikuoti tik viena karta');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!internship) return <div>Nerasta</div>;

  return (
    <>
      <Logo />
      <div className="internship-detail-grid">
        {successMessage && (
          <div className="success-toast">
            {successMessage}
          </div>
        )}
      <div className="detail-left">
        <div>
          <h2>{internship.pavadinimas}</h2>
          <div className="meta-line"><strong>Įmonė:</strong> {internship.imones_pavadinimas}</div>
          <div className="meta-line"><strong>Tipas:</strong> {internship.tipas || '—'}</div>
          <div className="meta-line"><strong>Miestas:</strong> {internship.miestas || internship.lokacija?.split('—')?.[0] || '—'}</div>
          <div className="meta-line"><strong>Adresas:</strong> {internship.lokacija}</div>

          

          <div className="description" style={{marginTop:18}}>
            <h3>Aprašymas</h3>
            <p>{internship.aprasymas}</p>
          </div>
        </div>

        <div>
          <div className="apply-row">
            {user?.role === 'studentas' ? (
              <button onClick={handleApply} disabled={applying}>{applying ? 'Aplikuojama...' : 'Aplikuoti'}
              
              </button>
            ) : null}
          </div>
          <div className="meta-line"><strong>Iš viso aplikavo:</strong> {internship.application_count || 0}</div>
        </div>
      </div>

      <div className="detail-right">
        <div className="card">
          <h3>Informacija apie įmonę</h3>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            {internship.imones_logotipas ? (
              <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${internship.imones_logotipas}`} alt="Logotipas" style={{width:84, height:84, objectFit:'cover', borderRadius:8}} />
            ) : null}
            <div>
              <div style={{fontWeight:600}}>{internship.imones_pavadinimas}</div>
              {/* optional: more company meta here */}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Praktikos vadovas</h3>
          {internship.vardas || internship.vadovas_vardas || internship.vadovas_name ? (
            <div>
              <div><strong>{internship.vardas || internship.vadovas_vardas || ''} {internship.pavarde || internship.vadovas_pavarde || ''}</strong></div>
              <div>Email: {internship.el_pastas || internship.vadovas_email || internship.vadovas_el_pastas}</div>
              <div>Tel: {internship.telefonas || internship.vadovas_telefonas || '—'}</div>
              {/* show CV link (try several possible field names returned by backend) */}
              {(internship.vadovas_cv_failo || internship.CV_failo_kelias || internship.cv_failo_kelias) && (
                <div>
                  <a href={`${import.meta.env.VITE_SERVER_URL}/uploads/${internship.vadovas_cv_failo || internship.CV_failo_kelias || internship.cv_failo_kelias}`} target="_blank" rel="noreferrer">Atsisiųsti CV</a>
                </div>
              )}
            </div>
          ) : (
            <div>Nenurodytas</div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
