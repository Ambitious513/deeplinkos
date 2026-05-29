"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function GoogleOneTap() {
  const supabase = createClient();
  const router = useRouter();
  const initialized = useRef(false);

  const handleCredentialResponse = async (response: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) throw error;
      
      // Successfully logged in via One Tap
      router.push("/dashboard");
    } catch (error) {
      console.error("Error logging in with Google One Tap", error);
    }
  };

  useEffect(() => {
    // Expose callback globally so the script can access it
    (window as any).handleGoogleOneTap = handleCredentialResponse;
  }, []);

  const initializeGoogleOneTap = () => {
    if (typeof window !== "undefined" && window.google && !initialized.current) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Google One Tap will not load.");
        return;
      }
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (window as any).handleGoogleOneTap,
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.prompt();
      initialized.current = true;
    }
  };

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeGoogleOneTap}
    />
  );
}
