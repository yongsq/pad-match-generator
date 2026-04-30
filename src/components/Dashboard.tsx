import React, { useEffect, useState } from 'react';
import { getTournaments, createTournament, deleteTournament, type TournamentSession } from '../lib/db';
import { Plus, Calendar, History, ChevronRight, Trash2 } from 'lucide-react';

interface DashboardProps {
  onSelectTournament: (session: TournamentSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTournament }) => {
  const [sessions, setSessions] = useState<TournamentSession[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const data = await getTournaments();
    setSessions(data);
    setLoading(false);
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const session = await createTournament(newTitle.trim());
    if (session) onSelectTournament(session);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't trigger the session selection
    if (confirm('Are you sure you want to delete this session forever?')) {
      await deleteTournament(id);
      loadSessions();
    }
  };

  return (
    <div className="dashboard animate-fade-in" style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
          Tournament <span style={{ color: 'var(--accent-color)' }}>Command Center</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Manage your PAD Academy sessions and player database.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Create Session Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
            <Plus size={24} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Start New Session</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. DUPR Night - May 1st"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: '100%' }}
            />
            <button className="btn btn-primary" onClick={handleCreate} disabled={!newTitle.trim()}>
              Initialize Tournament
            </button>
          </div>
        </div>

        {/* Past Sessions Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', opacity: 0.8 }}>
            <History size={24} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Past Sessions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ opacity: 0.5, textAlign: 'center' }}>Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>No past sessions found.</p>
            ) : (
              sessions.map(s => (
                <div 
                  key={s.id} 
                  className="session-card" 
                  onClick={() => onSelectTournament(s)}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--accent-color)', opacity: 0.5 }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => handleDelete(e, s.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--danger-color)', 
                        opacity: 0.3,
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} style={{ opacity: 0.3 }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
