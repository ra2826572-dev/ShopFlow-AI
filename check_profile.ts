import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProfile() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Supabase credentials not set.');
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const adminEmail = 'ra2826572@gmail.com';

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Profile found:', data);
  }
}

checkProfile();
