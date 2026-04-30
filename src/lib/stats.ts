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
  winPercentage: number;
  pointPercentage: number;
  pointsPossible: number;
}

export function calculateLeaderboard(results: MatchResult[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>();

  results.forEach(m => {
    if (typeof m.scoreA !== 'number' || typeof m.scoreB !== 'number') return;

    // Calculate possible points for this game (usually the winning score)
    const possible = Math.max(m.scoreA, m.scoreB);

    const processPlayer = (p: Player, myScore: number, oppScore: number) => {
      const current = statsMap.get(p.id) || {
        id: p.id,
        name: p.name,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        gamesPlayed: 0,
        winPercentage: 0,
        pointPercentage: 0,
        pointsPossible: 0
      };

      current.gamesPlayed += 1;
      current.pointsFor += myScore;
      current.pointsAgainst += oppScore;
      current.pointsPossible += possible;
      current.pointDiff = current.pointsFor - current.pointsAgainst;
      
      if (myScore > oppScore) current.wins += 1;
      else if (oppScore > myScore) current.losses += 1;

      // Calculate percentages
      current.winPercentage = (current.wins / current.gamesPlayed) * 100;
      current.pointPercentage = current.pointsPossible > 0 
        ? (current.pointsFor / current.pointsPossible) * 100 
        : 0;

      statsMap.set(p.id, current);
    };

    m.teamA.forEach(p => processPlayer(p, m.scoreA as number, m.scoreB as number));
    m.teamB.forEach(p => processPlayer(p, m.scoreB as number, m.scoreA as number));
  });

  return Array.from(statsMap.values());
}

export type SortMetric = 'wins' | 'points' | 'winRate' | 'pointRate';

export function sortStats(stats: PlayerStats[], metric: SortMetric): PlayerStats[] {
  return [...stats].sort((a, b) => {
    switch (metric) {
      case 'wins':
        return b.wins !== a.wins ? b.wins - a.wins : b.pointDiff - a.pointDiff;
      case 'points':
        return b.pointsFor !== a.pointsFor ? b.pointsFor - a.pointsFor : b.pointDiff - a.pointDiff;
      case 'winRate':
        return b.winPercentage !== a.winPercentage ? b.winPercentage - a.winPercentage : b.pointDiff - a.pointDiff;
      case 'pointRate':
        return b.pointPercentage !== a.pointPercentage ? b.pointPercentage - a.pointPercentage : b.pointDiff - a.pointDiff;
      default:
        return 0;
    }
  });
}
