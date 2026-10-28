"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Sends the reader on to a redirect's target (works on a static host). */
export default function RedirectTo({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => router.replace(href), [router, href]);
  return null;
}
