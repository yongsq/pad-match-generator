import { useState } from 'react';
import { Users, UserPlus, Trash2, Link, Hash } from 'lucide-react';
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
                    <Hash size={14} /> ID
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
              {players.map(p => (
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
                    <input 
                      className="input" 
                      style={{ width: '90px', padding: '0.25rem', height: '30px', fontSize: '0.8rem' }}
                      placeholder="Optional"
                      value={p.duprId || ''}
                      onChange={e => updatePlayer(p.id, { duprId: e.target.value })}
                    />
                  </td>
                  <td>
                    <select 
                      className="input"
                      tabIndex={-1}
                      style={{ width: '120px', padding: '0.2rem', height: '30px', fontSize: '0.8rem' }}
                      value={p.fixedPartnerId || ''}
                      onChange={e => {
                        const newPartnerId = e.target.value;
                        const oldPartnerId = p.fixedPartnerId;
                        
                        // 1. Clear old partnership if it existed
                        if (oldPartnerId) {
                          updatePlayer(oldPartnerId, { fixedPartnerId: undefined });
                        }
                        
                        // 2. Set new partnership
                        if (newPartnerId === '') {
                          updatePlayer(p.id, { fixedPartnerId: undefined });
                        } else {
                          updatePlayer(p.id, { fixedPartnerId: newPartnerId });
                        }
                      }}
                    >
                      <option value="">None</option>
                      {players
                        .filter(other => {
                          if (other.id.toLowerCase().trim() === p.id.toLowerCase().trim()) return false;
                          if (!other.fixedPartnerId) return true;
                          return other.fixedPartnerId.toLowerCase().trim() === p.id.toLowerCase().trim();
                        })
                        .map(other => (
                          <option key={other.id} value={other.id}>{other.name}</option>
                        ))
                      }
                    </select>
                  </td>
                  <td>
                    <button 
                      className={`status-badge ${p.isActive ? 'status-active' : 'status-inactive'}`}
                      tabIndex={-1}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => updatePlayer(p.id, { isActive: !p.isActive })}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>{p.gamesPlayed}</td>
                  <td>{p.consecutiveSitOuts}</td>
                  <td style={{ width: '40px' }}>
                    <button 
                      title="Remove player"
                      tabIndex={-1}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', opacity: 0.7 }}
                      onClick={() => {
                        if(confirm(`Remove ${p.name} from roster entirely?`)) {
                          removePlayer(p.id);
                        }
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '1'}
                      onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0' }}>No players loaded yet. Parse attendees above.</p>
      )}
    </div>
  );
}
