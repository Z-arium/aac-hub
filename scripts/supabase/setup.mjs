// Sets up the Supabase project through the Management API: runs any SQL file in
// supabase/migrations that hasn't run yet, and applies the sign-in settings.
// Needs SUPABASE_ACCESS_TOKEN (a personal access token) and SUPABASE_PROJECT_REF.
// DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET switch on Discord sign-in.
import { readdir, readFile } from "node:fs/promises";

const { SUPABASE_ACCESS_TOKEN: token, SUPABASE_PROJECT_REF: ref, SITE_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = process.env;
if (!token || !ref) throw new Error("Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF");
const api = `https://api.supabase.com/v1/projects/${ref}`;

async function call(method, path, body) {
  const res = await fetch(api + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

const sql = (query) => call("POST", "/database/query", { query });

// Migrations ------------------------------------------------------------------

await sql("create table if not exists public.schema_migrations (name text primary key, ran_at timestamptz not null default now()); alter table public.schema_migrations enable row level security;");
const ran = new Set((await sql("select name from public.schema_migrations")).map((r) => r.name));
const dir = new URL("../../supabase/migrations/", import.meta.url);
for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
  if (ran.has(file)) continue;
  const body = await readFile(new URL(file, dir), "utf8");
  await sql(`${body}\n;insert into public.schema_migrations (name) values ('${file.replaceAll("'", "''")}');`);
  console.log(`Ran ${file}`);
}

// Sign-in settings ------------------------------------------------------------

const site = SITE_URL ?? "https://z-arium.github.io/aac-hub/";
// Sign-in emails carry a code as well as a link, so people can finish signing
// in on the tab they started from even if the link opens somewhere else.
// Supabase only allows custom templates once a custom SMTP server is set up.
const email = (intro) => `<h2>AA Classic Hub</h2>
<p>${intro} Enter this code on the sign-in page:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>Or <a href="{{ .ConfirmationURL }}">click here to sign in</a>.</p>
<p style="color:#888">If you didn't ask for this, you can ignore this email.</p>`;
const auth = {
  site_url: site,
  uri_allow_list: [`${site.replace(/\/$/, "")}/**`, "http://localhost:3000/**"].join(","),
};
const templates = {
  mailer_subjects_magic_link: "Your AA Classic Hub sign-in code",
  mailer_templates_magic_link_content: email("Here's your sign-in code."),
  mailer_subjects_confirmation: "Your AA Classic Hub sign-in code",
  mailer_templates_confirmation_content: email("Welcome! Here's the code to finish creating your account."),
};
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
  Object.assign(auth, {
    external_discord_enabled: true,
    external_discord_client_id: DISCORD_CLIENT_ID,
    external_discord_secret: DISCORD_CLIENT_SECRET,
  });
}
await call("PATCH", "/config/auth", auth);
console.log(`Sign-in settings applied (Discord ${auth.external_discord_enabled ? "on" : "off"})`);
try {
  await call("PATCH", "/config/auth", templates);
  console.log("Email templates applied");
} catch (e) {
  console.log(`::warning::Email templates not applied (needs custom SMTP): ${e.message}`);
}
