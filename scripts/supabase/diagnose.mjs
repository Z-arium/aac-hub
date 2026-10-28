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

const since = new Date(Date.now() - 6 * 3600_000).toISOString();
const sql = "select timestamp, event_message from auth_logs order by timestamp desc limit 40";
const logs = await call("GET", `/analytics/endpoints/logs?sql=${encodeURIComponent(sql)}&iso_timestamp_start=${since}`);
for (const row of logs?.result ?? []) {
  let msg = row.event_message;
  try {
    const e = JSON.parse(msg);
    msg = [e.level, e.method, e.path, e.status, e.msg, e.error, e.error_code].filter(Boolean).join(" | ");
  } catch {}
  console.log(new Date(row.timestamp / 1000).toISOString(), redact(msg));
}
if (!logs?.result) console.log("Logs:", redact(JSON.stringify(logs)).slice(0, 500));
