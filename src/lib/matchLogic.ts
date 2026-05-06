export interface Player {
  id: string; // Use name as unique ID for simplicity unless stated otherwise
  name: string;
  dupr: number | '';
  duprId?: string; // NEW: DUPR ID for CSV export and cloud matching
  isActive: boolean;
  gamesPlayed: number;
  consecutiveSitOuts: number;
  fixedPartnerId?: string;
}

export interface MatrixRecord {
  partnered: number;
  opposed: number;
}

// Matrix is keyed by Player ID to Player ID: matrix[playerA.id][playerB.id]
export type Matrix = Record<string, Record<string, MatrixRecord>>;

export interface MatchResult {
  round: number;
  court: number;
  teamA: [Player, Player];
  teamB: [Player, Player];
  scoreA: number | '';
  scoreB: number | '';
}

export interface MatchCardData {
  round: number;
  court: number;
  teamA: [Player, Player];
  teamB: [Player, Player];
  scoreA: number | '';
  scoreB: number | '';
  isSaved: boolean;
  debug?: {
    totalA: number;
    totalB: number;
    gapA: number;
    gapB: number;
    repeatA: boolean;
    repeatB: boolean;
  };
}

/**
 * 2. Paste & Parse: Text area accepts raw Reclub participant list paste 
 * (ignoring headers, venue info, organziers). 'Parse & Setup' processes paste: 
 * extracts names (starting with number and dot, e.g., '1. Ryan Lim'), 
 * formats each name as a player object.
 */
export function parseReclubPaste(text: string): Player[] {
  const lines = text.split('\n');
  const players: Player[] = [];
  const regex = /^\s*(\d+)\.\s+(.*)$/;

  const hasParticipantsMarker = lines.some(l => l.toLowerCase().includes('participants'));
  let inParticipantsSection = !hasParticipantsMarker;

  for (const line of lines) {
    if (!inParticipantsSection && line.toLowerCase().includes('participants')) {
      inParticipantsSection = true;
      continue;
    }

    if (!inParticipantsSection) {
      continue;
    }

    const match = line.match(regex);
    if (match) {
      const name = match[2].trim();
      players.push({
        id: name.toLowerCase(), 
        name: name,
        dupr: '', // empty default instead of 3.5
        isActive: true,
        gamesPlayed: 0,
        consecutiveSitOuts: 0
      });
    }
  }

  return players;
}

/**
 * Generates the next round setups based on the rule list.
 */
export function generateMatches(
  players: Player[],
  courts: number,
  matrix: Matrix,
  roundNumber: number,
  maxPartnerGap: number | '' = ''
): { upcomingMatches: MatchCardData[]; updatedPlayers: Player[] } {
  // Deep copy so we don't mutate original state directly yet
  let currentPlayers = JSON.parse(JSON.stringify(players)) as Player[];

  // 1 - Selection: Filter roster for isActive == true.
  const activePlayers = currentPlayers.filter(p => p.isActive);

  // Sort primarily by low gamesPlayed, secondarily by high consecutiveSitOuts
  activePlayers.sort((a, b) => {
    if (a.gamesPlayed !== b.gamesPlayed) {
      return a.gamesPlayed - b.gamesPlayed; // ASC
    }
    return b.consecutiveSitOuts - a.consecutiveSitOuts; // DESC
  });

  const slots = courts * 4;
  const selected: Player[] = [];
  const selectedIds = new Set<string>();

  for (let i = 0; i < activePlayers.length && selected.length < slots; i++) {
    const p = activePlayers[i];
    if (selectedIds.has(p.id)) continue;

    if (p.fixedPartnerId) {
      const targetId = p.fixedPartnerId.trim().toLowerCase();
      const partner = activePlayers.find(ap => ap.id.trim().toLowerCase() === targetId);
      // Pair rule only applies if BOTH are active and in the roster
      if (partner && !selectedIds.has(partner.id)) {
        if (selected.length + 2 <= slots) {
          selected.push(p);
          selected.push(partner);
          selectedIds.add(p.id);
          selectedIds.add(partner.id);
        } else {
          // Cannot fit the pair in remaining slots, skip them for this round
          continue;
        }
      } else {
        // Partner is inactive or already processed? Treat as solo
        selected.push(p);
        selectedIds.add(p.id);
      }
    } else {
      selected.push(p);
      selectedIds.add(p.id);
    }
  }

  const selectedSet = selectedIds;

  // Update Games / SitOuts
  for (const p of currentPlayers) {
    if (!p.isActive) continue;

    if (selectedSet.has(p.id)) {
      p.gamesPlayed += 1;
      p.consecutiveSitOuts = 0;
    } else {
      p.consecutiveSitOuts += 1;
    }
  }

  const upcomingMatches: MatchCardData[] = [];
  let remainingPlayers = [...selected];
  let courtNum = 1;

  while (remainingPlayers.length >= 4 && courtNum <= courts) {
    const bestMatch = findBestMatch(remainingPlayers, matrix, maxPartnerGap);
    if (!bestMatch) break; // Should not happen with valid inputs

    upcomingMatches.push({
      round: roundNumber,
      court: courtNum,
      teamA: bestMatch.teamA,
      teamB: bestMatch.teamB,
      scoreA: '',
      scoreB: '',
      isSaved: false,
      debug: bestMatch.debug
    });

    const usedIds = new Set([...bestMatch.teamA, ...bestMatch.teamB].map(p => p.id));
    remainingPlayers = remainingPlayers.filter(p => !usedIds.has(p.id));
    courtNum++;
  }

  // Handle leftovers (2 players)
  if (remainingPlayers.length >= 2 && courtNum <= courts) {
    const p1 = remainingPlayers[0];
    const p2 = remainingPlayers[1];
    
    upcomingMatches.push({
      round: roundNumber,
      court: courtNum,
      teamA: [p1, p1], 
      teamB: [p2, p2],
      scoreA: '', scoreB: '', isSaved: false
    });
  }

  return { upcomingMatches, updatedPlayers: currentPlayers };
}

