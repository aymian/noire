import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnhjschnvtoexrtnawor.supabase.co';
// Note: This should be your anon/public key from Supabase dashboard
// It should start with 'eyJ' and be much longer
const supabaseAnonKey = 'sb_publishable_vrQss_A_lOlW4bcHqR6HYA_ctS4f65L';

// Create client with error handling
let supabase: any;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
    console.error('Supabase initialization error:', error);
    // Create a mock client that won't break the app
    supabase = {
        auth: {
            signInWithOtp: async () => ({ error: new Error('Supabase not configured') }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ error: new Error('Supabase not configured') }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
            }),
        },
    };
}

export { supabase };
