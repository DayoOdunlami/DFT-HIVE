// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /handbook/case-study → /handbook/cases
 * Query params (q, sector, hazard, region, cost) are preserved.
 */
export default function CaseStudyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const params = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`/handbook/cases${params || ""}`);
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
      Redirecting to case studies…
    </div>
  );
}
