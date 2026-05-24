import type { SelectHTMLAttributes } from "react";

type Option = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  options: Option[];
};

export function Select({ label, hint, error, options, className = "", ...props }: SelectProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {hint ? <span className="field__hint">{hint}</span> : null}
      <select className={`input ${className}`.trim()} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
