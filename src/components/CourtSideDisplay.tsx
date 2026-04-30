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
    // Listen for updates from the main window
    const channel = new BroadcastChannel('pad_tv_channel');
    channel.onmessage = (event) => {
      setData(event.data);
    };

    // Request initial data
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
          <p style={{ opacity: 0.5 }}>Please keep the main dashboard open.</p>
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
      padding: '1.5vw',
      color: 'white',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2vh', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'var(--accent-color)', color: 'black', padding: '0.2rem 1.2rem', borderRadius: '4px', fontWeight: 900, fontSize: '1.8rem' }}>
            PAD LIVE
          </div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>{data.sessionTitle}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8, fontSize: '1.5rem', fontWeight: 700 }}>
           <Clock size={24} />
           {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2vw', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: CURRENT ROUND */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--accent-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} fill="var(--accent-color)" /> LIVE ON COURT • ROUND {data.roundNumber}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: data.currentMatches.length <= 3 ? '1fr' : '1fr 1fr',
            gap: '1.5vw',
            alignContent: 'start'
          }}>
            {data.currentMatches.map((m, idx) => (
              <div key={idx} style={{ 
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '1.2rem',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '0.8rem', fontWeight: 800, opacity: 0.3 }}>COURT {m.court}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{m.teamA[0].name} {m.teamA[1] ? `& ${m.teamA[1].name}` : ''}</div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{m.teamB[0].name} {m.teamB[1] ? `& ${m.teamB[1].name}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: NEXT ROUND PREVIEW */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2vw', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.5, marginBottom: '1.5rem' }}>
            COMING UP NEXT
          </h2>
          {data.nextMatches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.nextMatches.map((m, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.3, marginBottom: '0.4rem' }}>COURT {m.court}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, opacity: 0.8 }}>
                    {m.teamA[0].name} / {m.teamA[1]?.name} vs {m.teamB[0].name} / {m.teamB[1]?.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p>Generating Next Round...</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <footer style={{ marginTop: '2vh', textAlign: 'center', opacity: 0.2, fontSize: '0.8rem' }}>
        AUTOMATIC REAL-TIME UPDATES ENABLED • PAD ACADEMY MATCH CENTER
      </footer>
    </div>
  );
};
