import React, { useEffect, useState } from 'react';
import { Clock, Zap, Timer } from 'lucide-react';
import type { MatchCardData } from '../lib/matchLogic';

export const CourtSideDisplay: React.FC = () => {
  const [data, setData] = useState<{ 
    currentMatches: MatchCardData[], 
    nextMatches: MatchCardData[], 
    roundNumber: number,
    sessionTitle: string 
  } | null>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const channel = new BroadcastChannel('pad_tv_channel');
    channel.onmessage = (event) => {
      setData(event.data);
    };
    channel.postMessage({ type: 'REQUEST_INITIAL_DATA' });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      channel.close();
      clearInterval(timer);
    };
  }, []);

  if (!data) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ marginBottom: '1rem' }}><Timer size={48} /></div>
          <h1>Waiting for Tournament Data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      padding: '2vw',
      color: 'white',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4vh', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ background: '#39ff14', color: 'black', padding: '0.4rem 1.5rem', borderRadius: '4px', fontWeight: 900, fontSize: '2.5rem', boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)' }}>
            PAD LIVE
          </div>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{data.sessionTitle}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.8, fontSize: '2rem', fontWeight: 800 }}>
           <Clock size={32} />
           {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* FULL WIDTH GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5em', color: '#39ff14', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Zap size={24} fill="#39ff14" /> ROUND {data.roundNumber} • MATCHES IN PROGRESS
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '2.5vw',
          alignContent: 'start',
          flex: 1
        }}>
          {data.currentMatches.map((m, idx) => {
            const isFeatured = m.court === 1 || m.court === 2;
            
            return (
              <div key={idx} style={{ 
                background: isFeatured 
                  ? 'rgba(57, 255, 20, 0.05)' 
                  : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '2rem',
                padding: isFeatured ? '3.5rem' : '2.5rem',
                border: isFeatured ? '3px solid #39ff14' : '2px solid rgba(255,255,255,0.05)',
                position: 'relative',
                boxShadow: isFeatured ? '0 0 40px rgba(57, 255, 20, 0.2)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1.5rem', 
                  left: '2rem', 
                  fontSize: isFeatured ? '1.5rem' : '1rem', 
                  fontWeight: 900, 
                  color: isFeatured ? '#39ff14' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.2em'
                }}>
                  COURT {m.court}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isFeatured ? '2rem' : '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ fontSize: isFeatured ? '3.5rem' : '2.5rem', fontWeight: 900, lineHeight: 1.1, color: isFeatured ? '#39ff14' : '#fff' }}>
                    {m.teamA[0].name} {m.teamA[1] ? `& ${m.teamA[1].name}` : ''}
                  </div>
                  <div style={{ height: '2px', background: isFeatured ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255,255,255,0.1)', width: '100px' }} />
                  <div style={{ fontSize: isFeatured ? '3.5rem' : '2.5rem', fontWeight: 900, lineHeight: 1.1, color: isFeatured ? '#39ff14' : '#fff' }}>
                    {m.teamB[0].name} {m.teamB[1] ? `& ${m.teamB[1].name}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer style={{ marginTop: '2vh', textAlign: 'center', opacity: 0.1, fontSize: '0.9rem' }}>
        PAD ACADEMY BROADCAST SYSTEM • ALL COURTS ACTIVE
      </footer>
    </div>
  );
};
