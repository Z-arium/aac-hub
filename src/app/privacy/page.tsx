import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Privacy", description: "What AA Classic Hub stores about you and how to remove it." };

export default function PrivacyPage() {
  return (
    <>
      <PageTitle title="Privacy" subtitle="Short version: we store only what you save, and you can download or delete it any time." />
      <div className="prose-guide max-w-3xl">
        <h2>Without an account</h2>
        <p>
          Everything you set on the site (checklist progress, timer alerts, pinned tools, saved pages and builds) stays in your browser&apos;s
          local storage. It never leaves your device. Clearing your browser data removes it.
        </p>
        <h2>With an account</h2>
        <p>When you sign in, we store:</p>
        <ul>
          <li>Your email address, or your Discord name and id if you sign in with Discord.</li>
          <li>Your profile: display name, server and main character, if you fill them in.</li>
          <li>The same settings listed above, so they follow you to other devices.</li>
        </ul>
        <p>
          Accounts are run on <a href="https://supabase.com">Supabase</a>, which hosts the database and handles sign-in. We don&apos;t sell or
          share your data, show ads, or use tracking cookies. The only cookies or storage the site uses are the ones that keep you signed in
          and remember your settings.
        </p>
        <h2>Your controls</h2>
        <p>
          On <Link href="/account">My account</Link> you can download everything we hold about you as a file, or delete your account. Deleting
          removes your profile and saved data straight away.
        </p>
        <h2>Videos</h2>
        <p>Videos are embedded from YouTube, which has its own privacy policy and may set cookies when you play one.</p>
        <h2>Contact</h2>
        <p>
          Questions or requests: open an issue on the site&apos;s <a href="https://github.com/Z-arium/aac-hub/issues">GitHub page</a>.
        </p>
        <p className="text-sm text-muted">Last updated 2026-10-29.</p>
      </div>
    </>
  );
}
