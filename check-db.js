import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehcjnxhfjjcejixoeloy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoY2pueGhmampjZWppeG9lbG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjcyNTQsImV4cCI6MjA5MzEwMzI1NH0.86jsOa0spOz5R5oV7JYhBYqie3Vvr8iu5EqSfWKUxw8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@pad.academy',
    password: 'password123'
  }); // I don't know the user's password, so I might not be able to test RLS directly.
  
  // Let's just try to get the table schema.
  const { data, error } = await supabase
    .from('match_history')
    .select('*')
    .limit(1);
    
  console.log('Select Error:', error);
  
  // Let's check tournaments table
  const { data: tData, error: tError } = await supabase
    .from('tournaments')
    .select('*');
  console.log('Tournaments found:', tData?.length, 'Error:', tError);
}

testInsert();
