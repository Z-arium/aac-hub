"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { exportLocal } from "@/lib/sync";

const input = "mt-1 w-full rounded border border-line bg-panel-2 px-3 py-2 text-text";
const button = "rounded border border-line px-4 py-2 hover:bg-panel-2 disabled:opacity-50";
const primary = "rounded bg-accent px-4 py-2 font-semibold text-bg hover:opacity-90 disabled:opacity-50";
const discordEnabled = !!process.env.NEXT_PUBLIC_AUTH_DISCORD;
// Sign-in emails only carry a code once custom email templates are set up.
const emailCodes = !!process.env.NEXT_PUBLIC_AUTH_EMAIL_CODE;

function redirectUrl() {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/account/`;
}

export default function Account() {
  const { enabled, user } = useAuth();
  if (!enabled || !supabase) return <p className="text-muted">Accounts aren&apos;t switched on for this copy of the site yet.</p>;
  if (user === undefined) return <p className="text-muted">Loading…</p>;
  return user ? <Profile userId={user.id} email={user.email} /> : <SignIn />;
}

/** The error Supabase puts in the URL when a sign-in link fails (expired, already used, ...). */
function linkError() {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  const message = params.get("error_description");
  if (!message) return "";
  return params.get("error_code") === "otp_expired"
    ? "That sign-in link has expired or was already used. Send yourself a new one below."
    : `Sign-in failed: ${message.replaceAll("+", " ")}`;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => setError(linkError()), []);

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase!.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) setError(error.message.includes("expired") ? "That code has expired or is wrong. Check it, or send a new one." : error.message);
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl() } });
    if (error) {
      setError(error.message);
      setStatus("idle");
    } else setStatus("sent");
  }

  return (
    <div className="max-w-md space-y-6 rounded-xl border border-line bg-panel p-6">
      {discordEnabled && (
        <>
          <button
            className={`${primary} w-full`}
            onClick={() => supabase!.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: redirectUrl() } })}
          >
            Sign in with Discord
          </button>
          <p className="text-center text-sm text-muted">or</p>
        </>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status === "sent" && !emailCodes ? (
        <div className="space-y-3">
          <p>
            We emailed a sign-in link to <strong>{email}</strong>. Open it <strong>in this same browser</strong> and you&apos;ll land here signed in.
          </p>
          <button type="button" className="w-full text-sm text-muted underline" onClick={() => setStatus("idle")}>
            Use a different email or send a new link
          </button>
        </div>
      ) : status === "sent" ? (
        <form onSubmit={verifyCode} className="space-y-3">
          <p>
            We emailed a code to <strong>{email}</strong>. Type it here, or click the link in the email.
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${input} text-center text-2xl tracking-widest`}
            placeholder="123456"
          />
          <button type="submit" className={`${primary} w-full`}>
            Sign in
          </button>
          <button type="button" className="w-full text-sm text-muted underline" onClick={() => setStatus("idle")}>
            Use a different email or send a new code
          </button>
        </form>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <label className="block text-sm">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@example.com" />
          </label>
          <button type="submit" className={`${discordEnabled ? button : primary} w-full`} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : emailCodes ? "Email me a sign-in code" : "Email me a sign-in link"}
          </button>
        </form>
      )}
      <p className="text-xs text-muted">No password needed. Your checklist, timer alerts and saved builds already in this browser are added to your account when you sign in.</p>
    </div>
  );
}

interface ProfileRow {
  display_name: string | null;
  server: string | null;
  main_character: string | null;
}

function Profile({ userId, email }: { userId: string; email?: string }) {
  const [profile, setProfile] = useState<ProfileRow>({ display_name: "", server: "", main_character: "" });
  const [saved, setSaved] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    supabase!
      .from("profiles")
      .select("display_name, server, main_character")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => data && setProfile(data));
  }, [userId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase!.from("profiles").upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
    setSaved(error ? `Couldn't save: ${error.message}` : "Saved");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ email, profile, saved: exportLocal() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aac-hub-my-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function deleteAccount() {
    const { error } = await supabase!.rpc("delete_my_account");
    if (error) return setSaved(`Couldn't delete: ${error.message}`);
    await supabase!.auth.signOut();
  }

  const field = (key: keyof ProfileRow, label: string, placeholder: string) => (
    <label className="block text-sm">
      {label}
      <input
        maxLength={40}
        value={profile[key] ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          setProfile({ ...profile, [key]: e.target.value });
          setSaved("");
        }}
        className={input}
      />
    </label>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={save} className="space-y-4 rounded-xl border border-line bg-panel p-6">
        <h2 className="font-semibold">Profile</h2>
        <p className="text-sm text-muted">Signed in as {email ?? "a Discord account"}.</p>
        {field("display_name", "Display name", "Shown on builds you share")}
        {field("server", "Server", "e.g. Kyrios")}
        {field("main_character", "Main character", "Character name")}
        <div className="flex items-center gap-3">
          <button type="submit" className={primary}>
            Save
          </button>
          <span className="text-sm text-muted">{saved}</span>
        </div>
      </form>
      <div className="space-y-4 rounded-xl border border-line bg-panel p-6">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-muted">Your daily and weekly checklist, timer alert settings and saved builds are saved to your account and follow you to any device you sign in on.</p>
        <div className="flex flex-wrap gap-3">
          <button className={button} onClick={() => supabase!.auth.signOut()}>
            Sign out
          </button>
          <button className={button} onClick={exportData}>
            Download my data
          </button>
          <button className={`${button} text-red-400`} onClick={() => (confirmDelete ? deleteAccount() : setConfirmDelete(true))}>
            {confirmDelete ? "Click again to delete forever" : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}
