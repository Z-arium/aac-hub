// Prints sign-in health for debugging: auth settings, user counts and recent
// auth log lines. Emails are redacted because workflow logs can be public.
const { SUPABASE_ACCESS_TOKEN: token, SUPABASE_PROJECT_REF: ref } = process.env;
if (!token || !ref) throw new Error("Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF");
const api = `https://api.supabase.com/v1/projects/${ref}`;
const redact = (s) => String(s).replace(/[^\s"@]+@[^\s"@]+/g, "<email>");

async function call(method, path, body) {
  const res = await fetch(api + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return `${res.status} ${text}`;
  return text ? JSON.parse(text) : null;
}

const auth = await call("GET", "/config/auth");
const pick = ["site_url", "uri_allow_list", "external_email_enabled", "mailer_autoconfirm", "mailer_otp_exp", "external_discord_enabled", "smtp_host"];
console.log("Auth settings:", JSON.stringify(Object.fromEntries(pick.map((k) => [k, auth?.[k]])), null, 2));

const users = await call("POST", "/database/query", {
  query: `select count(*) as users,
    count(email_confirmed_at) as confirmed,
    max(last_sign_in_at) as last_sign_in,
    max(created_at) as last_created,
    (select count(*) from public.profiles) as profiles,
    (select count(*) from public.user_storage) as saved_rows
  from auth.users`,
});
console.log("Users:", JSON.stringify(users));

const sessions = await call("POST", "/database/query", {
  query: "select created_at, updated_at, user_agent, not_after from auth.sessions order by created_at desc limit 10",
});
console.log("Sessions:", JSON.stringify(sessions, null, 2));

const audit = await call("POST", "/database/query", {
  query: "select created_at, payload ->> 'action' as action, payload ->> 'log_type' as type from auth.audit_log_entries order by created_at desc limit 30",
});
for (const row of Array.isArray(audit) ? audit : [audit]) console.log("Audit:", redact(JSON.stringify(row)));
