import { supabase } from './supabaseClient';
import type { Player } from './matchLogic';

export interface MasterPlayer {
  id: string;
  name: string;
  dupr_id: string | null;
  last_known_dupr: number | null;
}

// 1. Sync a player to the Master Roster (Upsert)
export async function syncToMasterRoster(player: Player) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('master_roster')
    .upsert({
      name: player.name,
      dupr_id: player.duprId || null,
      last_known_dupr: typeof player.dupr === 'number' ? player.dupr : null,
      user_id: user.id
    }, {
      onConflict: 'name,user_id'
    });

  if (error) console.error('Error syncing to master roster:', error.message);
}

// 2. Fetch master roster for a list of names (Smart Match)
export async function lookupMasterPlayers(names: string[]): Promise<MasterPlayer[]> {
  const { data, error } = await supabase
    .from('master_roster')
    .select('id, name, dupr_id, last_known_dupr')
    .in('name', names);

  if (error) {
    console.error('Error looking up master players:', error.message);
    return [];
  }

  return data as MasterPlayer[];
}

// 3. Search Master Roster (for manual autocomplete)
export async function searchMasterRoster(query: string): Promise<MasterPlayer[]> {
  const { data, error } = await supabase
    .from('master_roster')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(5);

  if (error) return [];
  return data as MasterPlayer[];
}

// 4. Session Management
export interface TournamentSession {
  id: string;
  name: string;
  created_at: string;
  status: 'active' | 'archived';
  roster?: any[];
  settings?: any;
}

export async function createTournament(name: string): Promise<TournamentSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tournaments')
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error.message);
    return null;
  }
  return data as TournamentSession;
}

export async function getTournaments(): Promise<TournamentSession[]> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as TournamentSession[];
}

export async function updateTournamentState(id: string, roster: any[], settings: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('tournaments')
    .update({ roster, settings })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    console.error('Error syncing tournament state:', error.message);
  } else if (!data || data.length === 0) {
    console.error('Cloud Sync Failed: RLS blocked the update or tournament not found.');
  }
}

export async function saveMatch(tournamentId: string, match: any, retryCount = 0): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("Authentication Error: You are not logged in. Cannot save match.");
    return false;
  }

  // Manual UPSERT: Delete existing record first to bypass missing unique constraint
  await supabase
    .from('match_history')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('round', match.round)
    .eq('court', match.court)
    .eq('user_id', user.id);

  // Then insert the fresh record
  const { error } = await supabase
    .from('match_history')
    .insert({
      tournament_id: tournamentId,
      round: match.round,
      court: match.court,
      team_a: match.teamA,
      team_b: match.teamB,
      score_a: match.scoreA === '' ? -1 : match.scoreA,
      score_b: match.scoreB === '' ? -1 : match.scoreB,
      is_saved: match.isSaved,
      user_id: user.id
    });

  if (error) {
    console.error(`Error saving match (Attempt ${retryCount + 1}):`, error.message);
    if (retryCount < 3) {
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, retryCount) * 2000;
      await new Promise(res => setTimeout(res, delay));
      return saveMatch(tournamentId, match, retryCount + 1);
    } else {
      // If we fail after 3 retries, notify the user but don't crash
      alert(`CLOUD SYNC FAILED after 4 attempts.\n\nYour match data has been saved LOCALLY on this device. Please do not clear your browser cache.`);
      return false;
    }
  }
  return true;
}

export async function getSessionMatches(tournamentId: string) {
  const { data, error } = await supabase
    .from('match_history')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('court', { ascending: true });

  if (error) return [];
  return data;
}

export async function deleteUnsavedMatches(tournamentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('match_history')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('is_saved', false)
    .eq('user_id', user.id);

  if (error) console.error('Error deleting unsaved matches:', error.message);
}

export async function deleteTournament(id: string) {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting tournament:', error.message);
}

