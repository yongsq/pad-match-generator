import { useState } from 'react';
import { ClipboardPaste, Settings2 } from 'lucide-react';
import { parseReclubPaste } from '../lib/matchLogic';
import type { Player } from '../lib/matchLogic';

interface ControlsProps {
  onSetup: (players: Player[]) => void;
  courts: number | '';
  setCourts: (n: number | '') => void;
  isEndlessMode: boolean;
  setIsEndlessMode: (b: boolean) => void;
  targetRounds: number | '';
  setTargetRounds: (n: number | '') => void;
  maxPartnerGap: number | '';
  setMaxPartnerGap: (n: number | '') => void;
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
  maxPartnerGap,
  setMaxPartnerGap,
  onPurge,
  onSyncSettings
}: ControlsProps) {
  const [pasteText, setPasteText] = useState('');

  const handleParse = () => {
    const parsed = parseReclubPaste(pasteText);
    if (parsed.length > 0) {
      onSetup(parsed);
      setPasteText(''); // Clear on successful parse
    } else {
      alert('Could not parse any players from paste.');
    }
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
            placeholder="1. Player Name&#10;2. Another Player&#10;..."
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
          <p className="text-xs text-color-muted" style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
            Adjusting courts limits how many players are selected per round (Courts x 4).
          </p>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <label className="text-sm font-semibold opacity-80" style={{ marginBottom: '0.25rem', display: 'block' }}>
              Max Partner DUPR Gap
            </label>
            <div className="form-row">
              <input
                type="number"
                step="0.1"
                className="input"
                min={0}
                max={5}
                value={maxPartnerGap}
                onChange={(e) => setMaxPartnerGap(e.target.value === '' ? '' : parseFloat(e.target.value))}
                onBlur={onSyncSettings}
                style={{ width: '80px', padding: '0.25rem' }}
              />
            </div>
            <p className="text-xs text-color-muted" style={{ marginTop: '0.25rem', fontSize: '0.7rem', opacity: 0.6 }}>
              Hard limit on skill difference within a team. Leave blank to disable.
            </p>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
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
    </div>
  );
}
