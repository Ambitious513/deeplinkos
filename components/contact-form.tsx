"use client";

import { useState, useRef } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface FieldErrors {
  name?:    string;
  email?:   string;
  subject?: string;
  message?: string;
}

function validate(
  name: string, email: string, subject: string, message: string
): FieldErrors {
  const errs: FieldErrors = {};
  if (!name.trim())    errs.name    = "Full name is required.";
  if (!email.trim())   errs.email   = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                       errs.email   = "Please enter a valid email address.";
  if (!subject.trim()) errs.subject = "Subject is required.";
  if (!message.trim()) errs.message = "Message cannot be empty.";
  else if (message.trim().length < 10)
                       errs.message = "Please write at least 10 characters.";
  return errs;
}

export function ContactForm() {
  const [status,  setStatus]  = useState<Status>("idle");
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd      = new FormData(e.currentTarget);
    const name    = fd.get("cf-name")?.toString()    ?? "";
    const email   = fd.get("cf-email")?.toString()   ?? "";
    const subject = fd.get("cf-subject")?.toString() ?? "";
    const message = fd.get("cf-message")?.toString() ?? "";

    /* Client-side validation */
    const errs = validate(name, email, subject, message);
    setErrors(errs);
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    setApiError("");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        /* Server returned validation errors */
        if (res.status === 422 && data.errors) {
          setErrors(data.errors);
          setStatus("idle");
          return;
        }
        /* Rate limit */
        if (res.status === 429) {
          setApiError(data.error ?? "Too many submissions. Please wait a few minutes.");
          setStatus("error");
          return;
        }
        setApiError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      formRef.current?.reset();
      setTouched({});
      setErrors({});

    } catch {
      setApiError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  /* ── Success state ──────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="cf-success" role="status" aria-live="polite">
        <div className="cf-success__icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="url(#cf-check-grad)" />
            <defs>
              <linearGradient id="cf-check-grad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              d="M11 18.5l5 5 9-10"
              stroke="#fff" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="cf-success__heading">Message Sent!</h3>
        <p className="cf-success__text">
          Thanks for reaching out. We&apos;ve received your message and will
          get back to you within 24 to 48 hours.
        </p>
        <button
          type="button"
          className="cf-success__reset"
          onClick={() => { setStatus("idle"); setApiError(""); }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="cf"
      noValidate
      aria-label="Contact form"
    >
      {/* API-level error banner */}
      {status === "error" && apiError && (
        <div className="cf-api-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7.5" stroke="#ef4444" strokeWidth="1.5"/>
            <path d="M8 4.5v4M8 11v.5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {apiError}
          <button
            type="button"
            className="cf-api-error__dismiss"
            onClick={() => { setStatus("idle"); setApiError(""); }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Full Name */}
      <div className={`cf__field ${touched.name && errors.name ? "cf__field--error" : ""}`}>
        <label className="cf__label" htmlFor="cf-name">
          Full Name <span className="cf__required" aria-hidden="true">*</span>
        </label>
        <input
          className="cf__input"
          id="cf-name"
          name="cf-name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          aria-required="true"
          aria-describedby={touched.name && errors.name ? "cf-name-err" : undefined}
          onBlur={() => markTouched("name")}
        />
        {touched.name && errors.name && (
          <span className="cf__error" id="cf-name-err" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Email */}
      <div className={`cf__field ${touched.email && errors.email ? "cf__field--error" : ""}`}>
        <label className="cf__label" htmlFor="cf-email">
          Email Address <span className="cf__required" aria-hidden="true">*</span>
        </label>
        <input
          className="cf__input"
          id="cf-email"
          name="cf-email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          aria-required="true"
          aria-describedby={touched.email && errors.email ? "cf-email-err" : undefined}
          onBlur={() => markTouched("email")}
        />
        {touched.email && errors.email && (
          <span className="cf__error" id="cf-email-err" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* Subject */}
      <div className={`cf__field ${touched.subject && errors.subject ? "cf__field--error" : ""}`}>
        <label className="cf__label" htmlFor="cf-subject">
          Subject <span className="cf__required" aria-hidden="true">*</span>
        </label>
        <input
          className="cf__input"
          id="cf-subject"
          name="cf-subject"
          type="text"
          placeholder="e.g. Feature request, Bug report, General question..."
          aria-required="true"
          aria-describedby={touched.subject && errors.subject ? "cf-subject-err" : undefined}
          onBlur={() => markTouched("subject")}
        />
        {touched.subject && errors.subject && (
          <span className="cf__error" id="cf-subject-err" role="alert">
            {errors.subject}
          </span>
        )}
      </div>

      {/* Message */}
      <div className={`cf__field ${touched.message && errors.message ? "cf__field--error" : ""}`}>
        <label className="cf__label" htmlFor="cf-message">
          Your Message <span className="cf__required" aria-hidden="true">*</span>
        </label>
        <textarea
          className="cf__textarea"
          id="cf-message"
          name="cf-message"
          rows={5}
          placeholder="Tell us how we can help, share feedback, or ask a question..."
          aria-required="true"
          aria-describedby={touched.message && errors.message ? "cf-message-err" : undefined}
          onBlur={() => markTouched("message")}
        />
        {touched.message && errors.message && (
          <span className="cf__error" id="cf-message-err" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary cf__submit"
        id="contact-submit-btn"
        disabled={status === "loading"}
        aria-busy={status === "loading"}
      >
        {status === "loading" ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5"
                stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>

      <p className="cf__note">All fields are required. We reply within 24 to 48 hours.</p>
    </form>
  );
}
