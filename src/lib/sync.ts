"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "./supabase";

// Saved data lives in localStorage under "aac-" keys. When someone is signed
// in, every write is also saved to their account, and signing in pulls the
// account's copy down (keys the account doesn't have yet are uploaded).

const PREFIX = "aac-";
const listeners = new Map<string, Set<() => void>>();
let userId: string | null = null;

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export function writeSynced(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  notify(key);
  const supabase = supabaseClient();
  if (supabase && userId) {
    supabase
      .from("user_storage")
      .upsert({ user_id: userId, key, value, updated_at: new Date().toISOString() })
      .then(({ error }) => error && console.warn("Couldn't save to your account:", error.message));
  }
}

/** Called by the auth provider whenever the signed-in user changes. */
export async function setSyncUser(id: string | null) {
  userId = id;
  const supabase = supabaseClient();
  if (!supabase || !id) return;
  const { data, error } = await supabase.from("user_storage").select("key, value");
  if (error || userId !== id) return;
  const remote = new Set<string>();
  for (const row of data) {
    remote.add(row.key);
    try {
      localStorage.setItem(row.key, JSON.stringify(row.value));
    } catch {}
    notify(row.key);
  }
  const upload = localKeys()
    .filter((k) => !remote.has(k))
    .map((key) => ({ user_id: id, key, value: readLocal(key, null) }))
    .filter((row) => row.value !== null);
  if (upload.length) await supabase.from("user_storage").upsert(upload);
}

function localKeys() {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
  } catch {}
  return keys;
}

/** Every saved key and value, for "export my data". */
export function exportLocal() {
  return Object.fromEntries(localKeys().map((k) => [k, readLocal(k, null)]));
}

/** Like useState, but saved in the browser and, when signed in, to the account. */
export function useSynced<T>(key: string | null, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    if (!key) return;
    const load = () => setValue(readLocal(key, fallback));
    load();
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(load);
    return () => void listeners.get(key)!.delete(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback((next: T) => {
    setValue(next);
    if (key) writeSynced(key, next);
  }, [key]);
  return [value, save] as const;
}
