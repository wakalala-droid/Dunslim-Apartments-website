"use client";

import { usePathname } from "next/navigation";
import { business } from "@/lib/content";

/**
 * WhatsApp, pinned.
 *
 * Numa and Kasa both put WhatsApp in the footer of a European site. In Lusaka it
 * is the primary channel, so it sits on every screen rather than being buried.
 *
 * Hidden on the booking flow: a guest mid-checkout should be finishing the
 * booking, and a floating action there competes with the primary one.
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/book")) return null;

  return (
    <a
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      /*
        Arrives last, once the page has settled, so it reads as offered rather
        than as part of the furniture. It is a control and not content, and the
        animation is plain CSS with no script behind it, so it always appears —
        instantly under prefers-reduced-motion, which collapses the duration.
      */
      style={{ animationDelay: "900ms" }}
      className="a-rise fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-2 transition-[background-color,transform,box-shadow] duration-micro ease-entrance hover:-translate-y-[2px] hover:bg-navy-80 hover:shadow-3"
      aria-label="Message Dunslim Apartments on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden focusable="false">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.69 1.19h.01c5.43 0 9.85-4.42 9.85-9.86A9.79 9.79 0 0 0 12.04 2Zm0 17.95h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.52 3.68-8.2 8.2-8.2a8.16 8.16 0 0 1 8.19 8.2c0 4.52-3.68 8.19-8.2 8.19Z" />
      </svg>
    </a>
  );
}
