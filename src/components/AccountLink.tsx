"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function AccountLink() {
  const { enabled, user } = useAuth();
  if (!enabled) return null;
  return (
    <Link href="/account" className="ml-auto rounded border border-line px-3 py-1 text-sm hover:bg-panel-2">
      {user ? "My account" : "Sign in"}
    </Link>
  );
}
