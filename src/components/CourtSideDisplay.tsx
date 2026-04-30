import React, { useEffect, useState } from 'react';
import { Clock, Zap, Timer } from 'lucide-react';
import type { MatchCardData } from '../lib/matchLogic';

export const CourtSideDisplay: React.FC = () => {
  const [data, setData] = useState<{ 
    currentMatches: MatchCardData[], 
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

  // Group active matches by round
  const roundsMap = new Map<number, MatchCardData[]>();
  data.currentMatches.forEach(m => {
    const list = roundsMap.get(m.round) || [];
    list.push(m);
    roundsMap.set(m.round, list.sort((a, b) => a.court - b.court));
  });
  const sortedRounds = Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]);

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
          <div style={{ background: '#39ff14', color: 'black', padding: '0.4rem 1.5rem', borderRadius: '4px', fontWeight: 900, fontSize: '2rem', boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)' }}>
            PAD LIVE
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{data.sessionTitle}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.8, fontSize: '1.8rem', fontWeight: 800 }}>
           <Clock size={28} />
           {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4vh', overflowY: 'auto', flex: 1, paddingBottom: '5vh' }}>
        {sortedRounds.map(([roundNum, matches]) => (
          <div key={roundNum} style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5em', color: '#39ff14', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Zap size={20} fill="#39ff14" /> ROUND {roundNum} • MATCHES IN PROGRESS
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5vw',
              alignItems: 'stretch'
            }}>
              {matches.map((m, idx) => {
                const isFeatured = m.court === 1 || m.court === 2;
                
                return (
                  <div key={idx} style={{ 
                    gridColumn: isFeatured ? 'span 2' : 'span 1',
                    background: isFeatured 
                      ? 'rgba(57, 255, 20, 0.05)' 
                      : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '1.2rem',
                    padding: isFeatured ? '2rem' : '1.2rem',
                    border: isFeatured ? '3px solid #39ff14' : '2px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    boxShadow: isFeatured ? '0 0 30px rgba(57, 255, 20, 0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '180px'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '0.8rem', 
                      left: '1.2rem', 
                      fontSize: isFeatured ? '1rem' : '0.7rem', 
                      fontWeight: 900, 
                      color: isFeatured ? '#39ff14' : 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.2em'
                    }}>
                      COURT {m.court}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: isFeatured ? '0.8rem' : '0.4rem', marginTop: '1rem' }}>
                      <div style={{ 
                        fontSize: isFeatured ? '2.8rem' : '1.4rem', 
                        fontWeight: 900, 
                        lineHeight: 1.1, 
                        color: isFeatured ? '#39ff14' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {m.teamA[0].name} {m.teamA[1] ? `& ${m.teamA[1].name}` : ''}
                      </div>
                      <div style={{ height: '2px', background: isFeatured ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255,255,255,0.1)', width: '40px' }} />
                      <div style={{ 
                        fontSize: isFeatured ? '2.8rem' : '1.4rem', 
                        fontWeight: 900, 
                        lineHeight: 1.1, 
                        color: isFeatured ? '#39ff14' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {m.teamB[0].name} {m.teamB[1] ? `& ${m.teamB[1].name}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '2vh', textAlign: 'center', opacity: 0.1, fontSize: '0.8rem' }}>
        PAD ACADEMY BROADCAST SYSTEM
      </footer>
    </div>
  );
};
