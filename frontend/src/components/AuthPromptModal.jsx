import React from 'react';

export default function AuthPromptModal({ open, onClose, onLogin, onSignup }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
      <div style={{
        width: 420,
        maxWidth: '95%',
        margin: '80px auto',
        background: '#fff',
        borderRadius: 8,
        padding: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ marginTop: 0 }}>Prisijungimas reikalingas</h3>
        <p>Norėdami aplikuoti į praktiką, prisijunkite arba susikurkite paskyrą.</p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '8px 12px' }}>Atšaukti</button>
          <button onClick={onLogin} style={{ padding: '8px 12px' }}>Prisijungti</button>
          <button onClick={onSignup} style={{ padding: '8px 12px' }}>Registruotis</button>
        </div>
      </div>
    </div>
  );
}
