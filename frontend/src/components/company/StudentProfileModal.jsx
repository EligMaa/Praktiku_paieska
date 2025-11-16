import React, { useState, useEffect } from 'react';
import { getStudentProfile } from '../../services/internshipService';
import './StudentProfileModal.css';

export default function StudentProfileModal({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudentProfile();
  }, [studentId]);

  const loadStudentProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentProfile(studentId);
      setStudent(data);
    } catch (err) {
      setError('Nepavyko užkrauti studento profilio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-profile-backdrop" onClick={onClose}>
      <div className="student-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="student-profile-header">
          <h2>Studento profilis</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="loading">Kraunama...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && student && (
          <div className="student-profile-content">
            <div className="profile-section">
              <h3>Pagrindinė informacija</h3>
              <p><strong>Vardas:</strong> {student.vardas}</p>
              <p><strong>Pavardė:</strong> {student.pavarde}</p>
              <p><strong>El. paštas:</strong> {student.email}</p>
            </div>

            <div className="profile-section">
              <h3>Akademinė informacija</h3>
              <p><strong>Universitetas:</strong> {student.universitetas || 'Nenurodyta'}</p>
            </div>

            <div className="profile-section">
              <h3>Įgūdžiai</h3>
              <p>{student.igudziai || 'Nenurodyta'}</p>
            </div>

            {student.cv_failo_kelias && (
              <div className="profile-section">
                <h3>CV</h3>
                <a 
                  href={`${import.meta.env.VITE_SERVER_URL}/uploads/${student.cv_failo_kelias}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="cv-download-link"
                >
                  📄 Atsisiųsti CV
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
