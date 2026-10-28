import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False when the site is built without Supabase; accounts are then hidden. */
export const supabaseEnabled = !!(url && key);

// The Supabase library is large (~180 KB), so it loads after the page instead
// of in every page's bundle. AuthProvider starts the load.
let client: SupabaseClient | null = null;
let loading: Promise<SupabaseClient | null> | undefined;

export function loadSupabase() {
  loading ??= supabaseEnabled
    ? import("@supabase/supabase-js").then(({ createClient }) => (client = createClient(url!, key!)))
    : Promise.resolve(null);
  return loading;
}

/** The client once loaded. Anything that runs after sign-in state is known can rely on it. */
export const supabaseClient = () => client;
