const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. Database features will be disabled.');
}

const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseKey)
    : null;

module.exports = { supabase };
