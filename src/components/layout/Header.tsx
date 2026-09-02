"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ArrowUpRight, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { nav, business } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * The header.
 *
 * Two states, because the page has two grounds. At the top it is a solid Deep
 * Navy band carrying the reversed lockup; once the guest scrolls past the hero
 * it resolves into a white bar with the primary lockup.
 *
 * The band is solid rather than transparent on purpose. Brand Guidelines p.12
 * is explicit that the mark never sits directly on a photograph — if photography
 * is unavoidable, the mark goes on a solid Deep Navy or Warm Stone panel laid
 * over the image. A translucent bar would break that; a solid one is the
 * treatment the brand book actually prescribes, and it reads as a sign plate.
 *
 * Navigation is the four items the guidelines specify for the website (p.16):
 * Residences, Rates, Location, Book.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The white state begins once the header has cleared its own height.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change — a drawer that survives navigation traps the guest.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes, and focus returns to the trigger (accessibility_system.md).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // While the drawer is open the bar always wears its solid navy state, so the
  // mark and the close control never sit on a half-lit ground.
  const dark = !scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-standard ease-entrance",
        dark ? "on-navy bg-navy" : "bg-white shadow-1",
      )}
    >
      <Container wide>
        <div
          className={cn(
            "flex items-center justify-between gap-6 transition-[padding] duration-standard ease-entrance",
            scrolled && !open ? "py-2" : "py-4",
          )}
        >
          <Link
            href="/"
            aria-label="Dunslim Apartments — home"
            className="inline-flex shrink-0 items-center py-2"
          >
            {/*
              Both lockups are rendered and cross-faded. Swapping the src would
              show a gap while the second file decodes; this way the change is
              instant and neither one ever flickers.
            */}
            <span className="relative block">
              <Logo
                lockup="horizontal"
                tone="reversed"
                width={148}
                priority
                className={cn(
                  "transition-opacity duration-standard ease-entrance",
                  dark ? "opacity-100" : "opacity-0",
                )}
              />
              <Logo
                lockup="horizontal"
                tone="primary"
                width={148}
                priority
                className={cn(
                  "absolute inset-0 transition-opacity duration-standard ease-entrance",
                  dark ? "opacity-0" : "opacity-100",
                )}
              />
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-2 lg:flex">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative inline-flex min-h-[44px] items-center px-4",
                    "label-caps transition-colors duration-micro",
                    dark
                      ? active
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                      : active
                        ? "text-navy"
                        : "text-charcoal-80 hover:text-navy",
                  )}
                >
                  {item.label}
                  {/*
                    A brass rule draws itself in from the left on hover and stays
                    drawn on the current page. Identity colour used as a rule,
                    which is the job the brand book gives it.
                  */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-1 left-4 right-4 h-px origin-left bg-brass",
                      "transition-transform duration-standard ease-entrance",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}

            <a
              href={`tel:${business.phone.replace(/\s/g, "")}`}
              className={cn(
                "ml-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm transition-colors duration-micro",
                dark ? "text-white/70 hover:text-brass" : "text-charcoal-80 hover:text-navy",
              )}
              aria-label={`Call Dunslim Apartments on ${business.phone}`}
            >
              <Phone size={17} strokeWidth={1.5} aria-hidden />
            </a>

            <ButtonLink
              href="/book"
              size="nav"
              variant={dark ? "onNavy" : "primary"}
              className="ml-2"
            >
              Book
            </ButtonLink>
          </nav>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm transition-colors duration-micro lg:hidden",
              dark ? "text-white" : "text-navy",
            )}
          >
            {open ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </Container>

      {/* A hairline under the white bar, so it separates from a white page. */}
      <span
        aria-hidden
        className={cn(
          "block h-px transition-colors duration-standard",
          dark ? "bg-white/10" : "bg-navy/10",
        )}
      />

      {/*
        The menu is a floating card, not a full-bleed panel. A sheet that covers
        the whole screen to carry four links is mostly empty navy — it reads as
        an interruption rather than a menu. This is anchored under its own
        trigger, sized to its content, and scales out of the top-right corner so
        the movement points back at the button that opened it.
      */}
      {/*
        The menu, in CSS.

        This was the last thing on the site using framer-motion, and the library
        was being downloaded on every page for this one drawer. It is animated
        here with two classes instead.

        The panel stays mounted and is hidden with `visibility` rather than being
        added and removed, which is what makes the closing animation possible
        without a library: an element removed from the DOM cannot animate on its
        way out. `visibility: hidden` also takes it out of the tab order and away
        from screen readers, so the links behind the closed menu are not
        reachable by anyone. The reduced-motion rule in globals.css collapses
        both durations, as it does everywhere else.
      */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", !open && "pointer-events-none")}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={cn("menu-scrim absolute inset-0 bg-navy/50", open && "is-open")}
        />

        <div
          id="mobile-nav"
          className={cn(
            "menu-panel absolute right-4 top-[calc(var(--header-h)-8px)] w-[min(19rem,calc(100vw-2rem))]",
            "overflow-hidden rounded-lg bg-white p-2 shadow-3 ring-1 ring-navy/10",
            open && "is-open",
          )}
        >
              <nav aria-label="Primary" className="flex flex-col">
                {nav.map((item, i) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/item flex min-h-[56px] items-center gap-4 rounded-md px-4",
                        "transition-colors duration-micro",
                        active ? "bg-stone-60" : "hover:bg-stone-40",
                      )}
                    >
                      {/*
                        The index is the architectural tell — a numbered set,
                        not a pile of links.

                        Charcoal, not brass. Brass on white measures 3.17:1 and
                        13px text needs 4.5:1, which is the same rule the brand
                        book states plainly: brass is never a text colour. It
                        stays on the arrow of the current item, where it is a
                        graphic and only owes 3:1.
                      */}
                      <span
                        aria-hidden
                        className={cn(
                          "w-6 shrink-0 font-mono text-[13px] tabular-nums",
                          active ? "text-navy" : "text-charcoal-60",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-h3 font-light text-navy">{item.label}</span>
                      <ArrowUpRight
                        size={17}
                        strokeWidth={1.5}
                        aria-hidden
                        className={cn(
                          "shrink-0 transition-all duration-micro ease-entrance",
                          active
                            ? "text-brass"
                            : "text-charcoal-60 group-hover/item:-translate-y-px group-hover/item:translate-x-px group-hover/item:text-navy",
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>

              <hr className="rule-hair mx-4 my-2" />

              <div className="p-2">
                <ButtonLink href="/book" size="lg" className="w-full">
                  Book
                </ButtonLink>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-md text-caption text-charcoal-80 transition-colors duration-micro hover:bg-stone-40 hover:text-navy"
                  >
                    <Phone size={15} strokeWidth={1.5} aria-hidden />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${business.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-md text-caption text-charcoal-80 transition-colors duration-micro hover:bg-stone-40 hover:text-navy"
                  >
                    <MessageCircle size={15} strokeWidth={1.5} aria-hidden />
                    WhatsApp
                  </a>
                </div>
              </div>
        </div>
      </div>
    </header>
  );
}