interface MatchCandidate {
  teamA: [Player, Player];
  teamB: [Player, Player];
  penalty: number;
  debug: {
    totalA: number;
    totalB: number;
    gapA: number;
    gapB: number;
    repeatA: boolean;
    repeatB: boolean;
  };
}

function findBestMatch(players: Player[], matrix: Matrix, maxPartnerGap: number | ''): MatchCandidate | null {
  const combos = getCombinations(players, 4);
  const candidates: MatchCandidate[] = [];

  for (const set of combos) {
    const [p1, p2, p3, p4] = set;
    
    // Check for "Cross-Court Splitting"
    const setIds = new Set(set.map(p => p.id.trim().toLowerCase()));
    let hasSplitPair = false;
    for (const p of set) {
      if (p.fixedPartnerId) {
        const partnerId = p.fixedPartnerId.trim().toLowerCase();
        // Check if the partner is in the pool of 8/12/16 players, but NOT in this 4-set
        const partnerInPool = players.find(px => px.id.trim().toLowerCase() === partnerId);
        if (partnerInPool && !setIds.has(partnerId)) {
          hasSplitPair = true;
          break;
        }
      }
    }
    if (hasSplitPair) continue;

    // 3 possible pairing configurations
    const configs: Array<{teamA: [Player, Player], teamB: [Player, Player]}> = [
      { teamA: [p1, p4], teamB: [p2, p3] },
      { teamA: [p1, p3], teamB: [p2, p4] },
      { teamA: [p1, p2], teamB: [p3, p4] }
    ];

    for (const config of configs) {
      // Check repeat partner status from historical matrix
      const repeatA = getMatrixEntry(config.teamA[0].id, config.teamA[1].id, matrix).partnered > 0;
      const repeatB = getMatrixEntry(config.teamB[0].id, config.teamB[1].id, matrix).partnered > 0;

      const penalty = calculatePenalty(config.teamA, config.teamB, matrix, maxPartnerGap);
      
      const totalA = Number(config.teamA[0].dupr || 3.0) + Number(config.teamA[1].dupr || 3.0);
      const totalB = Number(config.teamB[0].dupr || 3.0) + Number(config.teamB[1].dupr || 3.0);
      const gapA = Math.abs(Number(config.teamA[0].dupr || 3.0) - Number(config.teamA[1].dupr || 3.0));
      const gapB = Math.abs(Number(config.teamB[0].dupr || 3.0) - Number(config.teamB[1].dupr || 3.0));

      candidates.push({ 
        ...config, 
        penalty,
        debug: {
          totalA, totalB, gapA, gapB, repeatA, repeatB
        }
      });
    }
  }

  if (candidates.length === 0) return null;

  // Sort by penalty (ascending)
  candidates.sort((a, b) => a.penalty - b.penalty);

  // CRITICAL FIX: Only pick from Top-K among candidates that do NOT have the "Nuclear Penalty" (1,000,000+)
  // This ensures that if a Fixed Partner config exists, we NEVER pick the split configs.
  const validCandidates = candidates.filter(c => c.penalty < 1000000);
  const poolToPickFrom = validCandidates.length > 0 ? validCandidates : candidates;

  const k = Math.min(3, poolToPickFrom.length);
  const randomIndex = Math.floor(Math.random() * k);
  
  return poolToPickFrom[randomIndex];
}

