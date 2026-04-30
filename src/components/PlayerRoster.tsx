import { useState } from 'react';
import { Users, UserPlus, Trash2, Link, Hash, AlertCircle } from 'lucide-react';
import type { Player } from '../lib/matchLogic';

interface PlayerRosterProps {
  players: Player[];
  updatePlayer: (id: string, partial: Partial<Player>) => void;
  addPlayer: (name: string, dupr: number | '') => void;
  removePlayer: (id: string) => void;
}

export function PlayerRoster({ players, updatePlayer, addPlayer, removePlayer }: PlayerRosterProps) {
  const [newName, setNewName] = useState('');
  const [newDupr, setNewDupr] = useState<string>('');

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName.trim(), newDupr === '' ? '' : parseFloat(newDupr));
      setNewName('');
      setNewDupr('');
    }
  };

  return (
    <div className="glass-panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <Users size={20} />
          Player Roster ({players.length})
        </h2>
      </div>

      <div className="form-row" style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
        <input 
          className="input" 
          placeholder="New Player Name" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
        />
        <input 
          className="input" 
          type="number" 
          step="0.01" 
          placeholder="DUPR (e.g. 3.5)" 
          value={newDupr} 
          onChange={e => setNewDupr(e.target.value)}
          style={{ width: '120px', flex: 'none' }}
        />
        <button className="btn btn-accent" onClick={handleAdd} disabled={!newName.trim()}>
          <UserPlus size={16} />
          Add Player
        </button>
      </div>

      {players.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                 <th>DUPR</th>
                <th title="DUPR ID for bulk upload">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Hash size={14} /> ID (6-char)
                  </div>
                </th>
                <th style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Link size={14} />
                  Partner
                </th>
                <th>Status</th>
                <th>Games</th>
                <th>Sit Outs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => {
                const isIdIncomplete = p.duprId && p.duprId.length > 0 && p.duprId.length < 6;
                
                return (
                  <tr key={p.id} style={{ opacity: p.isActive ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <input 
                        type="number" 
                        className="input" 
                        style={{ width: '70px', padding: '0.25rem', height: '30px' }}
                        value={p.dupr}
                        onChange={e => updatePlayer(p.id, { dupr: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                       />
                    </td>
                    <td>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          className="input" 
                          style={{ 
                            width: '110px', 
                            padding: '0.25rem', 
                            height: '30px', 
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            border: isIdIncomplete ? '1px solid var(--danger-color)' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isIdIncomplete ? '0 0 5px rgba(255, 71, 87, 0.3)' : 'none'
                          }}
                          placeholder="6-CHAR"
                          value={p.duprId || ''}
                          maxLength={6}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            updatePlayer(p.id, { duprId: val });
                          }}
                        />
                        {isIdIncomplete && (
                          <div title="DUPR IDs are usually 6 characters">
                            <AlertCircle 
                              size={14} 
                              style={{ color: 'var(--danger-color)', marginLeft: '4px' }} 
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <select 
                        className="input"
                        style={{ width: '140px', padding: '0.25rem', height: '30px', fontSize: '0.8rem' }}
                        value={p.fixedPartnerId || ''}
                        onChange={e => updatePlayer(p.id, { fixedPartnerId: e.target.value || undefined })}
                      >
                        <option value="">None</option>
                        {players
                          .filter(other => other.id !== p.id)
                          .map(other => (
                            <option key={other.id} value={other.id}>{other.name}</option>
                          ))
                        }
                      </select>
                    </td>
                    <td>
                      <button 
                        className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}
                        onClick={() => updatePlayer(p.id, { isActive: !p.isActive })}
                      >
                        {p.isActive ? 'Active' : 'Out'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.gamesPlayed}</td>
                    <td style={{ textAlign: 'center', opacity: 0.5 }}>{p.consecutiveSitOuts}</td>
                    <td>
                      <button className="btn btn-icon btn-ghost" onClick={() => removePlayer(p.id)} title="Remove player">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
          No players added yet. Paste a list or add manually.
        </div>
      )}
    </div>
  );
}
