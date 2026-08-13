import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ScrollText, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { MatchResult, Player } from '../lib/matchLogic';
import { lookupMasterPlayers } from '../lib/db';

interface ResultsLogProps {
  results: MatchResult[];
  sessionTitle?: string;
}

export const ResultsLog: React.FC<ResultsLogProps> = ({ results, sessionTitle = 'Tournament' }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [matchType, setMatchType] = useState<'D' | 'S'>('D');
  const [scoreType, setScoreType] = useState<'RALLY' | 'SIDEOUT'>('SIDEOUT');
  const [customEvent, setCustomEvent] = useState(sessionTitle);
  const [location, setLocation] = useState('PAD Pickleball Premiere Hotel');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setCustomEvent(sessionTitle);
  }, [sessionTitle]);

  const handleExportCSV = async () => {
    if (results.length === 0) return;
    setIsExporting(true);

    try {
      const namesSet = new Set<string>();
      results.forEach(m => {
        [...m.teamA, ...m.teamB].forEach(p => {
          if (p && p.name) namesSet.add(p.name);
        });
      });
      const names = Array.from(namesSet);

      const masterData = await lookupMasterPlayers(names);
      const idMap = new Map<string, string>();
      masterData.forEach(m => {
        if (m.dupr_id) idMap.set(m.name.toLowerCase().trim(), m.dupr_id);
      });

      const headers = [
        'matchType', 'event', 'date',
        'playerA1', 'playerA1DuprId', 'playerA1ExternalId',
        'playerA2', 'playerA2DuprId', 'playerA2ExternalId',
        'playerB1', 'playerB1DuprId', 'playerB1ExternalId',
        'playerB2', 'playerB2DuprId', 'playerB2ExternalId',
        'teamAGame1', 'teamBGame1',
        'teamAGame2', 'teamBGame2',
        'teamAGame3', 'teamBGame3',
        'teamAGame4', 'teamBGame4',
        'teamAGame5', 'teamBGame5',
        'location', 'scoreType'
      ];

      const today = new Date().toISOString().split('T')[0];

      const escapeCsv = (val: any) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = results.map(m => {
        const getHealedId = (p?: Player) => p ? (idMap.get(p.name.toLowerCase().trim()) || p.duprId || '') : '';
        const isSingles = matchType === 'S' || m.teamA[0]?.id === m.teamA[1]?.id;

        const pA1Name = m.teamA[0]?.name || '';
        const pA1Id = getHealedId(m.teamA[0]);
        const pA2Name = isSingles ? '' : (m.teamA[1]?.name || '');
        const pA2Id = isSingles ? '' : getHealedId(m.teamA[1]);

        const pB1Name = m.teamB[0]?.name || '';
        const pB1Id = getHealedId(m.teamB[0]);
        const pB2Name = isSingles ? '' : (m.teamB[1]?.name || '');
        const pB2Id = isSingles ? '' : getHealedId(m.teamB[1]);

        const row = [
          isSingles ? 'S' : 'D',
          escapeCsv(customEvent),
          today,
          escapeCsv(pA1Name), pA1Id, '',
          escapeCsv(pA2Name), pA2Id, '',
          escapeCsv(pB1Name), pB1Id, '',
          escapeCsv(pB2Name), pB2Id, '',
          m.scoreA, m.scoreB,
          '', '', '', '', '', '', '', '',
          escapeCsv(location),
          scoreType
        ];
        return row.join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `DUPR_Matches_${customEvent.replace(/\s+/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>
          <ScrollText size={18} />
          Match Results Log ({results.length} Matches)
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
           <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{isCollapsed ? 'Click to Expand' : 'Click to Collapse'}</span>
           {isCollapsed ? <ChevronDown size={18} opacity={0.5} /> : <ChevronUp size={18} opacity={0.5} />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Settings size={16} />
              Export Settings
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
              {isExporting ? 'Preparing...' : 'Export DUPR CSV'}
            </button>
          </div>

          {showSettings && (
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '0.25rem' }}>Event Name</label>
                <input className="input" value={customEvent} onChange={(e) => setCustomEvent(e.target.value)} style={{ width: '100%', height: '30px', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '0.25rem' }}>Location</label>
                <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', height: '30px', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '0.25rem' }}>Match Type</label>
                <select className="input" value={matchType} onChange={(e) => setMatchType(e.target.value as 'D' | 'S')} style={{ width: '100%', height: '30px', fontSize: '0.8rem' }}>
                  <option value="D">Doubles (D)</option>
                  <option value="S">Singles (S)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '0.25rem' }}>Scoring</label>
                <select className="input" value={scoreType} onChange={(e) => setScoreType(e.target.value as 'RALLY' | 'SIDEOUT')} style={{ width: '100%', height: '30px', fontSize: '0.8rem' }}>
                  <option value="SIDEOUT">Sideout</option>
                  <option value="RALLY">Rally</option>
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
                  <th>Team B</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => {
                  const isSingles = res.teamA[0]?.id === res.teamA[1]?.id;
                  return (
                    <tr key={idx}>
                      <td>Round {res.round}</td>
                      <td>Court {res.court}</td>
                      <td>
                        {res.teamA[0]?.name}
                        {!isSingles && ` & ${res.teamA[1]?.name}`}
                      </td>
                      <td>
                        {res.teamB[0]?.name}
                        {!isSingles && ` & ${res.teamB[1]?.name}`}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {res.scoreA} - {res.scoreB}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