export function getMatchConfigurations(players: Player[], matrix: Matrix, maxPartnerGap: number | ''): MatchCandidate[] {
  if (players.length !== 4) return [];
  const [p1, p2, p3, p4] = players;
  const candidates: MatchCandidate[] = [];

  const configs: Array<{teamA: [Player, Player], teamB: [Player, Player]}> = [
    { teamA: [p1, p4], teamB: [p2, p3] },
    { teamA: [p1, p3], teamB: [p2, p4] },
    { teamA: [p1, p2], teamB: [p3, p4] }
  ];

  for (const config of configs) {
    const repeatA = getMatrixEntry(config.teamA[0].id, config.teamA[1].id, matrix).partnered > 0;
    const repeatB = getMatrixEntry(config.teamB[0].id, config.teamB[1].id, matrix).partnered > 0;
    const penalty = calculatePenalty(config.teamA, config.teamB, matrix, maxPartnerGap);
    
    const totalA = Number(config.teamA[0].dupr || 3.0) + Number(config.teamA[1].dupr || 3.0);
    const totalB = Number(config.teamB[0].dupr || 3.0) + Number(config.teamB[1].dupr || 3.0);
    const gapA = Math.abs(Number(config.teamA[0].dupr || 3.0) - Number(config.teamA[1].dupr || 3.0));
    const gapB = Math.abs(Number(config.teamB[0].dupr || 3.0) - Number(config.teamB[1].dupr || 3.0));

    candidates.push({ 
      ...config, 
      penalty,
      debug: {
        totalA, totalB, gapA, gapB, repeatA, repeatB
      }
    });
  }

  // Filter out Nuclear Penalty configs so reshuffling doesn't offer invalid pairings
  const sorted = candidates.sort((a, b) => a.penalty - b.penalty);
  const valid = sorted.filter(c => c.penalty < 1000000);
  
  return valid.length > 0 ? valid : sorted;
}

function getCombinations<T>(array: T[], n: number): T[][] {
  if (n === 0) return [[]];
  const result: T[][] = [];
  for (let i = 0; i <= array.length - n; i++) {
    const head = array.slice(i, i + 1);
    const tailCombinations = getCombinations(array.slice(i + 1), n - 1);
    for (const tail of tailCombinations) {
      result.push(head.concat(tail));
    }
  }
  return result;
}

export function getMatrixEntry(a: string, b: string, matrix: Matrix): MatrixRecord {
  if (matrix[a] && matrix[a][b]) {
    return matrix[a][b];
  }
  return { partnered: 0, opposed: 0 };
}

