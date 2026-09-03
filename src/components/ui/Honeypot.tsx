import { HONEYPOT_FIELD } from "@/lib/guard";

/**
 * The spam trap.
 *
 * A field no person ever sees, fills, or tabs into. The scripts that harvest
 * public forms fill in every input they find, so an arriving request with this
 * field populated was not typed by a human and the server drops it, while
 * answering as though it worked, because telling a bot exactly which move
 * failed is how it learns to stop making it.
 *
 * Three details make it work without hurting anybody:
 *
 *  - It is moved OFF SCREEN rather than given `display: none` or `hidden`.
 *    Those are the first things a form-filling script learns to skip, and
 *    skipping it is precisely what a bot must not do.
 *  - `aria-hidden` and `tabIndex={-1}` keep it away from screen readers and
 *    from the tab order, so nobody using a keyboard or assistive technology can
 *    land in it by accident and get their genuine enquiry silently binned. A
 *    trap that catches real guests is worse than no trap.
 *  - `autoComplete="off"` stops a browser's own autofill from filling it in on
 *    a guest's behalf, which would do the same damage.
 */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Company website</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
