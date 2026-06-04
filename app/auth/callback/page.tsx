"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState("");
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const code = searchParams.get("code");
    const errParam = searchParams.get("error");
    const errDesc = searchParams.get("error_description");
    const next = searchParams.get("next") ?? "/dashboard";

    if (errParam) {
      window.location.href = `/?auth_error=true&msg=${encodeURIComponent(errDesc || errParam)}`;
      return;
    }

    if (code) {
      const supabase = createClient();
      
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error("Auth callback error:", error);
          window.location.href = `/?auth_error=true&msg=${encodeURIComponent(error.message)}`;
        } else {
          // Upsert profile with Google name fields
          const user = data.user;
          if (user) {
            const meta = user.user_metadata ?? {};
            const firstName =
              (meta.first_name as string) ||
              (meta.given_name as string) ||
              ((meta.full_name || meta.name || "") as string).split(" ")[0] ||
              "";
            const lastName =
              (meta.last_name as string) ||
              (meta.family_name as string) ||
              ((meta.full_name || meta.name || "") as string).split(" ").slice(1).join(" ") ||
              "";

            const upsertProfile = async () => {
              const { error: upsertErr } = await supabase.from("profiles").upsert(
                {
                  id: user.id,
                  email: user.email ?? "",
                  first_name: firstName || null,
                  last_name: lastName || null,
                },
                { onConflict: "id", ignoreDuplicates: false }
              );
              if (upsertErr) {
                console.error("Profile upsert error:", upsertErr);
              }
              window.location.href = next;
            };
            
            upsertProfile();
          } else {
            window.location.href = next;
          }
        }
      });
    } else {
      window.location.href = "/?auth_error=true&msg=no_code";
    }
  }, [searchParams]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "var(--bg)" }}>
      <div className="spinner" style={{ width: 40, height: 40, border: "3px solid var(--blue-dim)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 }}></div>
      <p style={{ color: "var(--text-2)", fontWeight: 500 }}>Completing sign in...</p>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <p style={{ color: "var(--text-2)" }}>Loading...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
