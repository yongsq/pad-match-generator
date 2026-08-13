export interface Player {
  id: string; // Use name as unique ID for simplicity unless stated otherwise
  name: string;
  dupr: number | '';
  duprId?: string; // DUPR ID for CSV export and cloud matching
  gender?: 'M' | 'F' | ''; // V3: Player gender
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

export interface AlgorithmConfig {
  matchType: 'doubles' | 'singles';
  fixedPartnersOnlyVsFixed: boolean;
  enableMatchBalance: boolean;
  matchBalanceWeight: number;
  enablePartnerVariety: boolean;
  partnerVarietyWeight: number;
  enableOpponentVariety: boolean;
  opponentVarietyWeight: number;
  enablePartnerGap: boolean;
  maxPartnerGap: number | '';
  partnerGapWeight: number;
  enableFixedPartner: boolean;
  fixedPartnerWeight: number;
  enableGenderBalance: boolean;
  disallowMMvsFF: boolean;
  genderPenaltyWeight: number;
  randomizeCourts: boolean;
}

export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  matchType: 'doubles',
  fixedPartnersOnlyVsFixed: false,
  enableMatchBalance: true,
  matchBalanceWeight: 2000,
  enablePartnerVariety: true,
  partnerVarietyWeight: 5000,
  enableOpponentVariety: true,
  opponentVarietyWeight: 1000,
  enablePartnerGap: true,
  maxPartnerGap: '',
  partnerGapWeight: 4000,
  enableFixedPartner: true,
  fixedPartnerWeight: 1000000,
  enableGenderBalance: true,
  disallowMMvsFF: true,
  genderPenaltyWeight: 100000,
  randomizeCourts: true
};

/**
 * Paste & Parse Reclub participant list paste
 * Extracts names and optional gender tags like (M), (F), [M], [F]
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
      let name = match[2].trim();
      let gender: 'M' | 'F' | '' = '';

      // Check for gender marker like (M), (F), [M], [F]
      const genderMatch = name.match(/\s*[\(\[]([MFmf])[\)\]]\s*$/);
      if (genderMatch) {
        gender = genderMatch[1].toUpperCase() as 'M' | 'F';
        name = name.replace(/\s*[\(\[]([MFmf])[\)\]]\s*$/, '').trim();
      }

      players.push({
        id: name.toLowerCase(), 
        name: name,
        dupr: '', 
        gender: gender,
        isActive: true,
        gamesPlayed: 0,
        consecutiveSitOuts: 0
      });
    }
  }

  return players;
}

/**
 * Generates the next round setups based on algorithm configuration.
 */
