import { generateMatches, type Player, type Matrix, updateMatrixWithResult } from './src/lib/matchLogic';

function createPlayer(id: string, name: string, dupr: number, fixedPartnerId: string = ''): Player {
  return {
    id,
    name,
    dupr,
    fixedPartnerId,
    gamesPlayed: 0,
    consecutiveSitOuts: 0,
    isActive: true
  };
}

let players: Player[] = [
  createPlayer('A1', 'PairA1', 4.0, 'A2'),
  createPlayer('A2', 'PairA2', 4.0, 'A1'),
  createPlayer('B1', 'PairB1', 4.0, 'B2'),
  createPlayer('B2', 'PairB2', 4.0, 'B1'),
  createPlayer('C1', 'RandomC1', 4.0),
  createPlayer('C2', 'RandomC2', 4.0),
  createPlayer('D1', 'RandomD1', 4.0),
  createPlayer('D2', 'RandomD2', 4.0),
];

let matrix: Matrix = {};
const numCourts = 2;
const maxPartnerGap = '';

console.log('Testing Fixed Pair Matching logic...');

for (let round = 1; round <= 4; round++) {
  console.log(`\n--- ROUND ${round} ---`);
  const { upcomingMatches, updatedPlayers } = generateMatches(players, numCourts, matrix, round, maxPartnerGap);
  players = updatedPlayers;
  
  upcomingMatches.forEach(m => {
    console.log(`Court ${m.court}: [${m.teamA[0].name}, ${m.teamA[1].name}] vs [${m.teamB[0].name}, ${m.teamB[1].name}]`);
    console.log(`  Debug: TotalA=${m.debug.totalA}, TotalB=${m.debug.totalB}`);
    
    // Simulate matrix update
    matrix = updateMatrixWithResult(matrix, m.teamA, m.teamB);
  });
}
