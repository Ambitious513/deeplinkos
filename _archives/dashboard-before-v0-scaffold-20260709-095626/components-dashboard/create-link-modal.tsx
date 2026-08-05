"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CloseIcon, CheckIcon } from "@/components/dashboard/icons";

/* ─── Context ─────────────────────────────────────────────────────── */

type CreateLinkContextValue = {
  open: () => void;
};

const CreateLinkContext = createContext<CreateLinkContextValue | undefined>(undefined);

export function useCreateLink() {
  const ctx = useContext(CreateLinkContext);
  if (!ctx) throw new Error("useCreateLink must be used within CreateLinkProvider");
  return ctx;
}

/* ─── Provider ────────────────────────────────────────────────────── */

export function CreateLinkProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CreateLinkContext.Provider value={{ open }}>
      {children}
      {isOpen && <CreateLinkModal onClose={close} />}
    </CreateLinkContext.Provider>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────── */

type CreateState = {
  destinationUrl: string;
  title: string;
  campaign: string;
};

type Phase = "form" | "creating" | "success";

function CreateLinkModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState<CreateState>({ destinationUrl: "", title: "", campaign: "" });
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  async function handleSubmit() {
    if (!form.destinationUrl.trim()) return;
    setError(null);
    setPhase("creating");

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl: form.destinationUrl,
          title: form.title || undefined,
          campaign: form.campaign || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "Unable to create link. Please try again.");
        setPhase("form");
        return;
      }

      setCreatedUrl(payload?.shortUrl || null);
      setPhase("success");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPhase("form");
    }
  }

  function handleDone() {
    setForm({ destinationUrl: "", title: "", campaign: "" });
    setPhase("form");
    setError(null);
    setCreatedUrl(null);
    onClose();
  }

  const isCreating = phase === "creating";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) handleDone(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-link-modal-title"
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="create-link-modal-title">
              Create smart link
            </h2>
            <p className="modal-subtitle">
              Paste any URL — DeepLinkOS will infer the platform and routing.
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={handleDone}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {phase === "success" ? (
          <>
            <div className="modal-body" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: 32, paddingBottom: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(29, 154, 108, 0.14)",
                    color: "var(--green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon />
                </span>
                <p style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>Smart link created!</p>
                {createdUrl && (
                  <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", margin: 0 }}>
                    Available at{" "}
                    <strong style={{ color: "var(--text)" }}>{createdUrl}</strong>
                  </p>
                )}
                <p style={{ color: "var(--text-soft)", fontSize: "0.84rem", margin: 0 }}>
                  Your link is live. Visit the Links page to copy, pause, or manage it.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" type="button" onClick={handleDone}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              {error && (
                <p className="links-manager__alert links-manager__alert--error">{error}</p>
              )}

              <div className="form-field">
                <label className="form-label" htmlFor="modal-dest-url">
                  Destination URL <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  id="modal-dest-url"
                  className="form-input"
                  type="url"
                  placeholder="https://amazon.com/dp/example"
                  value={form.destinationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                  disabled={isCreating}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="modal-title">
                  Title <span style={{ color: "var(--text-soft)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="modal-title"
                  className="form-input"
                  placeholder="Summer sale campaign"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  disabled={isCreating}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="modal-campaign">
                  Campaign tag <span style={{ color: "var(--text-soft)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="modal-campaign"
                  className="form-input"
                  placeholder="launch-q3"
                  value={form.campaign}
                  onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))}
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={handleDone}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || !form.destinationUrl.trim()}
                id="modal-create-link-submit"
              >
                <PlusIcon />
                {isCreating ? "Creating…" : "Create link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
