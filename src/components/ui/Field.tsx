import { cn } from "@/lib/cn";

/**
 * Form primitives.
 *
 * accessibility_system.md, FORM RULES:
 *  - every input carries a visible, persistent label; placeholder is never the label
 *  - required fields are marked in text, not by asterisk alone
 *  - errors appear inline next to the field, in words, never colour alone
 */

const controlBase =
  "w-full min-h-[44px] rounded-sm border bg-white px-4 text-body text-charcoal " +
  "transition-colors duration-micro ease-entrance " +
  "placeholder:text-charcoal-60 " +
  "border-navy/20 hover:border-navy/40 focus:border-navy";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="label-caps text-charcoal-80">
        {label}
        {required ? (
          <span className="ml-2 font-normal tracking-normal normal-case text-charcoal-60">
            {" "}
            (required)
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-caption text-charcoal-80">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(controlBase, className)} {...props} />
);

export const Select = ({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlBase, "pr-8", className)} {...props}>
    {children}
  </select>
);

export const Textarea = ({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(controlBase, "min-h-[104px] py-3 leading-relaxed", className)} {...props} />
);
