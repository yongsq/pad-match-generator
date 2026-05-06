import { Home, History, Milestone, Cpu, Zap, Swords, Download, Layout, Target, RefreshCw, Link } from 'lucide-react';

export function VersionHistory() {
  return (
    <div className="app-container" style={{ paddingBottom: '3rem' }}>
      <header className="header animate-fade-in" style={{ textAlign: 'center', position: 'relative' }}>
        <button 
          className="btn" 
          onClick={() => window.location.href = '/guide'}
          style={{ position: 'absolute', top: '0', left: '0' }}
        >
          <Home size={16} style={{ marginRight: '0.25rem' }} />
          Back to Guide
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <img src="/pad-logo.png" alt="PAD Pickleball" style={{ height: '60px', objectFit: 'contain' }} />
        </div>
        <h1 style={{ margin: '0.5rem 0' }}>
          <History style={{ display: 'inline', transform: 'translateY(4px)', marginRight: '0.5rem' }} size={28} />
          Version History
        </h1>
        <p>Evolution of the DUPR Match Generator</p>
      </header>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <Milestone size={32} style={{ color: 'var(--accent-color)' }} />
          <div>
            <h2 style={{ margin: 0 }}>Version 1.2 (The Cloud Sync Update)</h2>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Real-time Co-op & Broadcast TV</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Zap size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Supabase Cloud Synchronization</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                We transitioned from a purely local-storage architecture to a self-healing Cloud Sync model via Supabase. Organizers logged into the same account can now simultaneously manage the tournament and input scores across multiple devices without duplicate data or race conditions.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Layout size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Live TV Broadcast System</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Added a dedicated "TV View" mode (accessible by appending <code>?tv=1</code> to the URL). This dark-mode, high-contrast display automatically pairs with the host device via a local Broadcast Channel. Any reshuffling, scoring, or matching changes made by the host instantly mirror to the TV screen in real-time.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <Milestone size={32} style={{ color: 'var(--accent-color)', opacity: 0.5 }} />
          <div>
            <h2 style={{ margin: 0 }}>Version 1.1 (The Synergy Update)</h2>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Fixed Partnerships & Pairing Control</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Link size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Fixed Partner Linking</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                You can now link any two players in the roster as "Fixed Partners." These players will be treated as a single unit by the selection engine and will be guaranteed to play as teammates whenever they are assigned to the same court.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <History size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Synced Playtime Logic</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Balanced the sit-out logic for linked pairs. If one partner is rested due to court limits, the other is rested as well, ensuring their "Games Played" count stays in perfect sync for the lifetime of the partnership.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <Milestone size={32} style={{ color: 'var(--accent-color)', opacity: 0.5 }} />
          <div>
            <h2 style={{ margin: 0 }}>Version 1.0 (Official Launch)</h2>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>The Intelligence & Data Overhaul</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Cpu size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Global Selection Optimizer</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                We replaced the old Court-based "Pod" system. The engine now scans the entire participant pool simultaneously using a weighted penalty matrix. This effectively eliminates deterministic loops where top-tier players were previously locked into repeating partners.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Target size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Match Fairness Tuning (2.5 Threshold)</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Implemented a "Competitive First" philosophy. The engine now treats a DUPR sum difference of more than 2.5 points as a "Blowout," and will intelligently waive other rules (like the skill gap or variety rules) to ensure every game remains competitive and fun.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Zap size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Max Partner DUPR Gap (Soft Rule)</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Added a manual setting to define how close partners should be in skill level. The engine uses a "High Fence" approach—it strictly avoids pairing players with a gap larger than your input (e.g., 0.5) but can "climb the fence" if it's the only way to avoid a repeat or a total court blowout.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <RefreshCw size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Individual Match Reshuffle</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Gave manual control back to organizers. Each match card now features a "Reshuffle" icon that cycles the 4 assigned players through their 3 possible pairings locally. This allows for quick on-the-spot adjustments without recalculating the entire tournament.
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Swords size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Diagnostic Vetting System</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
                Real-time color-coded diagnostics added to every card. The system instantly flags:
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li style={{ color: '#ff4d4d' }}><strong>Red Alerts</strong> for Match Blowouts (&gt;1.0 total diff) or Repeat Partners.</li>
                  <li style={{ color: '#ff9800' }}><strong>Orange Alerts</strong> for Partner Gap violations based on your setup.</li>
                </ul>
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Download size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Multi-Format Data Exports</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Added full support for offline use. You can now export your generated rounds as <strong>High-Resolution PNGs</strong> (for social sharing/WhatsApp) or <strong>CSV Files</strong> (for DUPR reporting and recording).
              </p>
            </div>
          </div>

          <div className="feature-item" style={{ display: 'flex', gap: '1rem' }}>
            <Layout size={24} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>UX Enhancements & Optimization</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                Fully optimized the interface for mobile "Home Screen" installation. Added collapsible info sections for a cleaner mobile layout and fixed a critical bug where court numbers would soft-lock during setup.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
