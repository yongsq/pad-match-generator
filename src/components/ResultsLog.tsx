import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ScrollText, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { MatchResult } from '../lib/matchLogic';

interface ResultsLogProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const ResultsLog: React.FC<ResultsLogProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [matchType, setMatchType] = useState<'D' | 'S'>('D');
  const [scoreType, setScoreType] = useState<'RALLY' | 'SIDEOUT'>('RALLY');
  const [customEvent, setCustomEvent] = useState(sessionTitle);

  // Sync customEvent when sessionTitle changes
  useEffect(() => {
    setCustomEvent(sessionTitle);
  }, [sessionTitle]);

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'matchType', 'scoreType', 'event', 'date',
      'playerA1', 'playerA1DuprId', 'playerA2', 'playerA2DuprId',
      'playerB1', 'playerB1DuprId', 'playerB2', 'playerB2DuprId',
      'teamAGame1', 'teamBGame1', 'teamAGame2', 'teamBGame2',
      'teamAGame3', 'teamBGame3', 'teamAGame4', 'teamBGame4',
      'teamAGame5', 'teamBGame5'
    ];

    const today = new Date().toISOString().split('T')[0];

    const rows = results.map(m => {
      const row = [
        matchType,
        scoreType,
        customEvent,
        today,
        m.teamA[0].name, m.teamA[0].duprId || '',
        m.teamA[1].name, m.teamA[1].duprId || '',
        m.teamB[0].name, m.teamB[0].duprId || '',
        m.teamB[1].name, m.teamB[1].duprId || '',
        m.scoreA, m.scoreB,
        '', '', '', '', '', '', '', '' // Games 2-5 empty
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Reclub_Results_${customEvent.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <ScrollText size={20} />
          Match Results Log
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
          >
            <Settings size={18} />
            {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
          >
            <FileSpreadsheet size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="animate-fade-in" style={{ 
          background: 'rgba(255,255,255,0.03)', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <label className="text-xs font-semibold opacity-60 uppercase block mb-2">Event Name</label>
            <input 
              className="input"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold opacity-60 uppercase block mb-2">Match Type</label>
            <select 
              className="input"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as 'D' | 'S')}
              style={{ width: '100%' }}
            >
              <option value="D">Doubles (D)</option>
              <option value="S">Singles (S)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold opacity-60 uppercase block mb-2">Scoring Type</label>
            <select 
              className="input"
              value={scoreType}
              onChange={(e) => setScoreType(e.target.value as 'RALLY' | 'SIDEOUT')}
              style={{ width: '100%' }}
            >
              <option value="RALLY">Rally Scoring</option>
              <option value="SIDEOUT">Sideout Scoring</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Court</th>
              <th>Team A</th>
              <th>Score</th>
              <th>Team B</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>R{r.round}</td>
                <td>{r.court}</td>
                <td>
                  <span style={typeof r.scoreA === 'number' && typeof r.scoreB === 'number' && r.scoreA > r.scoreB ? { fontWeight: 'bold', color: 'var(--accent-color)' } : {}}>
                    {r.teamA[0]?.name} / {r.teamA[1]?.name}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', letterSpacing: '2px' }}>
                  {r.scoreA} - {r.scoreB}
                </td>
                <td>
                  <span style={typeof r.scoreA === 'number' && typeof r.scoreB === 'number' && r.scoreB > r.scoreA ? { fontWeight: 'bold', color: 'var(--accent-color)' } : {}}>
                    {r.teamB[0]?.name} / {r.teamB[1]?.name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
