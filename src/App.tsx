import { useState, useEffect } from 'react';
import './App.css';
import type { Player, Matrix, MatchResult, MatchCardData } from './lib/matchLogic';
import { generateMatches, updateMatrixWithResult, getMatchConfigurations } from './lib/matchLogic';
import { Controls } from './components/Controls';
import { PlayerRoster } from './components/PlayerRoster';
import { CurrentRound } from './components/CurrentRound';
import { ResultsLog } from './components/ResultsLog';
import { MatchSummary } from './components/MatchSummary';
import { CourtSideDisplay } from './components/CourtSideDisplay';

import { BookOpen, Target, AlertTriangle, ChevronDown, ChevronUp, LogOut, User, RefreshCw, LayoutGrid, Monitor } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import type { Session } from '@supabase/supabase-js';
import { syncToMasterRoster, lookupMasterPlayers, saveMatch, getSessionMatches, type TournamentSession } from './lib/db';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [courts, setCourts] = useState<number | ''>('');
  const [matrix, setMatrix] = useState<Matrix>({});
  const [results, setResults] = useState<MatchResult[]>([]);
  const [currentRoundResults, setCurrentRoundResults] = useState<MatchCardData[]>([]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(true);
  const [targetRounds, setTargetRounds] = useState<number | ''>('');
  const [maxPartnerGap, setMaxPartnerGap] = useState<number | ''>('');
  const [loaded, setLoaded] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);
  const [showTV, setShowTV] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [activeSession, setActiveSession] = useState<TournamentSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'error'>('online');

  // Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => setSyncStatus('online');
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // LocalStorage Persistence
  useEffect(() => {
    const saved = localStorage.getItem('pickleballState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayers(parsed.players || []);
        if (parsed.courts !== undefined) setCourts(parsed.courts);
        setMatrix(parsed.matrix || {});
        setResults(parsed.results || []);
        setCurrentRoundResults(parsed.currentRoundResults || []);
        setRoundNumber(parsed.roundNumber || 1);
        setIsEndlessMode(parsed.isEndlessMode ?? true);
        if (parsed.targetRounds !== undefined) setTargetRounds(parsed.targetRounds);
        if (parsed.maxPartnerGap !== undefined) setMaxPartnerGap(parsed.maxPartnerGap);
      } catch (err) {
        console.error('Failed to parse local storage state');
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('pickleballState', JSON.stringify({
        players, courts, matrix, results, currentRoundResults, roundNumber, isEndlessMode, targetRounds, maxPartnerGap
      }));
    }
  }, [players, courts, matrix, results, currentRoundResults, roundNumber, isEndlessMode, targetRounds, loaded]);


  // Controls Callbacks
  const handleSetup = async (parsedPlayers: Player[]) => {
    // If setting up fresh overrides existing
    if (players.length > 0) {
      if (!confirm('This will overwrite current participants. Continue?')) return;
    }

    // PHASE 2: SMART MATCH - Lookup DUPR IDs from Master Roster
    if (session) {
      const names = parsedPlayers.map(p => p.name);
      const masterData = await lookupMasterPlayers(names);
      
      const matchedPlayers = parsedPlayers.map(p => {
        const match = masterData.find(m => m.name.toLowerCase() === p.name.toLowerCase());
        if (match) {
          return {
            ...p,
            duprId: match.dupr_id || undefined,
            dupr: p.dupr === '' ? (match.last_known_dupr ?? '') : p.dupr
          } as Player;
        }
        return p;
      });
      setPlayers(matchedPlayers);
    } else {
      setPlayers(parsedPlayers);
    }
  };

  // Roster Callbacks
  const addPlayer = (name: string, dupr: number | '') => {
    // Dynamic manual addition initializes gamesPlayed to the average active games, sitouts 0.
    const activePlayers = players.filter(p => p.isActive);
    const avgGames = activePlayers.length > 0 
      ? Math.floor(activePlayers.reduce((sum, p) => sum + p.gamesPlayed, 0) / activePlayers.length) 
      : 0;

    const id = name.trim().toLowerCase();
    if (players.some(p => p.id === id)) {
      alert("A player with this name already exists.");
      return;
    }

    const newPlayer: Player = {
      id,
      name: name.trim(),
      dupr,
      isActive: true,
      gamesPlayed: avgGames,
      consecutiveSitOuts: 0
    };
    setPlayers([...players, newPlayer]);
    
    // Background Sync
    if (session) syncToMasterRoster(newPlayer);
  };

  const updatePlayer = (id: string, partial: Partial<Player>) => {
    setPlayers(prev => {
      let next = [...prev];
      const targetId = id.toLowerCase().trim();
      
      if (Object.prototype.hasOwnProperty.call(partial, 'fixedPartnerId')) {
        const newPartnerId = partial.fixedPartnerId ? partial.fixedPartnerId.toLowerCase().trim() : null;
        
        // 1. Identify A and their old partner
        const playerA = next.find(p => p.id.toLowerCase().trim() === targetId);
        const oldPartnerId = playerA?.fixedPartnerId ? playerA.fixedPartnerId.toLowerCase().trim() : null;

        // 2. Clear old links (Bidirectional)
        next = next.map(p => {
          const currentId = p.id.toLowerCase().trim();
          const currentPartnerId = p.fixedPartnerId ? p.fixedPartnerId.toLowerCase().trim() : null;

          // If we are A's old partner, unlink from A
          if (oldPartnerId && currentId === oldPartnerId) return { ...p, fixedPartnerId: undefined };
          // If we are B's current partner, unlink from B
          if (newPartnerId && currentPartnerId === newPartnerId) return { ...p, fixedPartnerId: undefined };
          return p;
        });

        // 3. Set the new bidirectional link
        next = next.map(p => {
          const currentId = p.id.toLowerCase().trim();
          if (currentId === targetId) return { ...p, fixedPartnerId: partial.fixedPartnerId };
          if (newPartnerId && currentId === newPartnerId) return { ...p, fixedPartnerId: id };
          return p;
        });

        return next;
      }

      // Normal non-link updates
      const updatedPlayers = next.map(p => p.id.toLowerCase().trim() === targetId ? { ...p, ...partial } : p);
      
      // Background Sync for normal updates (only sync valid 6-char IDs or clearing)
      if (session) {
        const target = updatedPlayers.find(p => p.id.toLowerCase().trim() === targetId);
        if (target) {
          const idLen = target.duprId?.length || 0;
          if (idLen === 0 || idLen === 6) {
            syncToMasterRoster(target);
          }
        }
      }

      return updatedPlayers;
    });
  };
  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Match Callbacks
  const handleGenerateRounds = () => {
    let currentPls = [...players];
    let currentMtrx = { ...matrix };
    let newMatches: MatchCardData[] = [];
    let currentRoundNum = roundNumber;

    const iterations = isEndlessMode ? 1 : (targetRounds === '' ? 1 : targetRounds);
    const numCourts = courts === '' ? 1 : courts;

    for (let i = 0; i < iterations; i++) {
        const { upcomingMatches, updatedPlayers } = generateMatches(currentPls, numCourts, currentMtrx, currentRoundNum, maxPartnerGap);
        currentPls = updatedPlayers;
        newMatches = [...newMatches, ...upcomingMatches];
        
        // Simulate matrix update so next iteration avoids rematches
        upcomingMatches.forEach(m => {
            currentMtrx = updateMatrixWithResult(currentMtrx, m.teamA, m.teamB);
        });
        
        currentRoundNum++;
    }

    setPlayers(currentPls);
    // Incrementally add to roster
    setCurrentRoundResults(prev => [...prev, ...newMatches]);
    setRoundNumber(currentRoundNum);
  };

  const handleResetGeneratedRounds = () => {
    if (currentRoundResults.length > 0) {
      if (!confirm("This will erase all un-saved generated matches. Proceed?")) return;
    }
    
    const unsavedMatches = currentRoundResults.filter(m => !m.isSaved);
    const savedMatches = currentRoundResults.filter(m => m.isSaved);

    // 1. Rollback player gamesPlayed and reset sitOuts
    const gamesToSubtract: Record<string, number> = {};
    unsavedMatches.forEach(m => {
      [...m.teamA, ...m.teamB].forEach(p => {
         gamesToSubtract[p.id] = (gamesToSubtract[p.id] || 0) + 1;
      });
    });

    const restoredPlayers = players.map(p => ({
       ...p,
       gamesPlayed: Math.max(0, p.gamesPlayed - (gamesToSubtract[p.id] || 0)),
       consecutiveSitOuts: 0 
    }));
    
    // 2. Matrix doesn't need rollback because it is only preserved in state upon 'Save'.

    // 3. Rollback round number
    const maxSavedRound = [...results, ...savedMatches].reduce((max, r) => Math.max(max, r.round), 0);
    setRoundNumber(maxSavedRound + 1);

    setPlayers(restoredPlayers);
    setCurrentRoundResults(savedMatches);
  };

  const handleUpdateScore = (idx: number, scoreA: number | '', scoreB: number | '') => {
    setCurrentRoundResults(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      return { ...m, scoreA, scoreB };
    }));
  };

  const handleReshuffleMatch = (idx: number) => {
    const match = currentRoundResults[idx];
    if (match.isSaved) return;

    const playersInMatch = [...match.teamA, ...match.teamB];
    const configs = getMatchConfigurations(playersInMatch, matrix, maxPartnerGap);
    
    // Find index of current config
    const currentConfigIdx = configs.findIndex(c => 
      (c.teamA[0].id === match.teamA[0].id && c.teamA[1].id === match.teamA[1].id) ||
      (c.teamA[0].id === match.teamA[1].id && c.teamA[1].id === match.teamA[0].id)
    );

    // Pick next config
    const nextConfigIdx = (currentConfigIdx + 1) % configs.length;
    const nextConfig = configs[nextConfigIdx];

    setCurrentRoundResults(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      return {
        ...m,
        teamA: nextConfig.teamA,
        teamB: nextConfig.teamB,
        debug: nextConfig.debug
      };
    }));
  };

  const handleSaveResult = (idx: number) => {
    const match = currentRoundResults[idx];
    
    if (match.isSaved) {
      // Allow editing: update existing log
      const updatedResults = results.map(r => 
        (r.round === match.round && r.court === match.court)
          ? { ...r, scoreA: match.scoreA, scoreB: match.scoreB }
          : r
      );
      setResults(updatedResults);
      
      // Update Cloud for edited result
      if (activeSession) {
        saveMatch(activeSession.id, { ...match, isSaved: true });
      }
      return;
    }

    // 1. Mark as saved
    setCurrentRoundResults(prev => prev.map((m, i) => i === idx ? { ...m, isSaved: true } : m));

    // 2. Add to logs
    const newResult = {
      round: match.round,
      court: match.court,
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB
    };
    setResults(prev => [...prev, newResult]);

    // 3. Update matrix
    setMatrix(prevMatrix => updateMatrixWithResult(prevMatrix, match.teamA, match.teamB));

    // 4. Cloud Sync
    if (activeSession) {
      saveMatch(activeSession.id, { ...match, isSaved: true });
    }
  };


  const handleCloseSession = () => {
    if (!confirm("Close current session and return to Dashboard? Data is saved to Cloud.")) return;
    setActiveSession(null);
    setPlayers([]);
    setCourts('');
    setMatrix({});
    setResults([]);
    setCurrentRoundResults([]);
    setRoundNumber(1);
    setTargetRounds('');
    localStorage.removeItem('pickleballState');
  };

  if (authLoading) return <div style={{color:'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Verifying Session...</div>;
  
  // Only allow sessions with a real email (no Guests)
  if (!session || !session.user.email) {
    return <Auth />;
  }

  if (!activeSession) {
    return <Dashboard onSelectTournament={async (s, isNew) => {
      setActiveSession(s);
      setLoaded(false);
      
      if (isNew) {
        // Brand new session - clear ALL previous states
        setPlayers([]);
        setCourts('');
        setMatrix({});
        setResults([]);
        setCurrentRoundResults([]);
        setRoundNumber(1);
        setTargetRounds('');
        localStorage.removeItem('pickleballState');
      } else {
        // Existing session - attempt to load data
        const matches = await getSessionMatches(s.id);
        if (matches && matches.length > 0) {
          const formatted = matches.map((m: any) => ({
            round: m.round,
            court: m.court,
            teamA: m.team_a,
            teamB: m.team_b,
            scoreA: m.score_a === null ? '' : m.score_a,
            scoreB: m.score_b === null ? '' : m.score_b,
            isSaved: m.is_saved
          }));

          setCurrentRoundResults(formatted);
          const saved = formatted.filter((f: any) => f.isSaved);
          setResults(saved);
          
          let mtrx = {};
          saved.forEach((s: any) => {
            mtrx = updateMatrixWithResult(mtrx, s.teamA, s.teamB);
          });
          setMatrix(mtrx);

          const maxRound = formatted.reduce((max: number, m: any) => Math.max(max, m.round), 0);
          setRoundNumber(maxRound + 1);

          const participantMap = new Map<string, Player>();
          formatted.forEach((m: any) => {
            [...m.teamA, ...m.teamB].forEach(p => {
              if (!participantMap.has(p.id)) participantMap.set(p.id, p);
            });
          });
          if (participantMap.size > 0) {
            setPlayers(Array.from(participantMap.values()));
          }
        }
      }
      setLoaded(true);
    }} />;
  }

  if (!loaded) return <div style={{color:'white'}}>Loading...</div>;

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveSession(null)}
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LayoutGrid size={16} /> Dashboard
          </button>
          {currentRoundResults.length > 0 && (
            <button 
              onClick={() => setShowTV(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Monitor size={16} /> TV Mode
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
            <User size={14} /> {session.user.email}
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <header className="header animate-fade-in" style={{ textAlign: 'center', position: 'relative' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/guide'}
          style={{ position: 'absolute', top: '0', right: '0', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-color)', border: 'none', padding: '0.5rem 0.75rem', fontWeight: 'bold' }}
        >
          <BookOpen size={16} />
          User Guide
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <img src="/dupr-logo.png" alt="DUPR" style={{ height: '60px', objectFit: 'contain' }} />
          <img src="/pad-logo.png" alt="PAD Pickleball" style={{ height: '60px', objectFit: 'contain' }} />
        </div>
        <h1 style={{ margin: '0.5rem 0' }}>
          DUPR Match Generator
        </h1>
        <p>Works with any combination of # of players, # of courts, # of rounds.</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem', fontStyle: 'italic' }}>By PAD Pickleball</p>
      </header>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.05s', marginBottom: '1rem' }}>
        <div 
          onClick={() => setShowManifesto(!showManifesto)} 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            <Target size={20} /> What We Solve
          </h2>
          {showManifesto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {showManifesto && (
          <div style={{ padding: '0.5rem 0 0 1rem', lineHeight: '1.5', fontSize: '0.85rem' }}>
            <p>Reclub's native match generation engine struggles to generate a fair amount of matches and matchups if you do not meet the perfect mathematical ratio of courts, players, and rounds. Crucially, the Reclub engine cannot group players fairly based on skill level (DUPR ratings). This means when you host DUPR matches with a large number of participants, some players get too many matches, some get too few, and you suffer from extremely uneven skill-level pairings.</p>
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>This app solves that. Our custom generator guarantees perfectly fair playtime and aggressively balanced skill pairings regardless of your combination of players, courts, or rounds.</p>
          </div>
        )}
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.08s', marginBottom: '1.5rem' }}>
        <div 
          onClick={() => setShowLimitations(!showLimitations)} 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            <AlertTriangle size={20} /> Platform Limitations
          </h2>
          {showLimitations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {showLimitations && (
          <div style={{ padding: '0.5rem 0 0 1rem', lineHeight: '1.5', fontSize: '0.85rem' }}>
            <p>There is currently no direct integration path available to pipe data automatically into Reclub or DUPR. Please use this dashboard to sequence your entire tournament fairly, but <strong>you must manually create the matches on Reclub using the rosters generated here, and manually submit your final match results.</strong></p>
          </div>
        )}
      </div>

      <Controls 
        onSetup={handleSetup} 
        courts={courts}
        setCourts={setCourts}
        isEndlessMode={isEndlessMode}
        setIsEndlessMode={setIsEndlessMode}
        targetRounds={targetRounds}
        setTargetRounds={setTargetRounds}
        maxPartnerGap={maxPartnerGap}
        setMaxPartnerGap={setMaxPartnerGap}
        onPurge={handleCloseSession}
      />
      
      <PlayerRoster 
        players={players} 
        updatePlayer={updatePlayer} 
        addPlayer={addPlayer} 
        removePlayer={removePlayer}
      />
      
      <CurrentRound 
        matches={currentRoundResults}
        onUpdateScore={handleUpdateScore}
        onReshuffleMatch={handleReshuffleMatch}
        onSaveResult={handleSaveResult}
        onGenerateNextRound={handleGenerateRounds}
        onResetRounds={handleResetGeneratedRounds}
        isEndlessMode={isEndlessMode}
        targetRounds={targetRounds}
        maxPartnerGap={maxPartnerGap}
        hasPlayers={players.length > 0}
      />
      
      {showTV && (
        <CourtSideDisplay 
          roundNumber={roundNumber - 1}
          matches={currentRoundResults}
          sessionTitle={activeSession?.name}
          onClose={() => setShowTV(false)}
        />
      )}

      <ResultsLog 
        results={results} 
        sessionTitle={activeSession?.name}
      />

      <MatchSummary 
        results={results}
        sessionTitle={activeSession?.name}
      />

      {/* Sync Status Indicator */}
      <div className="sync-status">
        <div className={`sync-dot ${syncStatus}`}></div>
        <span>{syncStatus === 'online' ? 'Cloud Synced' : syncStatus === 'offline' ? 'Offline - Saving Locally' : 'Sync Error'}</span>
        {syncStatus === 'online' && <RefreshCw size={12} className={authLoading ? 'animate-spin' : ''} />}
      </div>
    </div>
  );
}

export default App;
