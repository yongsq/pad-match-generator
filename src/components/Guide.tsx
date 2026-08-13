import { BookOpen, Home, Play, Settings2, RefreshCw, Smartphone, Save, Users, Target, AlertTriangle, History, Download } from 'lucide-react';

export function Guide() {
  return (
    <div className="app-container" style={{ paddingBottom: '3rem' }}>
      <header className="header animate-fade-in" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/'}
          >
            <Home size={16} style={{ marginRight: '0.25rem' }} />
            Home
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/version'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <History size={14} />
            History
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <img src="/pad-logo.png" alt="PAD Pickleball" style={{ height: '60px', objectFit: 'contain' }} />
        </div>
        <h1 style={{ margin: '0.5rem 0' }}>
          <BookOpen style={{ display: 'inline', transform: 'translateY(4px)', marginRight: '0.5rem' }} size={28} />
          User Guide
        </h1>
        <p>Complete documentation for the DUPR Match Generator V3</p>
      </header>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <h2 className="section-title"><Target size={20} /> What We Solve</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>Reclub's native match generation engine struggles to generate a fair amount of matches and matchups if you do not meet the perfect mathematical ratio of courts, players, and rounds. Crucially, the Reclub engine cannot group players fairly based on skill level (DUPR ratings). This means when you host DUPR matches with a large number of participants, some players get too many matches, some get too few, and you suffer from extremely uneven skill-level pairings.</p>
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>This app solves that. Our custom generator guarantees perfectly fair playtime and aggressively balanced skill pairings regardless of your combination of players, courts, or rounds.</p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.08s', marginTop: '1rem' }}>
        <h2 className="section-title"><AlertTriangle size={20} /> Platform Limitations</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>There is currently no direct integration path available to pipe data automatically into Reclub or DUPR. Please use this dashboard to sequence your entire tournament fairly, but <strong>you must manually create the matches on Reclub using the rosters generated here, and manually submit your final match results.</strong></p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s', marginTop: '1rem' }}>
        <h2 className="section-title"><Smartphone size={20} /> 1. Quick Setup (Install App)</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '0.5rem' }}>For the best experience, you should install this generator as a native app on your phone:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>On iOS (Safari):</strong> Tap the 'Share' icon (square with an up arrow), scroll down, and tap <strong>"Add to Home Screen"</strong>.</li>
            <li><strong>On Android (Chrome):</strong> Tap the 3-dot menu and tap <strong>"Add to Home screen"</strong>.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '1rem' }}>
        <h2 className="section-title"><Settings2 size={20} /> 2. Session Setup & Match Formats</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Paste Participants:</strong> Copy your player list directly from the Reclub app. Paste it into the "Session Setup" box and click "Parse & Setup". The app automatically extracts player names and gender tags like <code>(M)</code> or <code>(F)</code>.</li>
            <li><strong>Doubles (2v2) vs Singles (1v1):</strong> Toggle between Doubles and Singles mode. Singles mode allocates 2 players per court per round.</li>
            <li><strong>Fixed Partners Only vs Fixed:</strong> Check this option to strictly match fixed pairs against other fixed pairs. Leftover odd fixed pairs will sit out on a fair rotating basis without ever facing solo players.</li>
            <li><strong>Advanced Algorithm Configuration:</strong> Expand the collapsible <em>"⚙️ Advanced Matching Algorithm Config"</em> box to customize penalty weights for Skill Balance, Repeat Partner, Repeat Opponent, Max Partner Gap, Fixed Partner Enforcement, Gender Balancing, and Court Randomization.</li>
          </ol>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', marginTop: '1rem' }}>
        <h2 className="section-title"><Users size={20} /> 3. Roster Management & Real-Time Autocomplete</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Master Autocomplete:</strong> As you type into the "New Player Name" input, matching players from your master list appear automatically. Click a suggestion to auto-fill their DUPR, 6-character DUPR ID, and Gender instantly!</li>
            <li><strong>Gender Column:</strong> Specify or edit a player's gender (<code>M</code> / <code>F</code>) directly in the roster table.</li>
            <li><strong>Fixed Partners:</strong> Select a partner from the dropdown next to a player to permanently bind them together. The system syncs their court assignments and sit-out rotations.</li>
            <li><strong>Active vs Sit-Out:</strong> Uncheck 'Active' to temporarily pause a player from match generation. Check it again when they return.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s', marginTop: '1rem' }}>
        <h2 className="section-title"><Play size={20} /> 4. Match-Making & Gender Engine</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Play Time Equity:</strong> Prioritizes active players with the fewest games played and longest sit-outs first.</li>
            <li><strong>Mixed Doubles Logic:</strong> On 2M/2F courts, automatically enforces <code>M+F vs M+F</code> mixed doubles and penalizes <code>MM vs FF</code> configurations.</li>
            <li><strong>Court Assignment Randomization:</strong> Shuffles court numbers each round to prevent higher DUPR tiers from systematically clustering on specific end courts.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.5s', marginTop: '1rem' }}>
        <h2 className="section-title"><Save size={20} /> 5. Diagnostic Vetting & Cloud Sync</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Vetting Panels:</strong> Every match card displays color-coded diagnostics for skill gaps and repeat pairings.</li>
            <li><strong>Match Reshuffle:</strong> Click the refresh icon on any card to cycle through possible team combinations locally.</li>
            <li><strong>Cloud Syncing:</strong> Real-time syncing to Supabase allows multiple co-organizers to score matches simultaneously.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.55s', marginTop: '1rem' }}>
        <h2 className="section-title"><Download size={20} /> 6. Official DUPR CSV Export</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>DUPR CSV File:</strong> Export single-match CSVs matching official DUPR import standards. Customize the <strong>Location</strong> field (defaults to <code>PAD Pickleball Premiere Hotel</code>) in Export Settings.</li>
            <li><strong>PNG Schedule Image:</strong> Export high-resolution PNG schedule graphics to share on WhatsApp or social media.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.6s', marginTop: '1rem' }}>
        <h2 className="section-title"><RefreshCw size={20} /> 7. Ending The Event</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>The <strong>PURGE RECORDS</strong> button resets all current session data when your tournament is complete, letting you start fresh for the next event.</p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.65s', marginTop: '1rem' }}>
        <h2 className="section-title"><Play size={20} /> 8. TV Broadcast System</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>Launch live court displays by appending <code>?tv=1</code> to the URL (or clicking the TV Display button). Live match updates mirror automatically in real-time!</p>
        </div>
      </div>
    </div>
  );
}
