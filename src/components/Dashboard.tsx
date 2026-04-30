import React, { useEffect, useState } from 'react';
import { getTournaments, createTournament, type TournamentSession } from '../lib/db';
import { Plus, Calendar, History, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onSelectTournament: (session: TournamentSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTournament }) => {
  const [sessions, setSessions] = useState<TournamentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await getTournaments();
    setSessions(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newSessionName.trim()) return;
    const newSession = await createTournament(newSessionName.trim());
    if (newSession) {
      onSelectTournament(newSession);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading your tournaments...</div>;

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Tournament Command Center</h1>
        <p style={{ opacity: 0.6 }}>Manage your PAD Academy sessions and player database.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Create New Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="section-title">
            <Plus size={20} /> Start New Session
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input 
              className="input" 
              placeholder="e.g. DUPR Night - May 1st"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              style={{ width: '100%' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleCreate}
              disabled={!newSessionName.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Initialize Tournament
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="section-title">
            <History size={20} /> Past Sessions
          </h2>
          <div style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sessions.length > 0 ? sessions.map(s => (
              <div 
                key={s.id} 
                className="session-card"
                onClick={() => onSelectTournament(s)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {new Date(s.date).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight size={18} opacity={0.5} />
              </div>
            )) : (
              <p style={{ opacity: 0.4, fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No past sessions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
