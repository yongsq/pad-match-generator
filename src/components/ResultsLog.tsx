import { ScrollText } from 'lucide-react';
import type { MatchResult } from '../lib/matchLogic';

interface ResultsLogProps {
  results: MatchResult[];
}

export function ResultsLog({ results }: ResultsLogProps) {
  if (results.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="section-title">
        <ScrollText size={20} />
        Match Results Log
      </h2>
      
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
