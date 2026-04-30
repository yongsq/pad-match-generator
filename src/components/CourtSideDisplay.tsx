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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5vw',
              alignItems: 'stretch'
            }}>
              {matches.map((m, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(57, 255, 20, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.8rem',
                  border: '2px solid #39ff14',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '140px'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0.8rem', 
                    left: '1.2rem', 
                    fontSize: '0.8rem', 
                    fontWeight: 900, 
                    color: '#39ff14',
                    letterSpacing: '0.2em'
                  }}>
                    COURT {m.court}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <div style={{ 
                      fontSize: '2.2rem', 
                      fontWeight: 900, 
                      lineHeight: 1.1, 
                      color: '#39ff14',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {m.teamA[0].name} {m.teamA[1] ? `& ${m.teamA[1].name}` : ''}
                    </div>
                    <div style={{ height: '2px', background: 'rgba(57, 255, 20, 0.2)', width: '40px' }} />
                    <div style={{ 
                      fontSize: '2.2rem', 
                      fontWeight: 900, 
                      lineHeight: 1.1, 
                      color: '#39ff14',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {m.teamB[0].name} {m.teamB[1] ? `& ${m.teamB[1].name}` : ''}
                    </div>
                  </div>
                </div>
              ))}
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
