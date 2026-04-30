import type { MatchResult, Player } from './matchLogic';

export interface PlayerStats {
  id: string;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  gamesPlayed: number;
}

export function calculateLeaderboard(results: MatchResult[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>();

  results.forEach(m => {
    if (typeof m.scoreA !== 'number' || typeof m.scoreB !== 'number') return;

    const processPlayer = (p: Player, myScore: number, oppScore: number) => {
      const current = statsMap.get(p.id) || {
        id: p.id,
        name: p.name,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        gamesPlayed: 0
      };

      current.gamesPlayed += 1;
      current.pointsFor += myScore;
      current.pointsAgainst += oppScore;
      current.pointDiff = current.pointsFor - current.pointsAgainst;
      
      if (myScore > oppScore) current.wins += 1;
      else if (oppScore > myScore) current.losses += 1;

      statsMap.set(p.id, current);
    };

    m.teamA.forEach(p => processPlayer(p, m.scoreA as number, m.scoreB as number));
    m.teamB.forEach(p => processPlayer(p, m.scoreB as number, m.scoreA as number));
  });

  return Array.from(statsMap.values()).sort((a, b) => {
    // 1. Wins (Primary)
    if (b.wins !== a.wins) return b.wins - a.wins;
    // 2. Point Diff (Secondary)
    return b.pointDiff - a.pointDiff;
  });
}
