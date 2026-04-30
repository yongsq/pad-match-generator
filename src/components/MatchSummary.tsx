import React, { useRef } from 'react';
import { Trophy, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { calculateLeaderboard } from '../lib/stats';
import type { MatchResult } from '../lib/matchLogic';

interface MatchSummaryProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const leaderboard = calculateLeaderboard(results);

  const handleDownload = async () => {
    if (summaryRef.current === null) return;
    
    try {
      const dataUrl = await toPng(summaryRef.current, { cacheBust: true, quality: 1.0 });
      const link = document.createElement('a');
      link.download = `PAD_Summary_${sessionTitle.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Trophy size={20} />
          Tournament Summary
        </h2>
        <button className="btn btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export Shareable PNG
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '1rem', overflow: 'hidden' }}>
        {/* THE EXPORTABLE AREA */}
        <div 
          ref={summaryRef}
          style={{ 
            width: '400px', 
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            padding: '2.5rem',
            borderRadius: '0px', // Cleaner for image export
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            position: 'relative'
          }}
        >
          {/* Decorative elements for the image */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-color)' }} />
          
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginBottom: '0.5rem' }}>
              PAD Academy Tournament
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--accent-color)' }}>
              {sessionTitle}
            </h1>
            <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '0.25rem' }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 60px 60px', padding: '0 0.5rem', marginBottom: '0.5rem', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <span>#</span>
              <span>Player</span>
              <span style={{ textAlign: 'center' }}>W-L</span>
              <span style={{ textAlign: 'right' }}>+/-</span>
            </div>

            {leaderboard.slice(0, 10).map((p, idx) => (
              <div 
                key={p.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '30px 1fr 60px 60px',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  background: idx === 0 ? 'rgba(var(--accent-color-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: idx === 0 ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: idx < 3 ? 'var(--accent-color)' : 'white' }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</span>
                <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>
                  {p.wins}-{p.losses}
                </span>
                <span style={{ 
                  textAlign: 'right', 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: p.pointDiff > 0 ? '#10b981' : p.pointDiff < 0 ? '#ef4444' : 'white' 
                }}>
                  {p.pointDiff > 0 ? `+${p.pointDiff}` : p.pointDiff}
                </span>
              </div>
            ))}
          </div>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.3, fontSize: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            Generated by PAD Match Center • match.pad.academy
          </footer>
        </div>
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '0.85rem', opacity: 0.5, marginTop: '1rem' }}>
        Tip: The PNG is optimized for sharing on WhatsApp and Instagram Stories.
      </p>
    </div>
  );
};
