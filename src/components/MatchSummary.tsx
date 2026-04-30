import React, { useRef, useState } from 'react';
import { Trophy, List, LayoutGrid, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toPng } from 'html-to-image';
import { calculateLeaderboard, sortStats, type PlayerStats } from '../lib/stats';
import type { MatchResult } from '../lib/matchLogic';

interface MatchSummaryProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const standingsRef = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'standings' | 'recap' | null>(null);

  const stats = calculateLeaderboard(results);
  const leaderboards = {
    wins: sortStats(stats, 'wins'),
    points: sortStats(stats, 'points'),
    winRate: sortStats(stats, 'winRate'),
    pointRate: sortStats(stats, 'pointRate')
  };

  // Group results by round for the Grid Recap
  const roundsMap = new Map<number, MatchResult[]>();
  results.forEach(m => {
    const list = roundsMap.get(m.round) || [];
    list.push(m);
    roundsMap.set(m.round, list.sort((a, b) => a.court - b.court));
  });
  const sortedRounds = Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]);

  const handleExport = async (type: 'standings' | 'recap', ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current === null) return;
    setExporting(type);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(ref.current, { 
        cacheBust: true, 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#0f172a' 
      });
      const link = document.createElement('a');
      link.download = `PAD_${type === 'standings' ? 'Standings' : 'Recap'}_${sessionTitle.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem', padding: '1rem' }}>
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>
          <Trophy size={18} />
          Tournament Wrap-Up (Summary & Leaderboards)
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
           <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{isCollapsed ? 'Click to Expand' : 'Click to Collapse'}</span>
           {isCollapsed ? <ChevronDown size={18} opacity={0.5} /> : <ChevronUp size={18} opacity={0.5} />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('standings', standingsRef)}
              disabled={!!exporting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              {exporting === 'standings' ? <Loader2 className="animate-spin" size={16} /> : <LayoutGrid size={16} />}
              Export Standings PNG
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => handleExport('recap', recapRef)}
              disabled={!!exporting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              {exporting === 'recap' ? <Loader2 className="animate-spin" size={16} /> : <List size={16} />}
              Export Recap Grid
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* PREVIEW 1: STANDINGS GRID (4 COLUMNS) */}
            <div style={{ overflow: 'auto', background: '#000', padding: '1rem', borderRadius: '8px' }}>
              <div 
                ref={standingsRef}
                style={{ 
                  width: '1200px', 
                  background: '#0f172a',
                  padding: '3rem',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.5 }}>Tournament Standings</div>
                  <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0.5rem 0', color: 'var(--accent-color)' }}>{sessionTitle}</h1>
                  <div style={{ opacity: 0.4 }}>{new Date().toLocaleDateString()}</div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <LeaderboardCol title="By Wins" subtitle="Wins & Diff" data={leaderboards.wins} renderRow={(p, i) => (
                    <div key={p.id} className="mini-row">
                      <span>{i+1}. {p.name}</span>
                      <span style={{ fontWeight: 800 }}>{p.wins}w <span style={{ opacity: 0.4, fontSize: '0.6rem' }}>({p.pointDiff > 0 ? `+${p.pointDiff}` : p.pointDiff})</span></span>
                    </div>
                  )} />
                  <LeaderboardCol title="By Win %" subtitle="Efficiency" data={leaderboards.winRate} renderRow={(p, i) => (
                    <div key={p.id} className="mini-row">
                      <span>{i+1}. {p.name}</span>
                      <span style={{ fontWeight: 800 }}>{p.winPercentage.toFixed(1)}%</span>
                    </div>
                  )} />
                  <LeaderboardCol title="By Points" subtitle="Total Score" data={leaderboards.points} renderRow={(p, i) => (
                    <div key={p.id} className="mini-row">
                      <span>{i+1}. {p.name}</span>
                      <span style={{ fontWeight: 800 }}>{p.pointsFor} <span style={{ opacity: 0.4, fontSize: '0.6rem' }}>pts</span></span>
                    </div>
                  )} />
                  <LeaderboardCol title="By Point %" subtitle="Dominance" data={leaderboards.pointRate} renderRow={(p, i) => (
                    <div key={p.id} className="mini-row">
                      <span>{i+1}. {p.name}</span>
                      <span style={{ fontWeight: 800 }}>{p.pointPercentage.toFixed(1)}%</span>
                    </div>
                  )} />
                </div>
              </div>
            </div>

            {/* PREVIEW 2: MATCH RECAP (GRID BY ROUND) */}
            <div style={{ overflow: 'auto', background: '#000', padding: '1rem', borderRadius: '8px' }}>
              <div 
                ref={recapRef}
                style={{ 
                  width: '1200px', 
                  background: '#0f172a',
                  padding: '3rem',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem' }}>
                  Match Recap Grid
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {sortedRounds.map(([roundNum, matches]) => (
                    <div key={roundNum}>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '1rem' }}>
                        Round {roundNum}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {matches.map((m, i) => {
                          const aWin = typeof m.scoreA === 'number' && typeof m.scoreB === 'number' && m.scoreA > m.scoreB;
                          const bWin = typeof m.scoreA === 'number' && typeof m.scoreB === 'number' && m.scoreB > m.scoreA;
                          
                          return (
                            <div key={i} style={{ 
                              background: 'rgba(255,255,255,0.03)', 
                              padding: '1rem', 
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ fontSize: '0.65rem', opacity: 0.3, marginBottom: '0.5rem' }}>COURT {m.court}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: aWin ? '#10b981' : 'white', fontWeight: aWin ? 800 : 500 }}>
                                <span>{m.teamA[0].name} / {m.teamA[1].name}</span>
                                <span>{m.scoreA}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: bWin ? '#10b981' : 'white', fontWeight: bWin ? 800 : 500 }}>
                                <span>{m.teamB[0].name} / {m.teamB[1].name}</span>
                                <span>{m.scoreB}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .mini-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.75rem;
        }
        .mini-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

const LeaderboardCol: React.FC<{ title: string, subtitle: string, data: PlayerStats[], renderRow: (p: PlayerStats, i: number) => React.ReactNode }> = ({ title, subtitle, data, renderRow }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--accent-color)' }}>{title}</h3>
    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.6rem', opacity: 0.4, textTransform: 'uppercase' }}>{subtitle}</p>
    <div>
      {data.map((p, i) => renderRow(p, i))}
    </div>
  </div>
);
