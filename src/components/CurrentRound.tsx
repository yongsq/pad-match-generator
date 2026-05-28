import { useRef, useState } from 'react';
import { Swords, Save, RotateCcw, FileText, Image as ImageIcon, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { MatchCardData, Player } from '../lib/matchLogic';

interface CurrentRoundProps {
  matches: MatchCardData[];
  players: Player[];
  onSwapPlayer: (courtIdx: number, swapOutId: string, swapInId: string) => void;
  onUpdateScore: (courtIdx: number, scoreA: number | '', scoreB: number | '') => void;
  onBlurScore: (courtIdx: number) => void;
  onReshuffleMatch: (courtIdx: number) => void;
  onSaveResult: (courtIdx: number) => void;
  onGenerateNextRound: () => void;
  onResetRounds: () => void;
  isEndlessMode: boolean;
  targetRounds: number | '';
  maxPartnerGap: number | '';
  hasPlayers: boolean;
}

export function CurrentRound({
  matches,
  players,
  onSwapPlayer,
  onUpdateScore,
  onBlurScore,
  onReshuffleMatch,
  onSaveResult,
  onGenerateNextRound,
  onResetRounds,
  isEndlessMode,
  targetRounds,
  maxPartnerGap,
  hasPlayers
}: CurrentRoundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSwap, setActiveSwap] = useState<{ matchIdx: number; playerId: string } | null>(null);

  if (!hasPlayers) return null;
// ... (omitting intermediate helper logic if possible, otherwise I'll just target the header)

  const exportToPng = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, { backgroundColor: '#0f172a', cacheBust: true });
      const link = document.createElement('a');
      link.download = `pickleball-matches-round-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Failed to export PNG. Try again.');
    }
  };

  const exportToCsv = () => {
    const headers = ['Round', 'Court', 'Team A P1', 'Team A P2', 'Team B P1', 'Team B P2', 'Score A', 'Score B'];
    const rows = matches.map(m => [
      m.round,
      m.court,
      m.teamA[0]?.name || '',
      m.teamA[1]?.name || '',
      m.teamB[0]?.name || '',
      m.teamB[1]?.name || '',
      m.scoreA,
      m.scoreB
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pickleball-export-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group matches by round for display
  type DisplayCard = MatchCardData & { originalIndex: number };
  const groupedMatches: Record<number, DisplayCard[]> = {};
  matches.forEach((m, idx) => {
    // We attach the true index from the flat array to invoke callbacks correctly
    const mWithIdx: DisplayCard = { ...m, originalIndex: idx };
    if (!groupedMatches[m.round]) groupedMatches[m.round] = [];
    groupedMatches[m.round].push(mWithIdx);
  });
  
  const allMatchesSaved = matches.length > 0 && matches.every(m => m.isSaved);

  const isPlayerFixedPartnerSplit = (player: Player, match: MatchCardData): boolean => {
    if (!player.fixedPartnerId) return false;
    
    const partnerId = player.fixedPartnerId.trim().toLowerCase();
    const allPlayersOnCourt = [...match.teamA, ...match.teamB];
    
    const partnerOnCourt = allPlayersOnCourt.find(px => px.id.trim().toLowerCase() === partnerId);
    
    if (partnerOnCourt) {
      const isOnTeamA = match.teamA.some(tx => tx.id === player.id);
      const partnerOnTeamA = match.teamA.some(tx => tx.id === partnerOnCourt.id);
      return isOnTeamA !== partnerOnTeamA;
    }
    
    return false;
  };

  const renderPlayer = (player: Player, card: MatchCardData, idx: number, alignment: 'left' | 'right') => {
    if (!player) return <div>TBD</div>;

    const isSplit = isPlayerFixedPartnerSplit(player, card);
    const isDropdownOpen = activeSwap?.matchIdx === idx && activeSwap?.playerId === player.id;

    // Filter candidates for this specific round
    const roundMatches = matches.filter(m => m.round === card.round);
    const playersPlaying = roundMatches.flatMap(m => [...m.teamA, ...m.teamB]);
    
    // Sit-outs
    const sitOuts = players.filter(p => p.isActive && !playersPlaying.some(pp => pp.id === p.id));
    
    // Cross-courts (players playing in this round, but not on this court)
    const currentMatchPlayers = [...card.teamA, ...card.teamB];
    const crossCourts = playersPlaying.filter(pp => !currentMatchPlayers.some(cmp => cmp.id === pp.id));

    return (
      <div 
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: alignment === 'left' ? 'flex-start' : 'flex-end',
          gap: '0.4rem',
          margin: '0.15rem 0'
        }}
      >
        {alignment === 'right' && isSplit && (
          <span title="Fixed partner is on the opposing team!" style={{ color: '#ff9800', cursor: 'help' }}>⚠️</span>
        )}
        
        <span style={{ fontWeight: 500 }}>{player.name}</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>({Number(player.dupr || 0).toFixed(1)})</span>
        
        {alignment === 'left' && isSplit && (
          <span title="Fixed partner is on the opposing team!" style={{ color: '#ff9800', cursor: 'help', marginLeft: '0.2rem' }}>⚠️</span>
        )}

        {!card.isSaved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveSwap(isDropdownOpen ? null : { matchIdx: idx, playerId: player.id });
            }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '2px 4px',
              color: 'var(--text-color)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              marginLeft: alignment === 'left' ? '0.4rem' : '0',
              marginRight: alignment === 'right' ? '0.4rem' : '0',
              order: alignment === 'right' ? -1 : 0
            }}
            title="Swap Player"
          >
            <ArrowLeftRight size={10} />
          </button>
        )}

        {isDropdownOpen && (
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '100%',
              left: alignment === 'left' ? 0 : 'auto',
              right: alignment === 'right' ? 0 : 'auto',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              minWidth: '260px',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: '0.4rem 0',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sit-out Players
            </div>
            {sitOuts.length === 0 ? (
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic' }}>
                No active players sitting out
              </div>
            ) : (
              sitOuts.map(candidate => (
                <div 
                  key={candidate.id} 
                  className="dropdown-item"
                  onClick={() => {
                    onSwapPlayer(idx, player.id, candidate.id);
                    setActiveSwap(null);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{candidate.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    GP: {candidate.gamesPlayed} | DUPR: {Number(candidate.dupr || 0).toFixed(1)}
                  </span>
                </div>
              ))
            )}

            <div style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Other Courts (Cross-court Swap)
            </div>
            {crossCourts.length === 0 ? (
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic' }}>
                No cross-court candidates
              </div>
            ) : (
              crossCourts.map(candidate => (
                <div 
                  key={candidate.id} 
                  className="dropdown-item"
                  onClick={() => {
                    onSwapPlayer(idx, player.id, candidate.id);
                    setActiveSwap(null);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{candidate.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    GP: {candidate.gamesPlayed} | DUPR: {Number(candidate.dupr || 0).toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {activeSwap && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            cursor: 'default'
          }}
          onClick={() => setActiveSwap(null)}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Swords size={20} />
          {matches.length === 0 ? 'Upcoming Rounds' : `Active Rounds Data`}
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {matches.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '0.5rem', marginRight: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={exportToPng}
                title="Download all rounds as PNG"
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)' }}
              >
                <ImageIcon size={16} />
                <span style={{ fontSize: '0.75rem' }}>PNG</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={exportToCsv}
                title="Download all rounds as CSV"
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)' }}
              >
                <FileText size={16} />
                <span style={{ fontSize: '0.75rem' }}>CSV</span>
              </button>
            </div>
          )}

          {matches.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={onResetRounds}
              title="Delete unsaved matches and recalculate stats"
              style={{ padding: '0.5rem 1rem', background: 'var(--danger-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCcw size={16} />
              <span>Regenerate Matches</span>
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={onGenerateNextRound} 
            disabled={isEndlessMode && !allMatchesSaved && matches.length > 0}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {matches.length === 0 
                ? (isEndlessMode ? 'Generate First Round' : `Generate ${targetRounds} Rounds`)
                : (isEndlessMode ? 'Generate Next Round' : `Generate ${targetRounds} More Rounds`)}
            </span>
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
          <p>No matches generated yet. Make sure players are active and click Generate.</p>
        </div>
      ) : (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
          {Object.entries(groupedMatches).map(([roundStr, roundSet]) => (
            <div key={roundStr} style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-color-muted)', fontSize: '1.1rem' }}>Round {roundStr}</h3>
              <div className="cards-grid">
                {roundSet.map((card) => {
                  const idx = card.originalIndex;
                  return (
                    <div key={idx} className="match-card">
                      <div className="match-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span>Court {card.court}</span>
                          {!card.isSaved && (
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => onReshuffleMatch(idx)}
                              title="Reshuffle pairings for these 4 players"
                              style={{ padding: '0.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex' }}
                            >
                              <RefreshCw size={12} />
                            </button>
                          )}
                        </div>
                        {card.isSaved && <span className="status-badge status-active" style={{ fontSize: '0.65rem' }}>Saved</span>}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="team" style={{ flex: 1, minWidth: 0 }}>
                          <div className="team-players" style={{ fontSize: '0.8rem' }}>
                            {renderPlayer(card.teamA[0], card, idx, 'left')}
                            {renderPlayer(card.teamA[1], card, idx, 'left')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', flexShrink: 0 }}>
                          <input
                            type="number"
                            className="input score-input"
                            value={card.scoreA}
                            onChange={(e) => onUpdateScore(idx, e.target.value === '' ? '' : parseInt(e.target.value), card.scoreB)}
                            onBlur={() => onBlurScore(idx)}
                            style={{ margin: 0 }}
                          />
                          <div className="vs-divider" style={{ margin: 0, padding: '0 0.25rem' }}>VS</div>
                          <input
                            type="number"
                            className="input score-input"
                            value={card.scoreB}
                            onChange={(e) => onUpdateScore(idx, card.scoreA, e.target.value === '' ? '' : parseInt(e.target.value))}
                            onBlur={() => onBlurScore(idx)}
                            style={{ margin: 0 }}
                          />
                        </div>

                        <div className="team" style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                          <div className="team-players" style={{ fontSize: '0.8rem' }}>
                            {renderPlayer(card.teamB[0], card, idx, 'right')}
                            {renderPlayer(card.teamB[1], card, idx, 'right')}
                          </div>
                        </div>
                      </div>

                      {card.debug && (
                        <div style={{ marginTop: '0.75rem', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-color-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ 
                                fontWeight: Math.abs(card.debug.totalA - card.debug.totalB) > 1.0 ? 'bold' : 'normal',
                                color: Math.abs(card.debug.totalA - card.debug.totalB) > 1.0 ? '#ff4d4d' : 'inherit'
                              }}>
                                Total DUPR: {card.debug.totalA.toFixed(1)} vs {card.debug.totalB.toFixed(1)}
                              </span>
                              <span>
                                Gap: 
                                <span style={{ 
                                  color: (maxPartnerGap !== '' && card.debug.gapA > maxPartnerGap) ? '#ff9800' : 'inherit',
                                  fontWeight: (maxPartnerGap !== '' && card.debug.gapA > maxPartnerGap) ? 'bold' : 'normal'
                                }}> {card.debug.gapA.toFixed(1)}</span>
                                 | 
                                <span style={{ 
                                  color: (maxPartnerGap !== '' && card.debug.gapB > maxPartnerGap) ? '#ff9800' : 'inherit',
                                  fontWeight: (maxPartnerGap !== '' && card.debug.gapB > maxPartnerGap) ? 'bold' : 'normal'
                                }}> {card.debug.gapB.toFixed(1)}</span>
                              </span>
                            </div>
                            <div>
                                Repeat Partner: {[
                                  card.debug.repeatA ? <span key="a" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Team A</span> : null,
                                  card.debug.repeatB ? <span key="b" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Team B</span> : null
                                ].filter(Boolean).reduce((prev, curr) => prev === null ? [curr] : [prev, ', ', curr], null as any) || 'Nil'}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="action-bar" style={{ marginTop: '0.5rem', paddingTop: '1rem' }}>
                        <button 
                          className="btn btn-accent" 
                          style={{ width: '100%' }}
                          onClick={() => onSaveResult(idx)}
                        >
                          <Save size={16} />
                          {card.isSaved ? 'Update Saved Result' : 'Save Result'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ADDED BOTTOM GENERATE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={onGenerateNextRound} 
              disabled={isEndlessMode && !allMatchesSaved && matches.length > 0}
              style={{ width: '100%', maxWidth: '400px', padding: '1rem', fontSize: '1.1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isEndlessMode ? 'Generate Next Round' : `Generate ${targetRounds} More Rounds`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
