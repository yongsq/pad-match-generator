import { useState } from 'react';
import { ClipboardPaste, Settings2, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { parseReclubPaste, type AlgorithmConfig, type Player } from '../lib/matchLogic';

interface ControlsProps {
  onSetup: (players: Player[]) => void;
  courts: number | '';
  setCourts: (n: number | '') => void;
  isEndlessMode: boolean;
  setIsEndlessMode: (b: boolean) => void;
  targetRounds: number | '';
  setTargetRounds: (n: number | '') => void;
  algorithmConfig: AlgorithmConfig;
  setAlgorithmConfig: (config: AlgorithmConfig | ((prev: AlgorithmConfig) => AlgorithmConfig)) => void;
  onPurge: () => void;
  onSyncSettings: () => void;
}

export function Controls({ 
  onSetup, 
  courts, 
  setCourts, 
  isEndlessMode, 
  setIsEndlessMode, 
  targetRounds, 
  setTargetRounds, 
  algorithmConfig,
  setAlgorithmConfig,
  onPurge,
  onSyncSettings
}: ControlsProps) {
  const [pasteText, setPasteText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleParse = () => {
    const parsed = parseReclubPaste(pasteText);
    if (parsed.length > 0) {
      onSetup(parsed);
      setPasteText('');
    } else {
      alert('Could not parse any players from paste.');
    }
  };

  const updateConfig = (partial: Partial<AlgorithmConfig>) => {
    setAlgorithmConfig(prev => {
      const next = { ...prev, ...partial };
      return next;
    });
    onSyncSettings();
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ position: 'relative' }}>
      <button 
        className="btn" 
        onClick={onPurge}
        title="Purge all records"
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--danger-color)', color: 'white', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
      >
        <span style={{ fontWeight: 'bold' }}>PURGE RECORDS</span>
      </button>

      <h2 className="section-title">
        <Settings2 size={20} />
        Session Setup
      </h2>
      
      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <div className="controls-group">
          <label className="text-sm font-semibold opacity-80" style={{ marginBottom: '0.25rem', display: 'block' }}>
            Paste Reclub Participants
          </label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="1. Player Name (M)&#10;2. Another Player (F)&#10;..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleParse} disabled={!pasteText.trim()}>
            <ClipboardPaste size={16} />
            Parse & Setup
          </button>
        </div>

        <div className="controls-group">
          <label className="text-sm font-semibold opacity-80" style={{ marginBottom: '0.25rem', display: 'block' }}>
            Match Format
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              className={`btn ${algorithmConfig.matchType === 'doubles' ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => updateConfig({ matchType: 'doubles' })}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
            >
              Doubles (2v2)
            </button>
            <button
              className={`btn ${algorithmConfig.matchType === 'singles' ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => updateConfig({ matchType: 'singles' })}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
            >
              Singles (1v1)
            </button>
          </div>

          <label className="text-sm font-semibold opacity-80" style={{ marginTop: '0.5rem', marginBottom: '0.25rem', display: 'block' }}>
            Number of Courts
          </label>
          <div className="form-row">
            <input
              type="number"
              className="input court-input"
              min={1}
              max={20}
              value={courts}
              onChange={(e) => setCourts(e.target.value === '' ? '' : parseInt(e.target.value))}
              onBlur={onSyncSettings}
              style={{ width: '60px', padding: '0.25rem' }}
            />
          </div>
          <p className="text-xs text-color-muted" style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
            {algorithmConfig.matchType === 'singles' 
              ? 'Selects Courts x 2 players per round.' 
              : 'Selects Courts x 4 players per round.'}
          </p>

          {algorithmConfig.matchType === 'doubles' && (
            <div style={{ marginTop: '0.75rem' }}>
              <label className="text-sm opacity-80" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <input 
                  type="checkbox" 
                  checked={algorithmConfig.fixedPartnersOnlyVsFixed} 
                  onChange={(e) => updateConfig({ fixedPartnersOnlyVsFixed: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                Fixed partners only play against fixed partners
              </label>
            </div>
          )}

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <label className="text-sm font-semibold opacity-80" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={isEndlessMode} 
                onChange={(e) => {
                  setIsEndlessMode(e.target.checked);
                  onSyncSettings();
                }}
                style={{ width: '16px', height: '16px' }}
              />
              Endless Mode
            </label>
            {!isEndlessMode && (
              <div className="form-row" style={{ marginTop: '0.5rem' }}>
                <span className="text-xs" style={{ whiteSpace: 'nowrap' }}>Pre-generate:</span>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={20}
                  value={targetRounds}
                  onChange={(e) => setTargetRounds(e.target.value === '' ? '' : parseInt(e.target.value))}
                  onBlur={onSyncSettings}
                  style={{ width: '80px', padding: '0.25rem' }}
                />
                <span className="text-xs">Rounds</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Advanced Algorithm Config Box */}
      <div 
        style={{ 
          marginTop: '1.5rem', 
          background: 'rgba(0,0,0,0.15)', 
          borderRadius: '0.75rem', 
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden'
        }}
      >
        <div 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          style={{ 
            padding: '0.85rem 1.25rem', 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Sliders size={18} style={{ color: 'var(--accent-color)' }} />
            Advanced Matching Algorithm Config
          </div>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {showAdvanced && (
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
            
            {/* Match Balance Weight */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={algorithmConfig.enableMatchBalance} 
                    onChange={e => updateConfig({ enableMatchBalance: e.target.checked })} 
                  />
                  Match Skill Balance Penalty
                </label>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Penalizes team DUPR sum differences.</div>
              </div>
              <input 
                type="number" 
                className="input" 
                disabled={!algorithmConfig.enableMatchBalance}
                value={algorithmConfig.matchBalanceWeight} 
                onChange={e => updateConfig({ matchBalanceWeight: Number(e.target.value) || 0 })} 
                style={{ width: '90px', padding: '0.25rem' }}
              />
            </div>

            {/* Partner Variety Weight */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={algorithmConfig.enablePartnerVariety} 
                    onChange={e => updateConfig({ enablePartnerVariety: e.target.checked })} 
                  />
                  Repeat Partner Penalty
                </label>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Discourages partnering with previous teammates.</div>
              </div>
              <input 
                type="number" 
                className="input" 
                disabled={!algorithmConfig.enablePartnerVariety}
                value={algorithmConfig.partnerVarietyWeight} 
                onChange={e => updateConfig({ partnerVarietyWeight: Number(e.target.value) || 0 })} 
                style={{ width: '90px', padding: '0.25rem' }}
              />
            </div>

            {/* Opponent Variety Weight */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={algorithmConfig.enableOpponentVariety} 
                    onChange={e => updateConfig({ enableOpponentVariety: e.target.checked })} 
                  />
                  Repeat Opponent Penalty
                </label>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Penalizes facing the same opponents multiple times.</div>
              </div>
              <input 
                type="number" 
                className="input" 
                disabled={!algorithmConfig.enableOpponentVariety}
                value={algorithmConfig.opponentVarietyWeight} 
                onChange={e => updateConfig({ opponentVarietyWeight: Number(e.target.value) || 0 })} 
                style={{ width: '90px', padding: '0.25rem' }}
              />
            </div>

            {/* Max Partner DUPR Gap (Nested Here) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={algorithmConfig.enablePartnerGap} 
                    onChange={e => updateConfig({ enablePartnerGap: e.target.checked })} 
                  />
                  Max Partner DUPR Gap Limit
                </label>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Limit skill difference within a team.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem' }}>Max Gap:</span>
                <input 
                  type="number" 
                  step="0.1"
                  className="input" 
                  disabled={!algorithmConfig.enablePartnerGap}
                  value={algorithmConfig.maxPartnerGap} 
                  onChange={e => updateConfig({ maxPartnerGap: e.target.value === '' ? '' : parseFloat(e.target.value) })} 
                  placeholder="Blank"
                  style={{ width: '70px', padding: '0.25rem' }}
                />
              </div>
            </div>

            {/* Fixed Partner Enforcement Weight */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={algorithmConfig.enableFixedPartner} 
                    onChange={e => updateConfig({ enableFixedPartner: e.target.checked })} 
                  />
                  Fixed Partner Enforcement Penalty
                </label>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Massive penalty applied if fixed partners are split.</div>
              </div>
              <input 
                type="number" 
                className="input" 
                disabled={!algorithmConfig.enableFixedPartner}
                value={algorithmConfig.fixedPartnerWeight} 
                onChange={e => updateConfig({ fixedPartnerWeight: Number(e.target.value) || 0 })} 
                style={{ width: '90px', padding: '0.25rem' }}
              />
            </div>

            {/* Gender Balance Logic */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={algorithmConfig.enableGenderBalance} 
                      onChange={e => updateConfig({ enableGenderBalance: e.target.checked })} 
                    />
                    Gender Balancing Logic
                  </label>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem' }}>Enforces mixed doubles when 2M/2F are on court.</div>
                </div>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: algorithmConfig.enableGenderBalance ? 1 : 0.5 }}>
                  <input 
                    type="checkbox" 
                    disabled={!algorithmConfig.enableGenderBalance}
                    checked={algorithmConfig.disallowMMvsFF} 
                    onChange={e => updateConfig({ disallowMMvsFF: e.target.checked })} 
                  />
                  Disallow MM vs FF
                </label>
              </div>
            </div>

            {/* Randomize Court Assignments */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  checked={algorithmConfig.randomizeCourts} 
                  onChange={e => updateConfig({ randomizeCourts: e.target.checked })} 
                />
                Randomize Court Assignment Order
              </label>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1.5rem', marginTop: '0.2rem' }}>
                Shuffles court numbers each round so high DUPR matches aren't systematically assigned to the same end courts.
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
