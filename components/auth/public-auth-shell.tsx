"use client";

import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LogoMark } from "@/components/brand/logo-mark";
import type { AuthProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

type AuthIntent = "login" | "signup" | "generator";

type ClientAuthState = {
  configured: boolean;
  user: { id: string; email: string | null } | null;
  profile: AuthProfile | null;
  onboarded: boolean;
  loading: boolean;
};

type AuthModalState = {
  open: boolean;
  intent: AuthIntent;
  next: string;
  pendingUrl?: string;
};

type PublicAuthContextValue = {
  authState: ClientAuthState;
  openAuth: (intent: AuthIntent, options?: { next?: string; pendingUrl?: string }) => void;
  ensureGeneratorAccess: (url: string) => Promise<boolean>;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id?: string;
      callback: (response: GoogleCredentialResponse) => void;
      nonce?: string;
      auto_select?: boolean;
      itp_support?: boolean;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: {
        type?: "standard" | "icon";
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
        shape?: "pill" | "rectangular" | "circle" | "square";
        text?: "signin_with" | "signup_with" | "continue_with";
        logo_alignment?: "left" | "center";
        width?: number;
      },
    ) => void;
    prompt: () => void;
    cancel: () => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const initialAuthState: ClientAuthState = {
  configured: false,
  user: null,
  profile: null,
  onboarded: false,
  loading: true,
};

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (!context) {
    throw new Error("usePublicAuth must be used inside PublicAuthShell.");
  }
  return context;
}

