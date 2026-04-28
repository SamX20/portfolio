import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fsmueisfdtuyljvpwlkj.supabase.co';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_OYvqHn-a05IyrCyBQEPx9A_A7CBprpt';
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ukM7KMdOHLW3_K0RbmZ6kg_gwBqoV3B';

export const supabase = createClient(supabaseUrl, supabaseAnon);
export const supabaseAdmin = createClient(supabaseUrl, supabaseService);