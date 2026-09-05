import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

/**
 * Form primitives.
 *
 * accessibility_system.md, FORM RULES:
 *  - every input carries a visible, persistent label; placeholder is never the label
 *  - required fields are marked in text, not by asterisk alone
 *  - errors appear inline next to the field, in words, never colour alone
 *
 * THE HINT AND THE ERROR ARE NOW ACTUALLY CONNECTED TO THE INPUT.
 *
 * They were not. This component worked out an id for its hint and another for
 * its error, put them on the two paragraphs and then never referred to either
 * again: no `aria-describedby`, no `aria-invalid`. Both variables sat unused,
 * which is the tell that this was meant to be wired and was missed. Someone
 * using a screen reader heard the label and the word "required" and never heard
 * "Include the country code", or "That email does not look right" when it
 * appeared under the field they were sitting in.
 *
 * The child input is cloned rather than asking every call site to thread the
 * ids through by hand, because a rule that depends on forty call sites
 * remembering it is a rule that will be broken again. Any `aria-describedby`
 * the caller sets is kept and ours is appended to it.
 */
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

  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return child;

    const own = child.props["aria-describedby"];
    const merged = [own, describedBy].filter(Boolean).join(" ") || undefined;

    return cloneElement(child, {
      "aria-describedby": merged,
      "aria-invalid": error ? true : child.props["aria-invalid"],
      required: required ?? child.props.required,
    });
  });

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
      {control}
      {error ? (
        <p id={errId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/*
  Focus is the site's own brass outline, not a ring of this component's own.

  globals.css already draws `:focus-visible { outline: 2px solid brass }` on
  everything, with a white variant on navy. An earlier pass added a navy ring
  here alongside `focus:outline-none` and because a class-plus-pseudo selector
  outranks the bare `:focus-visible` one, that quietly switched these inputs to
  a different focus treatment from every other control on the site. The keyboard
  ring was still visible, so nothing looked broken; it was just inconsistent.

  What stays is the border darkening on focus and reddening when the field is
  invalid, which is a second channel rather than a replacement for the outline.
*/
const controlBase =
  "w-full min-h-[44px] rounded-sm border bg-white px-4 text-body text-charcoal " +
  "transition-colors duration-micro ease-entrance " +
  "placeholder:text-charcoal-60 " +
  "border-navy/20 hover:border-navy/40 focus:border-navy " +
  "aria-[invalid=true]:border-danger";

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
