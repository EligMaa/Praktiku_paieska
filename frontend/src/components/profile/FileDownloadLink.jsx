import React from 'react';
import './FileDownloadLink.css';

export default function FileDownloadLink({ filePath, originalName }) {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  console.log("FileDownloadLink received:", { filePath, originalName });
  console.log("Download URL:", `${serverUrl}/uploads/${filePath}`);
  
  if (!filePath) {
    return <span className="file-link-error">No file available</span>;
  }
  
  return (
    <a 
      href={`${serverUrl}/uploads/${filePath}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="file-download-link"
    >
      <span className="file-icon">📄</span> 
      Atidaryti CV {originalName ? `(${originalName})` : ''}
    </a>
  );
}