import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, Mail, Lock, ShieldCheck, UserPlus } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Clear any existing anonymous session on mount
  useEffect(() => {
    const clearGuest = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.is_anonymous) {
        await supabase.auth.signOut();
      }
    };
    clearGuest();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        alert('Account created! You can now log in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--accent-color)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)'
          }}>
            <ShieldCheck size={32} color="#0a0f1e" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>PAD Academy</h2>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isSignUp ? 'Create Admin Account' : 'Match Management Login'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              className="input"
              placeholder="admin@pad.academy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-color)', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              opacity: 0.7,
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
        Only authorized academy administrators should access this portal.
      </p>
    </div>
  );
};
