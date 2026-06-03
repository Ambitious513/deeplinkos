"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleOneTap() {
  const supabase = createClient();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return; // skip if env var not set

    // Don't show One Tap if user is already signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) return;

      const scriptId = "google-gsi-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initOneTap();
        document.head.appendChild(script);
      } else {
        initOneTap();
      }
    });

    function initOneTap() {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });

      // Show the prompt — fires ~1 s after scroll/interaction
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Suppressed by browser or user dismissed — silently ignore
        }
      });
    }

    async function handleCredential(response: { credential: string }) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token:    response.credential,
      });

      if (error || !data.user) return;

      // Upsert profile with Google name fields
      const meta       = data.user.user_metadata ?? {};
      const firstName  = (meta.given_name  || (meta.full_name ?? "").split(" ")[0]  || "") as string;
      const lastName   = (meta.family_name || (meta.full_name ?? "").split(" ").slice(1).join(" ") || "") as string;

      await supabase.from("profiles").upsert(
        { id: data.user.id, email: data.user.email ?? "", first_name: firstName || null, last_name: lastName || null },
        { onConflict: "id", ignoreDuplicates: false }
      );

      // Redirect to dashboard
      window.location.href = "/dashboard";
    }

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Renders nothing — One Tap floats as a native browser prompt
  return null;
}
