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
        <p>Complete documentation for the DUPR Match Generator</p>
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
        <h2 className="section-title"><Settings2 size={20} /> 2. Session Setup</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Paste Participants:</strong> Copy your player list directly from the Reclub app. Paste it into the "Session Setup" box and click "Parse & Setup". The app will automatically read the names and neatly ignore headers, waitlists, and venue info.</li>
            <li><strong>Set Courts & Gap Rule:</strong> Specify how many courts are available. You can also set a <strong>Max Partner DUPR Gap</strong> (e.g., 0.5) to ensure teammates are close in skill level. The engine will respect this gap unless a game blowout is otherwise unavoidable.</li>
            <li><strong>Endless vs Pre-generate:</strong> 
              <ul style={{ listStyleType: 'circle', paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Endless Mode (Default):</strong> Designed for dynamic play. You generate one round at a time. This seamlessly adapts if players show up late or leave early!</li>
                <li><strong>Pre-generate Mode:</strong> Designed for structured events. Uncheck Endless Mode and enter a target (e.g. 5) to instantly schedule multiple rounds. </li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s', marginTop: '1rem' }}>
        <h2 className="section-title"><Users size={20} /> 3. Roster Management</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Adding DUPR:</strong> Add a player's exact DUPR rating in the text box next to their name. If left blank, they are treated as a beginner.</li>
            <li><strong>Fixed Partners:</strong> Have a married couple or a dedicated pair playing? Enter an identical, unique word (e.g., "TeamA") into the "Fixed Partner" field for both players. The system will permanently bind them together on the court while tracking their sit-out rotations perfectly in sync!</li>
            <li><strong>Active vs Sit-Out:</strong> Need a player to leave early or rest a round? Uncheck the 'Active' box next to their name! They will be ignored entirely during the next generation. Check it again when they are ready to return.</li>
            <li><strong>Late Joins:</strong> Someone showed up late? Just type their name and hit "Add". They will instantly be cycled into the next available round!</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s', marginTop: '1rem' }}>
        <h2 className="section-title"><Play size={20} /> 4. Match-Making Logic</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>Our <strong>Global Selection Optimizer</strong> guarantees the fairest possible pairings by scanning the entire roster simultaneously:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Play Time Equity:</strong> The engine strictly calls players with the <em>lowest</em> game count to the court first, then those resting the longest.</li>
            <li><strong>Penalty Matrix:</strong> The engine evaluates every possible matchup and applies penalties for repeat partners (Heavy penalty) and repeat opponents (Medium penalty).</li>
            <li><strong>Balanced Matches:</strong> The optimizer prioritizes <strong>Competitive Fairness</strong>. If a matchup's total DUPR difference is too great, it will "pivot" to find a more balanced game, even if it means slightly bending the variety rules.</li>
            <li><strong>Smart Randomization:</strong> When you click "Regenerate," the engine picks randomly from the <strong>Top 3</strong> mathematically best pairings so you get fresh results every time.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.5s', marginTop: '1rem' }}>
        <h2 className="section-title"><Save size={20} /> 5. Diagnostic Vetting & Cloud Sync</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Vetting Panels:</strong> Every match card has a diagnostic footer. It turns <strong>RED</strong> if there is a major skill blowout or repeat partner, and <strong>ORANGE</strong> if the skill gap is wider than your preferred setting.</li>
            <li><strong>Match Reshuffle:</strong> Don't like a specific court's pairing? Click the <strong>Refresh icon</strong> in the match header to cycle through the 3 possible team combinations for those 4 players!</li>
            <li><strong>Cloud Syncing:</strong> Match generation, roster management, and scoring are automatically synced to the Cloud in real-time. This allows Co-Organizers logged into the same account to simultaneously enter scores on their own phones!</li>
            <li><strong>Save Result:</strong> Saving a result locks in the matrix penalties and logs the score permanently in the Results table at the bottom.</li>
            <li><strong>Regenerate Rounds:</strong> Hitting <span style={{ background: 'var(--danger-color)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>Regenerate Matches</span> will erase all <em>unsaved</em> rounds and re-calculate the session from that point forward.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.55s', marginTop: '1rem' }}>
        <h2 className="section-title"><Download size={20} /> 6. Exporting Results</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>You can export all generated rounds (saved and unsaved) at any time:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>PNG Image:</strong> Perfect for sharing the upcoming schedule to WhatsApp or social groups.</li>
            <li><strong>CSV File:</strong> Ideal for administrators who need a spreadsheet for DUPR reporting or long-term record keeping.</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.6s', marginTop: '1rem' }}>
        <h2 className="section-title"><RefreshCw size={20} /> 7. Ending The Event</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>The <strong>PURGE RECORDS</strong> button is the "factory reset" in the setup screen. Your phone saves your tournament data automatically. When the event is over, hit Purge Records to wipe all history and start fresh for the next session.</p>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.65s', marginTop: '1rem' }}>
        <h2 className="section-title"><Play size={20} /> 8. TV Broadcast System</h2>
        <div style={{ padding: '0.5rem 0 1rem 1rem', lineHeight: '1.6' }}>
          <p>Want to display live matches to the players on a TV? Just copy the browser URL and add <code>?tv=1</code> to the end of it (e.g., <code>https://pad.academy?tv=1</code>). This launches a dark-mode, minimalist TV graphic that automatically updates in real-time without ever needing to be refreshed!</p>
        </div>
      </div>
    </div>
  );
}
