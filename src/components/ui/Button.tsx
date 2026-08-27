import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Buttons. Four variants only — component_system.md forbids one-off components.
 *
 * Touch target is 44px minimum at every breakpoint, not only on mobile
 * (accessibility_system.md, TOUCH TARGET RULE).
 */

type Variant = "primary" | "secondary" | "ghost" | "onNavy" | "outlineOnNavy";
type Size = "nav" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-md font-medium " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-micro ease-entrance " +
  // A press is confirmed by the control itself moving 1px, which is the whole
  // point of a press state: the interface answers before the page does.
  "active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";

const variants: Record<Variant, string> = {
  // Deep Navy is the brand's ground colour; it carries the primary action.
  primary: "bg-navy text-white hover:bg-navy-80 hover:shadow-2",
  secondary: "border border-navy/20 bg-white text-navy hover:border-navy hover:bg-stone-40",
  ghost: "text-navy underline-offset-4 hover:underline",
  // On a navy field, brass is the only mark of emphasis that holds contrast.
  onNavy: "bg-brass text-navy hover:bg-brass-80 hover:shadow-2",
  // Reversed, for a navy header where a filled button would shout.
  outlineOnNavy: "border border-white/30 text-white hover:border-brass hover:text-brass",
};

const sizes: Record<Size, string> = {
  // Letterspaced caps, so a button reads as part of the same typographic system
  // as the navigation rather than as a stray web control.
  nav: "min-h-[44px] px-6 text-[11px] uppercase tracking-[0.18em]",
  md: "min-h-[44px] px-6 text-[15px]",
  lg: "min-h-[52px] px-8 text-body",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
