import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehcjnxhfjjcejixoeloy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoY2pueGhmampjZWppeG9lbG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjcyNTQsImV4cCI6MjA5MzEwMzI1NH0.86jsOa0spOz5R5oV7JYhBYqie3Vvr8iu5EqSfWKUxw8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
