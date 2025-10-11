import React from 'react';
import './StudentInfo.css';
import FileDownloadLink from './FileDownloadLink';

export default function StudentInfo({ user }) {
  // Log to check if the component is receiving student data
  console.log("StudentInfo component received:", user);
  console.log("Role:", user.role);
  console.log("CV path:", user.cv_failo_kelias || user.CV_failo_kelias);
  
  return (
    <div className="student-info">
      {user.universitetas && <p><strong>Universitetas:</strong> {user.universitetas}</p>}
      {user.igudziai && <p><strong>Įgūdžiai:</strong> {user.igudziai}</p>}
      
      {(user.cv_failo_kelias || user.CV_failo_kelias) && (
        <p>
          <strong>CV:</strong>
          <FileDownloadLink 
            filePath={user.cv_failo_kelias || user.CV_failo_kelias}
            originalName={user.cv_original_filename || user.CV_original_filename}
          />
        </p>
      )}
    </div>
  );
}