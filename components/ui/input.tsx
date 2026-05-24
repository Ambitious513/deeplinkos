import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className = "", ...props }: InputProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {hint ? <span className="field__hint">{hint}</span> : null}
      <input className={`input ${className}`.trim()} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
