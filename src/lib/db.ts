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
  date: string;
  status: 'active' | 'archived';
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

export async function saveMatch(tournamentId: string, match: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('match_history')
    .upsert({
      tournament_id: tournamentId,
      round: match.round,
      court: match.court,
      team_a: match.teamA,
      team_b: match.teamB,
      score_a: match.scoreA === '' ? null : match.scoreA,
      score_b: match.scoreB === '' ? null : match.scoreB,
      is_saved: match.isSaved,
      user_id: user.id
    }, {
      onConflict: 'tournament_id,round,court'
    });

  if (error) console.error('Error saving match:', error.message);
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
