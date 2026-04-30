import React, { useRef, useState } from 'react';
import { Trophy, List, LayoutGrid, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { calculateLeaderboard, sortStats, type PlayerStats } from '../lib/stats';
import type { MatchResult } from '../lib/matchLogic';

interface MatchSummaryProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const standingsRef = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'standings' | 'recap' | null>(null);

  const stats = calculateLeaderboard(results);
  const leaderboards = {
    wins: sortStats(stats, 'wins').slice(0, 5),
    points: sortStats(stats, 'points').slice(0, 5),
    winRate: sortStats(stats, 'winRate').slice(0, 5),
    pointRate: sortStats(stats, 'pointRate').slice(0, 5)
  };

  const handleExport = async (type: 'standings' | 'recap', ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current === null) return;
    setExporting(type);
    
    try {
      // Small delay to ensure styles are applied
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(ref.current, { cacheBust: true, quality: 1.0, pixelRatio: 2 });
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
    <div className="animate-fade-in" style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Trophy size={20} />
          Tournament Wrap-Up
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleExport('standings', standingsRef)}
            disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {exporting === 'standings' ? <Loader2 className="animate-spin" size={18} /> : <LayoutGrid size={18} />}
            Export Standings Grid
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleExport('recap', recapRef)}
            disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {exporting === 'recap' ? <Loader2 className="animate-spin" size={18} /> : <List size={18} />}
            Export Match Recap
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* PREVIEW 1: STANDINGS GRID */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'auto' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>Standings Preview (4 Leaderboards)</p>
          <div style={{ display: 'flex', justifyContent: 'center', background: '#000', padding: '1rem', borderRadius: '8px' }}>
            <div 
              ref={standingsRef}
              style={{ 
                width: '800px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '3rem',
                color: 'white',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', opacity: 0.5, marginBottom: '0.5rem' }}>
                  Tournament Standings
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--accent-color)', letterSpacing: '-0.03em' }}>
                  {sessionTitle}
                </h1>
                <div style={{ fontSize: '1rem', opacity: 0.4, marginTop: '0.5rem' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                {/* 1. BY WINS */}
                <LeaderboardBox title="By Wins" subtitle="Wins & Diff" data={leaderboards.wins} renderRow={(p, i) => (
                  <div key={p.id} className="summary-row">
                    <span>{i+1}. {p.name}</span>
                    <span style={{ textAlign: 'right' }}>{p.wins}w <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({p.pointDiff > 0 ? `+${p.pointDiff}` : p.pointDiff})</span></span>
                  </div>
                )} />

                {/* 2. BY POINTS */}
                <LeaderboardBox title="By Points" subtitle="Total Score" data={leaderboards.points} renderRow={(p, i) => (
                  <div key={p.id} className="summary-row">
                    <span>{i+1}. {p.name}</span>
                    <span style={{ textAlign: 'right' }}>{p.pointsFor} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>pts</span></span>
                  </div>
                )} />

                {/* 3. BY WIN RATE */}
                <LeaderboardBox title="By Win %" subtitle="Efficiency" data={leaderboards.winRate} renderRow={(p, i) => (
                  <div key={p.id} className="summary-row">
                    <span>{i+1}. {p.name}</span>
                    <span style={{ textAlign: 'right' }}>{p.winPercentage.toFixed(1)}%</span>
                  </div>
                )} />

                {/* 4. BY POINT % */}
                <LeaderboardBox title="By Point %" subtitle="Dominance" data={leaderboards.pointRate} renderRow={(p, i) => (
                  <div key={p.id} className="summary-row">
                    <span>{i+1}. {p.name}</span>
                    <span style={{ textAlign: 'right' }}>{p.pointPercentage.toFixed(1)}%</span>
                  </div>
                )} />
              </div>

              <footer style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.2, fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                PAD MATCH CENTER • PREMIERE ACADEMY OF PICKLEBALL
              </footer>
            </div>
          </div>
        </div>

        {/* PREVIEW 2: MATCH RECAP */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'auto' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>Match Recap Preview (Full Log)</p>
          <div style={{ display: 'flex', justifyContent: 'center', background: '#000', padding: '1rem', borderRadius: '8px' }}>
            <div 
              ref={recapRef}
              style={{ 
                width: '500px', 
                background: '#0f172a',
                padding: '3rem',
                color: 'white',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem' }}>
                Match History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((m, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--accent-color)'
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Round {m.round} • Court {m.court}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
                        {m.teamA[0].name} / {m.teamA[1].name}
                      </div>
                      <div style={{ background: 'var(--accent-color)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.9rem', margin: '0 1rem' }}>
                        {m.scoreA} - {m.scoreB}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>
                        {m.teamB[0].name} / {m.teamB[1].name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <footer style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.2, fontSize: '0.7rem' }}>
                PAD MATCH CENTER • {sessionTitle}
              </footer>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.6rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.9rem;
          font-weight: 600;
        }
        .summary-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

const LeaderboardBox: React.FC<{ title: string, subtitle: string, data: PlayerStats[], renderRow: (p: PlayerStats, i: number) => React.ReactNode }> = ({ title, subtitle, data, renderRow }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)' }}>{title}</h3>
    <p style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{subtitle}</p>
    <div>
      {data.map((p, i) => renderRow(p, i))}
    </div>
  </div>
);
