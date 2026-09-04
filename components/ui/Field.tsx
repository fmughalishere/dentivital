"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function FieldShell({ label, hint, error, required, className = "", htmlFor, children }: FieldShellProps) {
  return (
    <div className={className}>
      {label && (
        <label className="dv-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-dv-coral-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-dv-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-dv-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export function Input({ label, hint, error, wrapperClassName, className = "", ...rest }: InputProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
      htmlFor={id}
    >
      <input
        {...rest}
        id={id}
        aria-invalid={error ? "true" : undefined}
        className={`dv-input ${className}`}
      />
    </FieldShell>
  );
}

/** Password field with a working show/hide toggle. */
export function PasswordInput({
  label = "Password",
  hint,
  error,
  wrapperClassName,
  className = "",
  ...rest
}: InputProps) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const id = rest.id ?? autoId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
      htmlFor={id}
    >
      <div className="relative">
        <input
          {...rest}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : undefined}
          className={`dv-input pr-11 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-mint-100 hover:text-dv-teal-900"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export function Textarea({ label, hint, error, wrapperClassName, className = "", ...rest }: TextareaProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
      htmlFor={id}
    >
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? "true" : undefined}
        className={`dv-input min-h-28 resize-y ${className}`}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export function Select({ label, hint, error, wrapperClassName, className = "", children, ...rest }: SelectProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
      htmlFor={id}
    >
      <select
        {...rest}
        id={id}
        aria-invalid={error ? "true" : undefined}
        className={`dv-input cursor-pointer appearance-none bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-9 ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234c6a71' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        {children}
      </select>
    </FieldShell>
  );
}
