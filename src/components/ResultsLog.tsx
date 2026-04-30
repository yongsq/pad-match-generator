import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ScrollText, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { MatchResult, Player } from '../lib/matchLogic';
import { lookupMasterPlayers } from '../lib/db';

interface ResultsLogProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const ResultsLog: React.FC<ResultsLogProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [matchType, setMatchType] = useState<'D' | 'S'>('D');
  const [scoreType, setScoreType] = useState<'RALLY' | 'SIDEOUT'>('RALLY');
  const [customEvent, setCustomEvent] = useState(sessionTitle);
  const [isExporting, setIsExporting] = useState(false);

  // Sync customEvent when sessionTitle changes
  useEffect(() => {
    setCustomEvent(sessionTitle);
  }, [sessionTitle]);

  const handleExportCSV = async () => {
    if (results.length === 0) return;
    setIsExporting(true);

    try {
      // 1. Get all unique player names from results
      const namesSet = new Set<string>();
      results.forEach(m => {
        [...m.teamA, ...m.teamB].forEach(p => namesSet.add(p.name));
      });
      const names = Array.from(namesSet);

      // 2. "Smart Healing": Fetch LATEST DUPR IDs from Master Roster to fix old truncated data
      const masterData = await lookupMasterPlayers(names);
      const idMap = new Map<string, string>();
      masterData.forEach(m => {
        if (m.dupr_id) idMap.set(m.name.toLowerCase().trim(), m.dupr_id);
      });

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
        // Use the healed ID if available, otherwise fallback to whatever was in the match record
        const getHealedId = (p: Player) => idMap.get(p.name.toLowerCase().trim()) || p.duprId || '';

        const row = [
          matchType,
          scoreType,
          customEvent,
          today,
          m.teamA[0].name, getHealedId(m.teamA[0]),
          m.teamA[1].name, getHealedId(m.teamA[1]),
          m.teamB[0].name, getHealedId(m.teamB[0]),
          m.teamB[1].name, getHealedId(m.teamB[1]),
          m.scoreA, m.scoreB,
          '', '', '', '', '', '', '', '' 
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
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export CSV. Please check your connection.');
    } finally {
      setIsExporting(false);
    }
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
            disabled={isExporting}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', minWidth: '130px' }}
          >
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
            {isExporting ? 'Healing IDs...' : 'Export CSV'}
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