export function PublicAuthShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [scriptReady, setScriptReady] = useState(false);
  const [authState, setAuthState] = useState<ClientAuthState>(initialAuthState);
  const [modal, setModal] = useState<AuthModalState>({
    open: false,
    intent: "signup",
    next: "/dashboard",
  });
  const handledSearchRef = useRef(false);
  const oneTapPromptedRef = useRef(false);

  const refreshAuthState = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/state", { cache: "no-store" });
      const nextState = (await response.json()) as Omit<ClientAuthState, "loading">;
      const hydrated = { ...nextState, loading: false };
      setAuthState(hydrated);
      return hydrated;
    } catch {
      const fallback = { ...initialAuthState, loading: false };
      setAuthState(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  const openAuth = useCallback((intent: AuthIntent, options?: { next?: string; pendingUrl?: string }) => {
    setModal({
      open: true,
      intent,
      next: safeInternalPath(options?.next || (intent === "login" ? "/dashboard" : "/dashboard")),
      pendingUrl: options?.pendingUrl,
    });
  }, []);

  useEffect(() => {
    if (handledSearchRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth !== "login" && auth !== "signup" && auth !== "generator") return;

    handledSearchRef.current = true;
    openAuth(auth, {
      next: params.get("next") || "/dashboard",
      pendingUrl: params.get("url") || undefined,
    });

    params.delete("auth");
    params.delete("next");
    params.delete("url");
    const nextSearch = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`);
  }, [openAuth]);

  const completeIntent = useCallback(
    (intent: AuthIntent, next: string, pendingUrl?: string) => {
      setModal((current) => ({ ...current, open: false }));

      if (intent === "generator") {
        window.dispatchEvent(new CustomEvent("deeplinkos:generator-authorized", { detail: { url: pendingUrl } }));
        router.refresh();
        return;
      }

      router.push(safeInternalPath(next || "/dashboard"));
    },
    [router],
  );

  const ensureGeneratorAccess = useCallback(
    async (url: string) => {
      const state = await refreshAuthState();
      if (state.user && state.onboarded) return true;
      openAuth("generator", { next: "/dashboard/links", pendingUrl: url });
      return false;
    },
    [openAuth, refreshAuthState],
  );

  const handleGoogleCredential = useCallback(
    async (credential: string, rawNonce: string, intent: AuthIntent, next: string, pendingUrl?: string) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
        nonce: rawNonce,
      });

      if (error) throw error;

      const nextState = await refreshAuthState();
      if (nextState.user && nextState.onboarded) {
        completeIntent(intent, next, pendingUrl);
      } else if (nextState.user) {
        setModal({ open: true, intent, next, pendingUrl });
      }
    },
    [completeIntent, refreshAuthState],
  );

  useEffect(() => {
    if (!scriptReady || !googleClientId || pathname !== "/" || authState.loading || authState.user || modal.open) return;
    if (oneTapPromptedRef.current || !window.google?.accounts.id) return;

    oneTapPromptedRef.current = true;

    void generateNoncePair().then(([rawNonce, hashedNonce]) => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) return;
          try {
            await handleGoogleCredential(response.credential, rawNonce, "signup", "/dashboard");
          } catch {
            openAuth("signup", { next: "/dashboard" });
          }
        },
        nonce: hashedNonce,
        auto_select: false,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });
      window.google?.accounts.id.prompt();
    });
  }, [authState.loading, authState.user, googleClientId, handleGoogleCredential, modal.open, openAuth, pathname, scriptReady]);

  const contextValue = useMemo(
    () => ({ authState, openAuth, ensureGeneratorAccess }),
    [authState, ensureGeneratorAccess, openAuth],
  );

  return (
    <PublicAuthContext.Provider value={contextValue}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
      <SiteHeader onLogin={() => openAuth("login", { next: "/dashboard" })} onSignup={() => openAuth("signup", { next: "/dashboard" })} />
      <main>{children}</main>
      <SiteFooter />
      <AuthModal
        authState={authState}
        completeIntent={completeIntent}
        googleClientId={googleClientId}
        handleGoogleCredential={handleGoogleCredential}
        modal={modal}
        refreshAuthState={refreshAuthState}
        scriptReady={scriptReady}
        setAuthState={setAuthState}
        setModal={setModal}
      />
    </PublicAuthContext.Provider>
  );
}

function AuthModal({
  authState,
  completeIntent,
  googleClientId,
  handleGoogleCredential,
  modal,
  refreshAuthState,
  scriptReady,
  setAuthState,
  setModal,
}: {
  authState: ClientAuthState;
  completeIntent: (intent: AuthIntent, next: string, pendingUrl?: string) => void;
  googleClientId?: string;
  handleGoogleCredential: (credential: string, rawNonce: string, intent: AuthIntent, next: string, pendingUrl?: string) => Promise<void>;
  modal: AuthModalState;
  refreshAuthState: () => Promise<ClientAuthState>;
  scriptReady: boolean;
  setAuthState: (state: ClientAuthState) => void;
  setModal: (state: AuthModalState | ((state: AuthModalState) => AuthModalState)) => void;
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const copy = modalCopy[modal.intent];
  const showProfileStep = Boolean(authState.user && !authState.onboarded);
  const isLogin = modal.intent === "login";

  useEffect(() => {
    if (!modal.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal.open]);

  useEffect(() => {
    if (!modal.open || showProfileStep || !scriptReady || !googleClientId || !buttonRef.current || !window.google?.accounts.id) return;

    setError(null);
    buttonRef.current.innerHTML = "";

    void generateNoncePair().then(([rawNonce, hashedNonce]) => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google did not return a credential. Please try again.");
            return;
          }

          try {
            await handleGoogleCredential(response.credential, rawNonce, modal.intent, modal.next, modal.pendingUrl);
          } catch (googleError) {
            setError(googleError instanceof Error ? googleError.message : "Google sign-in failed. Please try again.");
          }
        },
        nonce: hashedNonce,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });
      window.google?.accounts.id.renderButton(buttonRef.current!, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: modal.intent === "login" ? "signin_with" : "signup_with",
        logo_alignment: "center",
        width: 400,
      });
    });
  }, [googleClientId, handleGoogleCredential, modal.intent, modal.next, modal.open, modal.pendingUrl, scriptReady, showProfileStep]);

  if (!modal.open) return null;

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmittingProfile(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
      }),
    });

    const payload = await response.json().catch(() => null);
    setSubmittingProfile(false);

    if (!response.ok) {
      setError(payload?.error || "We could not save your profile. Please try again.");
      return;
    }

    setAuthState({ ...payload, loading: false });
    completeIntent(modal.intent, modal.next, modal.pendingUrl);
  }

  async function saveProfile(firstName: FormDataEntryValue | null, lastName: FormDataEntryValue | null) {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || "We could not save your profile. Please try again.");
    }

    setAuthState({ ...payload, loading: false });
    return payload as ClientAuthState;
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEmailNotice(null);
    setSubmittingEmail(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");

    try {
      const supabase = createClient();

      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        const nextState = await refreshAuthState();
        if (nextState.user && nextState.onboarded) {
          completeIntent(modal.intent, modal.next, modal.pendingUrl);
        }
        return;
      }

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: String(firstName || "").trim(),
            last_name: String(lastName || "").trim(),
          },
        },
      });

      if (signupError) throw signupError;

      if (!data.session) {
        setEmailNotice("Account created. Check your email to confirm it, then come back and sign in.");
        return;
      }

      await saveProfile(firstName, lastName);
      completeIntent(modal.intent, modal.next, modal.pendingUrl);
    } catch (emailError) {
      setError(emailError instanceof Error ? emailError.message : "Authentication failed. Please try again.");
    } finally {
      setSubmittingEmail(false);
    }
  }

  return (
    <div className="auth-modal-backdrop" role="presentation" onMouseDown={() => setModal((current) => ({ ...current, open: false }))}>
      <section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="auth-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="auth-modal-close" type="button" aria-label="Close auth dialog" onClick={() => setModal((current) => ({ ...current, open: false }))}>
          <CloseIcon />
        </button>

        {/* Left visual panel */}
        <div className="auth-modal-visual" aria-hidden="true">
          {/* Decorative arc */}
          <div className="auth-modal-arc" />

          <div className="auth-modal-brand">
            <span className="auth-modal-logo-wrap">
              <LogoMark className="auth-modal-logo-icon" />
            </span>
            <span className="auth-modal-logo-name">DeepLink<span>OS</span></span>
          </div>

          <div className="auth-modal-visual-body">
            <h3 className="auth-modal-headline">
              {isLogin ? (
                <><em>Smarter</em>{" "}routes.<br /><em>Better</em>{" "}outcomes.</>
              ) : (
                <><em>Smarter</em>{" "}routing.<br /><em>Better</em>{" "}results.</>
              )}
            </h3>
            <p className="auth-modal-subtitle">
              DeepLinkOS helps you route every link intelligently&mdash;so you reach the right destination, every time.
            </p>
            <ul className="auth-modal-features">
              <li>
                <span className="auth-modal-feature-icon"><BoltIcon /></span>
                <span>
                  <strong>Smart deep links</strong>
                  <span>Create and deploy intelligent links instantly.</span>
                </span>
              </li>
              <li>
                <span className="auth-modal-feature-icon"><BarChartIcon /></span>
                <span>
                  <strong>Real-time analytics</strong>
                  <span>Track performance and optimize in real time.</span>
                </span>
              </li>
              <li>
                <span className="auth-modal-feature-icon"><GlobeIcon /></span>
                <span>
                  <strong>Global routing</strong>
                  <span>Deliver the right experience everywhere.</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Social proof */}
          <div className="auth-modal-social-proof">
            <div className="auth-modal-avatars">
              <span className="auth-modal-avatar" style={{background:"#7c6fa0"}} />
              <span className="auth-modal-avatar" style={{background:"#c97b63"}} />
              <span className="auth-modal-avatar" style={{background:"#5b8c5a"}} />
            </div>
            <div>
              <div className="auth-modal-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p>Trusted by marketers<br />around the world</p>
            </div>
          </div>
        </div>

        {/* Right content panel */}
        <div className="auth-modal-content">
          {/* Mobile-only drag handle + brand (left panel hidden on mobile) */}
          <div className="auth-modal-drag-handle" aria-hidden="true" />
          <div className="auth-modal-mobile-brand" aria-hidden="true">
            <span className="auth-modal-logo-wrap">
              <LogoMark className="auth-modal-logo-icon" />
            </span>
            <span className="auth-modal-logo-name">DeepLink<span>OS</span></span>
          </div>

          {/* Tab switcher */}
          {!showProfileStep && modal.intent !== "generator" && (
            <div className="auth-modal-tabs" role="tablist">
              <button
                role="tab" type="button" className="auth-modal-tab"
                data-active={!isLogin ? "true" : "false"}
                onClick={() => { setError(null); setEmailNotice(null); setModal((c) => ({ ...c, intent: "signup" })); }}
              >
                Sign up
              </button>
              <button
                role="tab" type="button" className="auth-modal-tab"
                data-active={isLogin ? "true" : "false"}
                onClick={() => { setError(null); setEmailNotice(null); setModal((c) => ({ ...c, intent: "login" })); }}
              >
                Log in
              </button>
            </div>
          )}

          {/* Screen-reader label — visually hidden, keeps aria-labelledby working */}
          <h2 id="auth-modal-title" className="auth-modal-sr-only">
            {showProfileStep ? "Complete your profile" : isLogin ? "Log in to DeepLinkOS" : "Create your DeepLinkOS account"}
          </h2>

          {/* Profile step only: show a heading since there's no tab switcher */}
          {showProfileStep && (
            <p className="auth-modal-step-heading">Tell us what to call you</p>
          )}


          {!authState.configured ? (
            <p className="auth-modal-alert">Supabase env vars are not configured yet.</p>
          ) : !googleClientId && !showProfileStep ? (
            <p className="auth-modal-alert">Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.</p>
          ) : null}

          {error ? <p className="auth-modal-alert auth-modal-alert--error">{error}</p> : null}
          {emailNotice ? <p className="auth-modal-alert">{emailNotice}</p> : null}

          {showProfileStep ? (
            <form className="auth-modal-form" onSubmit={handleProfileSubmit}>
              <label>First name
                <div className="auth-modal-input-wrap"><PersonIcon />
                  <input name="first_name" autoComplete="given-name" defaultValue={authState.profile?.first_name ?? ""} placeholder="Dana" required />
                </div>
              </label>
              <label>Last name
                <div className="auth-modal-input-wrap"><PersonIcon />
                  <input name="last_name" autoComplete="family-name" defaultValue={authState.profile?.last_name ?? ""} placeholder="Lee" required />
                </div>
              </label>
              <button className="auth-modal-submit" type="submit" disabled={submittingProfile}>
                {submittingProfile ? "Preparing your dashboard..." : "Continue to dashboard"}
              </button>
            </form>
          ) : (
            <div className="auth-modal-stack">
              <form className="auth-modal-form" onSubmit={handleEmailSubmit}>
                {!isLogin ? (
                  <div className="auth-modal-name-row">
                    <label>First name
                      <div className="auth-modal-input-wrap"><PersonIcon />
                        <input name="first_name" autoComplete="given-name" placeholder="Dana" required />
                      </div>
                    </label>
                    <label>Last name
                      <div className="auth-modal-input-wrap"><PersonIcon />
                        <input name="last_name" autoComplete="family-name" placeholder="Lee" required />
                      </div>
                    </label>
                  </div>
                ) : null}
                <label>Email address
                  <div className="auth-modal-input-wrap"><MailIcon />
                    <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                  </div>
                </label>
                <label>
                  <div className="auth-modal-pw-header">
                    <span>Password</span>
                    {isLogin && <button type="button" className="auth-modal-forgot">Forgot your password?</button>}
                  </div>
                  <div className="auth-modal-input-wrap"><LockIcon />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      minLength={8}
                      placeholder={isLogin ? "Enter your password" : "Create a password"}
                      required
                    />
                    <button type="button" className="auth-modal-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      <EyeIcon open={!showPassword} />
                    </button>
                  </div>
                </label>
                <button className="auth-modal-submit" type="submit" disabled={submittingEmail}>
                  {submittingEmail
                    ? (isLogin ? "Signing in..." : "Creating account...")
                    : (isLogin ? "Log in" : "Create account")}
                </button>
              </form>

              <div className="auth-modal-divider"><span>or continue with</span></div>

              <div className="auth-modal-google-wrap">
                {/* Hidden Google button — handles actual OAuth credential flow */}
                <div ref={buttonRef} className="auth-modal-google-hidden" aria-hidden="true" />
                {/* Custom styled button that proxies the click */}
                <button
                  type="button"
                  className="auth-modal-google-btn"
                  disabled={!scriptReady || !googleClientId}
                  onClick={() => {
                    const iframe = buttonRef.current?.querySelector("iframe");
                    if (iframe) {
                      (iframe as HTMLIFrameElement).click();
                    } else {
                      const innerBtn = buttonRef.current?.querySelector("div[role='button']") as HTMLElement | null;
                      innerBtn?.click();
                    }
                  }}
                >
                  <GoogleGIcon />
                  <span>{modal.intent === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
                </button>
                {!scriptReady && googleClientId ? (
                  <span className="auth-modal-loading">Loading Google sign-in...</span>
                ) : null}
              </div>

              <div className="auth-modal-footer">
                {isLogin ? (
                  <p>Don&apos;t have an account?{" "}<button type="button" className="auth-modal-footer-link" onClick={() => { setError(null); setEmailNotice(null); setModal((c) => ({ ...c, intent: "signup" })); }}>Sign up</button></p>
                ) : (
                  <>
                    <p>Already have an account?{" "}<button type="button" className="auth-modal-footer-link" onClick={() => { setError(null); setEmailNotice(null); setModal((c) => ({ ...c, intent: "login" })); }}>Log in</button></p>
                    <p className="auth-modal-tos">By signing up, you agree to our <a href="/terms" className="auth-modal-footer-link">Terms of Service</a> and <a href="/privacy" className="auth-modal-footer-link">Privacy Policy</a>.</p>
                  </>
                )}
              </div>
            </div>
          )}

          <button className="auth-modal-refresh" type="button" onClick={() => void refreshAuthState()}>
            Already signed in? Refresh session
          </button>
        </div>
      </section>
    </div>
  );
}

const modalCopy: Record<AuthIntent, { kicker: string; title: string; body: string }> = {
  login: {
    kicker: "Welcome back",
    title: "Welcome back",
    body: "Log in to access your DeepLinkOS workspace and continue where you left off.",
  },
  signup: {
    kicker: "Start free",
    title: "Create your DeepLinkOS workspace",
    body: "Add your details to unlock the full dashboard and start routing smarter links.",
  },
  generator: {
    kicker: "Experience the magic",
    title: "Save this smart route",
    body: "Create an account to keep this generated link, add fallbacks, and turn it into a trackable campaign.",
  },
};

async function generateNoncePair(): Promise<[string, string]> {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((value) => value.toString(16).padStart(2, "0")).join("");
  return [nonce, hashedNonce];
}

function safeInternalPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="auth-modal-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="auth-modal-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="auth-modal-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleGIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
