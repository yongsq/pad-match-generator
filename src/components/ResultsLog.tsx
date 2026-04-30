import React from 'react';
import { FileSpreadsheet, ScrollText } from 'lucide-react';
import type { MatchResult } from '../lib/matchLogic';

interface ResultsLogProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const ResultsLog: React.FC<ResultsLogProps> = ({ results, sessionTitle = 'Tournament' }) => {
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
        'D',           // matchType
        'RALLY',       // scoreType
        sessionTitle,  // event
        today,         // date
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
    link.setAttribute('download', `Reclub_Results_${sessionTitle.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <ScrollText size={20} />
          Match Results Log
        </h2>
        <button 
          onClick={handleExportCSV}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
        >
          <FileSpreadsheet size={18} />
          Export CSV
        </button>
      </div>
      
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
                  <span style={r.scoreA > r.scoreB ? { fontWeight: 'bold', color: 'var(--accent-color)' } : {}}>
                    {r.teamA[0]?.name} / {r.teamA[1]?.name}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', letterSpacing: '2px' }}>
                  {r.scoreA} - {r.scoreB}
                </td>
                <td>
                  <span style={r.scoreB > r.scoreA ? { fontWeight: 'bold', color: 'var(--accent-color)' } : {}}>
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
}