export function generateMatches(
  players: Player[],
  courts: number,
  matrix: Matrix,
  roundNumber: number,
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): { upcomingMatches: MatchCardData[]; updatedPlayers: Player[] } {
  let currentPlayers = JSON.parse(JSON.stringify(players)) as Player[];

  // Filter roster for active players
  const activePlayers = currentPlayers.filter(p => p.isActive);

  // Sort primarily by low gamesPlayed, secondarily by high consecutiveSitOuts
  activePlayers.sort((a, b) => {
    if (a.gamesPlayed !== b.gamesPlayed) {
      return a.gamesPlayed - b.gamesPlayed; // ASC
    }
    return b.consecutiveSitOuts - a.consecutiveSitOuts; // DESC
  });

  const slotsPerCourt = config.matchType === 'singles' ? 2 : 4;
  const slots = courts * slotsPerCourt;
  const selected: Player[] = [];
  const selectedIds = new Set<string>();

  const fixedPairExcludedIds = new Set<string>();

  // If "Fixed partners only play against fixed partners" is enabled in Doubles
  if (config.matchType === 'doubles' && config.fixedPartnersOnlyVsFixed) {
    // Collect valid active fixed pairs
    const fixedPairList: [Player, Player][] = [];
    const pairedSet = new Set<string>();

    for (const p of activePlayers) {
      if (pairedSet.has(p.id)) continue;
      if (p.fixedPartnerId) {
        const targetId = p.fixedPartnerId.trim().toLowerCase();
        const partner = activePlayers.find(ap => ap.id.trim().toLowerCase() === targetId && !pairedSet.has(ap.id));
        if (partner) {
          fixedPairList.push([p, partner]);
          pairedSet.add(p.id);
          pairedSet.add(partner.id);
        }
      }
    }

    // Pair Fixed Pairs together on courts first (needs 2 fixed pairs = 4 players)
    while (fixedPairList.length >= 2 && selected.length + 4 <= slots) {
      const pairA = fixedPairList.shift()!;
      const pairB = fixedPairList.shift()!;
      selected.push(pairA[0], pairA[1], pairB[0], pairB[1]);
      selectedIds.add(pairA[0].id).add(pairA[1].id).add(pairB[0].id).add(pairB[1].id);
    }

    // Any leftover fixed pair that couldn't be matched against another fixed pair must sit out this round!
    for (const leftoverPair of fixedPairList) {
      fixedPairExcludedIds.add(leftoverPair[0].id.trim().toLowerCase());
      fixedPairExcludedIds.add(leftoverPair[1].id.trim().toLowerCase());
    }
  }

  // Fill remaining slots with remaining active players (excluding leftover fixed pairs if fixedPartnersOnlyVsFixed is true)
  for (let i = 0; i < activePlayers.length && selected.length < slots; i++) {
    const p = activePlayers[i];
    if (selectedIds.has(p.id)) continue;
    if (config.fixedPartnersOnlyVsFixed && fixedPairExcludedIds.has(p.id.trim().toLowerCase())) continue;

    if (config.matchType === 'doubles' && p.fixedPartnerId) {
      const targetId = p.fixedPartnerId.trim().toLowerCase();
      const partner = activePlayers.find(ap => ap.id.trim().toLowerCase() === targetId);
      if (partner && !selectedIds.has(partner.id)) {
        if (selected.length + 2 <= slots) {
          selected.push(p, partner);
          selectedIds.add(p.id).add(partner.id);
        } else {
          continue;
        }
      } else {
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

  while (remainingPlayers.length >= slotsPerCourt && courtNum <= courts) {
    const bestMatch = findBestMatch(remainingPlayers, matrix, config);
    if (!bestMatch) break;

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

  // Handle leftovers for Doubles (2 players left for a court)
  if (config.matchType === 'doubles' && remainingPlayers.length >= 2 && courtNum <= courts) {
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

  // Randomize Court Assignments if configured
  if (config.randomizeCourts && upcomingMatches.length > 1) {
    const courtNumbers = upcomingMatches.map(m => m.court);
    // Fisher-Yates shuffle
    for (let i = courtNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [courtNumbers[i], courtNumbers[j]] = [courtNumbers[j], courtNumbers[i]];
    }
    upcomingMatches.forEach((m, idx) => {
      m.court = courtNumbers[idx];
    });
    upcomingMatches.sort((a, b) => a.court - b.court);
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

function findBestMatch(players: Player[], matrix: Matrix, config: AlgorithmConfig): MatchCandidate | null {
  const isSingles = config.matchType === 'singles';
  const playersPerCourt = isSingles ? 2 : 4;
  const combos = getCombinations(players, playersPerCourt);
  const candidates: MatchCandidate[] = [];

  for (const set of combos) {
    if (isSingles) {
      const [p1, p2] = set;
      const teamA: [Player, Player] = [p1, p1];
      const teamB: [Player, Player] = [p2, p2];

      const penalty = calculatePenalty(teamA, teamB, matrix, config);
      const totalA = Number(p1.dupr || 3.0);
      const totalB = Number(p2.dupr || 3.0);

      candidates.push({
        teamA,
        teamB,
        penalty,
        debug: {
          totalA,
          totalB,
          gapA: 0,
          gapB: 0,
          repeatA: false,
          repeatB: false
        }
      });
    } else {
      const [p1, p2, p3, p4] = set;

      // Check for "Cross-Court Splitting"
      const setIds = new Set(set.map(p => p.id.trim().toLowerCase()));
      let hasSplitPair = false;
      for (const p of set) {
        if (p.fixedPartnerId) {
          const partnerId = p.fixedPartnerId.trim().toLowerCase();
          const partnerInPool = players.find(px => px.id.trim().toLowerCase() === partnerId);
          if (partnerInPool && !setIds.has(partnerId)) {
            hasSplitPair = true;
            break;
          }
        }
      }
      if (hasSplitPair) continue;

      // 3 possible pairing configurations for Doubles
      const configs: Array<{teamA: [Player, Player], teamB: [Player, Player]}> = [
        { teamA: [p1, p4], teamB: [p2, p3] },
        { teamA: [p1, p3], teamB: [p2, p4] },
        { teamA: [p1, p2], teamB: [p3, p4] }
      ];

      for (const cfg of configs) {
        const repeatA = getMatrixEntry(cfg.teamA[0].id, cfg.teamA[1].id, matrix).partnered > 0;
        const repeatB = getMatrixEntry(cfg.teamB[0].id, cfg.teamB[1].id, matrix).partnered > 0;

        const penalty = calculatePenalty(cfg.teamA, cfg.teamB, matrix, config);

        const totalA = Number(cfg.teamA[0].dupr || 3.0) + Number(cfg.teamA[1].dupr || 3.0);
        const totalB = Number(cfg.teamB[0].dupr || 3.0) + Number(cfg.teamB[1].dupr || 3.0);
        const gapA = Math.abs(Number(cfg.teamA[0].dupr || 3.0) - Number(cfg.teamA[1].dupr || 3.0));
        const gapB = Math.abs(Number(cfg.teamB[0].dupr || 3.0) - Number(cfg.teamB[1].dupr || 3.0));

        candidates.push({ 
          ...cfg, 
          penalty,
          debug: {
            totalA, totalB, gapA, gapB, repeatA, repeatB
          }
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.penalty - b.penalty);

  // Pick from Top-K valid candidates
  const validCandidates = candidates.filter(c => c.penalty < 1000000);
  const poolToPickFrom = validCandidates.length > 0 ? validCandidates : candidates;

  const k = Math.min(3, poolToPickFrom.length);
  const randomIndex = Math.floor(Math.random() * k);

  return poolToPickFrom[randomIndex];
}

export function getMatchConfigurations(players: Player[], matrix: Matrix, config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG): MatchCandidate[] {
  if (players.length !== 4) return [];
  const [p1, p2, p3, p4] = players;
  const candidates: MatchCandidate[] = [];

  const configs: Array<{teamA: [Player, Player], teamB: [Player, Player]}> = [
    { teamA: [p1, p4], teamB: [p2, p3] },
    { teamA: [p1, p3], teamB: [p2, p4] },
    { teamA: [p1, p2], teamB: [p3, p4] }
  ];

  for (const cfg of configs) {
    const repeatA = getMatrixEntry(cfg.teamA[0].id, cfg.teamA[1].id, matrix).partnered > 0;
    const repeatB = getMatrixEntry(cfg.teamB[0].id, cfg.teamB[1].id, matrix).partnered > 0;
    const penalty = calculatePenalty(cfg.teamA, cfg.teamB, matrix, config);

    const totalA = Number(cfg.teamA[0].dupr || 3.0) + Number(cfg.teamA[1].dupr || 3.0);
    const totalB = Number(cfg.teamB[0].dupr || 3.0) + Number(cfg.teamB[1].dupr || 3.0);
    const gapA = Math.abs(Number(cfg.teamA[0].dupr || 3.0) - Number(cfg.teamA[1].dupr || 3.0));
    const gapB = Math.abs(Number(cfg.teamB[0].dupr || 3.0) - Number(cfg.teamB[1].dupr || 3.0));

    candidates.push({ 
      ...cfg, 
      penalty,
      debug: {
        totalA, totalB, gapA, gapB, repeatA, repeatB
      }
    });
  }

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

function calculatePenalty(teamA: [Player, Player], teamB: [Player, Player], matrix: Matrix, config: AlgorithmConfig): number {
  let penalty = 0;

  const isSingles = config.matchType === 'singles';

  if (isSingles) {
    const duprA = Number(teamA[0].dupr || 3.0);
    const duprB = Number(teamB[0].dupr || 3.0);
    const diff = Math.abs(duprA - duprB);

    if (config.enableMatchBalance) {
      penalty += diff * config.matchBalanceWeight;
    }

    if (config.enableOpponentVariety) {
      const opp = getMatrixEntry(teamA[0].id, teamB[0].id, matrix).opposed;
      penalty += Math.pow(opp, 2) * config.opponentVarietyWeight;
    }

    return penalty;
  }

  // 1. Match Balance (Horizontal - Competitive Games)
  if (config.enableMatchBalance) {
    const sumA = Number(teamA[0].dupr || 3.0) + Number(teamA[1].dupr || 3.0);
    const sumB = Number(teamB[0].dupr || 3.0) + Number(teamB[1].dupr || 3.0);
    const sumDiff = Math.abs(sumA - sumB);
    penalty += sumDiff * config.matchBalanceWeight;
  }

  // Helper to check if two players are a fixed pair
  const isFixedPair = (pA: Player, pB: Player) => {
    const fixedA = (pA.fixedPartnerId || '').trim().toLowerCase();
    const fixedB = (pB.fixedPartnerId || '').trim().toLowerCase();
    const idA = (pA.id || '').trim().toLowerCase();
    const idB = (pB.id || '').trim().toLowerCase();

    if (!fixedA && !fixedB) return false;
    return (fixedA === idB) || (fixedB === idA);
  };

  // 2. Partner Variety
  if (config.enablePartnerVariety) {
    const p1 = isFixedPair(teamA[0], teamA[1]) ? 0 : getMatrixEntry(teamA[0].id, teamA[1].id, matrix).partnered;
    const p2 = isFixedPair(teamB[0], teamB[1]) ? 0 : getMatrixEntry(teamB[0].id, teamB[1].id, matrix).partnered;
    penalty += (p1 + p2) * config.partnerVarietyWeight;
  }

  // 3. Opponent Variety
  if (config.enableOpponentVariety) {
    const o1 = getMatrixEntry(teamA[0].id, teamB[0].id, matrix).opposed;
    const o2 = getMatrixEntry(teamA[0].id, teamB[1].id, matrix).opposed;
    const o3 = getMatrixEntry(teamA[1].id, teamB[0].id, matrix).opposed;
    const o4 = getMatrixEntry(teamA[1].id, teamB[1].id, matrix).opposed;
    penalty += (Math.pow(o1, 2) + Math.pow(o2, 2) + Math.pow(o3, 2) + Math.pow(o4, 2)) * config.opponentVarietyWeight;
  }

  // 4. Partner Gap
  if (config.enablePartnerGap && config.maxPartnerGap !== '') {
    const gapA = Math.abs(Number(teamA[0].dupr || 3.0) - Number(teamA[1].dupr || 3.0));
    const gapB = Math.abs(Number(teamB[0].dupr || 3.0) - Number(teamB[1].dupr || 3.0));

    if (gapA > config.maxPartnerGap) {
      penalty += 2000 + ((gapA - config.maxPartnerGap) * config.partnerGapWeight);
    }
    if (gapB > config.maxPartnerGap) {
      penalty += 2000 + ((gapB - config.maxPartnerGap) * config.partnerGapWeight);
    }
  }

  // 5. Fixed Partners Enforcement
  if (config.enableFixedPartner) {
    const playersInMatch = [...teamA, ...teamB];
    for (const p of playersInMatch) {
      if (p.fixedPartnerId) {
        const targetPartnerId = p.fixedPartnerId.trim().toLowerCase();
        const partnerInSet = playersInMatch.find(px => px.id.trim().toLowerCase() === targetPartnerId);

        if (partnerInSet) {
          const pOnTeamA = teamA.some(tx => tx.id.trim().toLowerCase() === p.id.trim().toLowerCase());
          const partnerOnTeamA = teamA.some(tx => tx.id.trim().toLowerCase() === partnerInSet.id.trim().toLowerCase());

          if (pOnTeamA !== partnerOnTeamA) {
            penalty += config.fixedPartnerWeight;
          }
        }
      }
    }
  }

  // 5b. Fixed Partners Only Vs Fixed Partners Enforcement
  if (config.matchType === 'doubles' && config.fixedPartnersOnlyVsFixed) {
    const isPairA = isFixedPair(teamA[0], teamA[1]);
    const isPairB = isFixedPair(teamB[0], teamB[1]);
    if (isPairA !== isPairB) {
      penalty += config.fixedPartnerWeight;
    }
  }

  // 6. Gender Balancing Logic
  if (config.enableGenderBalance) {
    const matchPlayers = [...teamA, ...teamB];
    const males = matchPlayers.filter(p => p.gender === 'M').length;
    const females = matchPlayers.filter(p => p.gender === 'F').length;

    // If 2 Males and 2 Females (2M / 2F)
    if (males === 2 && females === 2) {
      const teamAMales = teamA.filter(p => p.gender === 'M').length;
      const teamBMales = teamB.filter(p => p.gender === 'M').length;

      // If configuration is MM vs FF (teamAMales is 2 or 0)
      if (teamAMales === 2 || teamBMales === 2) {
        if (config.disallowMMvsFF) {
          penalty += config.genderPenaltyWeight;
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

  // Partners (only for doubles)
  if (teamA.length >= 2 && teamB.length >= 2) {
    addPartner(teamA[0], teamA[1]);
    addPartner(teamB[0], teamB[1]);
  }

  // Opponents
  for (const pA of teamA) {
    for (const pB of teamB) {
      addOpposed(pA, pB);
    }
  }

  return newMatrix;
}
