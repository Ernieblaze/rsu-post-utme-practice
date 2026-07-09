import { supabase } from './supabaseClient';

/**
 * Live presence — records what a signed-in user is currently doing (one row per
 * user, upserted). The Owner/HQ dashboard reads recent rows via the admin-only
 * get_live_activity RPC to show who's active right now. Best-effort: never
 * throws into the app.
 */
export async function recordActivity(
  userId: string,
  email: string | null,
  username: string | null,
  action: string
): Promise<void> {
  try {
    await supabase.from('user_activity').upsert({
      user_id: userId,
      email,
      username,
      action,
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* presence is non-essential */
  }
}
