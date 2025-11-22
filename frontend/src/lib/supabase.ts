// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://dcstytsxdyxayujmfxmn.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc3R5dHN4ZHl4YXl1am1meG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzYzOTIsImV4cCI6MjA3NzI1MjM5Mn0.NutsskGKLrD55p-1RF8p1Yvihyjl8CQVWHm-Ac4w7KM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
