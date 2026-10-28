import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null when the site is built without Supabase; accounts are then hidden. */
export const supabase = url && key ? createClient(url, key) : null;
