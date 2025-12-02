import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yqpszbsdxniwasjmmjcd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcHN6YnNkeG5pd2Fzam1tamNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODY0NTAsImV4cCI6MjA4MDE2MjQ1MH0.aMtZB44sZ-p0mtTZU7sZakc2WOdozMkMi2_j6-loqwE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