function calculatePenalty(teamA: [Player, Player], teamB: [Player, Player], matrix: Matrix, maxPartnerGap: number | ''): number {
  let penalty = 0;

  // 1. Match Balance (Horizontal - Competitive Games) - TOP PRIORITY
  // A shootout/blowout is the worst outcome for player satisfaction.
  const sumA = Number(teamA[0].dupr || 3.0) + Number(teamA[1].dupr || 3.0);
  const sumB = Number(teamB[0].dupr || 3.0) + Number(teamB[1].dupr || 3.0);
  const sumDiff = Math.abs(sumA - sumB);
  penalty += sumDiff * 2000;

  // Helper to check if two players are a fixed pair
  const isFixedPair = (pA: Player, pB: Player) => {
    const fixedA = (pA.fixedPartnerId || '').trim().toLowerCase();
    const fixedB = (pB.fixedPartnerId || '').trim().toLowerCase();
    const idA = (pA.id || '').trim().toLowerCase();
    const idB = (pB.id || '').trim().toLowerCase();
    
    if (!fixedA && !fixedB) return false;
    return (fixedA === idB) || (fixedB === idA);
  };

  // 2. Partner Variety (Matrix) - HIGH PRIORITY
  // If they are a fixed pair, we EXPECT them to partner, so we don't penalize it.
  const p1 = isFixedPair(teamA[0], teamA[1]) ? 0 : getMatrixEntry(teamA[0].id, teamA[1].id, matrix).partnered;
  const p2 = isFixedPair(teamB[0], teamB[1]) ? 0 : getMatrixEntry(teamB[0].id, teamB[1].id, matrix).partnered;
  penalty += (p1 + p2) * 5000;

  // 3. Opponent Variety (Matrix) - MEDIUM PRIORITY
  // Use exponential scaling (x^2) to strongly discourage playing the same opponents 3+ times
  const o1 = getMatrixEntry(teamA[0].id, teamB[0].id, matrix).opposed;
  const o2 = getMatrixEntry(teamA[0].id, teamB[1].id, matrix).opposed;
  const o3 = getMatrixEntry(teamA[1].id, teamB[0].id, matrix).opposed;
  const o4 = getMatrixEntry(teamA[1].id, teamB[1].id, matrix).opposed;
  penalty += (Math.pow(o1, 2) + Math.pow(o2, 2) + Math.pow(o3, 2) + Math.pow(o4, 2)) * 1000;

  // 4. Partner Gap (The "Soft" Rule)
  // We prefer people play with others of their skill level, 
  // but we allow it to slide if it's the only way to avoid a blowout or a repeat.
  if (maxPartnerGap !== '') {
    const gapA = Math.abs(Number(teamA[0].dupr || 3.0) - Number(teamA[1].dupr || 3.0));
    const gapB = Math.abs(Number(teamB[0].dupr || 3.0) - Number(teamB[1].dupr || 3.0));
    
    if (gapA > maxPartnerGap) {
      penalty += 2000 + ((gapA - maxPartnerGap) * 4000);
    }
    if (gapB > maxPartnerGap) {
      penalty += 2000 + ((gapB - maxPartnerGap) * 4000);
    }
  }

  // 5. Fixed Partners Enforcement - ULTIMATE PRIORITY
  const playersInMatch = [...teamA, ...teamB];
  for (const p of playersInMatch) {
    if (p.fixedPartnerId) {
      const targetPartnerId = p.fixedPartnerId.trim().toLowerCase();
      const partnerInSet = playersInMatch.find(px => px.id.trim().toLowerCase() === targetPartnerId);
      
      if (partnerInSet) {
        // They are both on this court. Are they on the same team?
        const pOnTeamA = teamA.some(tx => tx.id.trim().toLowerCase() === p.id.trim().toLowerCase());
        const partnerOnTeamA = teamA.some(tx => tx.id.trim().toLowerCase() === partnerInSet.id.trim().toLowerCase());
        
        if (pOnTeamA !== partnerOnTeamA) {
          // They are split! Apply massive penalty to reject this configuration
          penalty += 1000000;
        }
      }
    }
  }

  return penalty;
}

export function updateMatrixWithResult(
  matrix: Matrix,
  teamA: Player[],
  teamB: Player[]
): Matrix {
  const newMatrix = JSON.parse(JSON.stringify(matrix)) as Matrix;

  const ensureEntry = (a: string, b: string) => {
    if (!newMatrix[a]) newMatrix[a] = {};
    if (!newMatrix[a][b]) newMatrix[a][b] = { partnered: 0, opposed: 0 };
    if (!newMatrix[b]) newMatrix[b] = {};
    if (!newMatrix[b][a]) newMatrix[b][a] = { partnered: 0, opposed: 0 };
  };

  const addPartner = (p1: Player, p2: Player) => {
    ensureEntry(p1.id, p2.id);
    newMatrix[p1.id][p2.id].partnered += 1;
    newMatrix[p2.id][p1.id].partnered += 1;
  };

  const addOpposed = (ptA: Player, ptB: Player) => {
    ensureEntry(ptA.id, ptB.id);
    newMatrix[ptA.id][ptB.id].opposed += 1;
    newMatrix[ptB.id][ptA.id].opposed += 1;
  };

  // Partners
  addPartner(teamA[0], teamA[1]);
  addPartner(teamB[0], teamB[1]);

  // Opponents
  addOpposed(teamA[0], teamB[0]);
  addOpposed(teamA[0], teamB[1]);
  addOpposed(teamA[1], teamB[0]);
  addOpposed(teamA[1], teamB[1]);

  return newMatrix;
}
