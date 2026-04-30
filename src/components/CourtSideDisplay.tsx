import React, { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import type { MatchCardData } from '../lib/matchLogic';

interface CourtSideDisplayProps {
  roundNumber: number;
  matches: MatchCardData[];
  onClose: () => void;
  sessionTitle?: string;
}

export const CourtSideDisplay: React.FC<CourtSideDisplayProps> = ({ 
  roundNumber, 
  matches, 
  onClose,
  sessionTitle = 'Tournament' 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // Request full screen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '2vw',
      color: 'white',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3vh' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'var(--accent-color)', color: 'black', padding: '0.2rem 1rem', borderRadius: '4px', fontWeight: 900, fontSize: '1.5rem' }}>
              ROUND {roundNumber}
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{sessionTitle}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, fontSize: '1.2rem' }}>
             <Clock size={20} />
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            onClose();
          }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={32} />
        </button>
      </div>

      {/* MATCH GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: matches.length <= 4 ? '1fr 1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2vw',
        flex: 1,
        overflowY: 'auto'
      }}>
        {matches.map((m, idx) => (
          <div key={idx} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.05)',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              left: '1.5rem', 
              fontSize: '1rem', 
              fontWeight: 800, 
              color: 'var(--accent-color)',
              letterSpacing: '0.2em'
            }}>
              COURT {m.court}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              <TeamCard players={[m.teamA[0], m.teamA[1]]} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.2 }}>
                <div style={{ flex: 1, height: '2px', background: 'white' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>VS</span>
                <div style={{ flex: 1, height: '2px', background: 'white' }} />
              </div>

              <TeamCard players={[m.teamB[0], m.teamB[1]]} />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ marginTop: '2vh', textAlign: 'center', opacity: 0.3, fontSize: '1rem' }}>
        PAD MATCH CENTER • PLEASE PROCEED TO YOUR ASSIGNED COURTS
      </footer>
    </div>
  );
};

const TeamCard: React.FC<{ players: any[] }> = ({ players }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, color: '#f8fafc' }}>
      {players[0]?.name}
    </div>
    {players[1] && (
      <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, color: '#f8fafc' }}>
        {players[1]?.name}
      </div>
    )}
  </div>
);
