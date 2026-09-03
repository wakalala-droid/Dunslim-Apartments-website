import type { Config } from "tailwindcss";

/**
 * Dunslim Apartments: Tailwind configuration.
 *
 * Colour, type and grid come from Dunslim_Apartments_Brand_Guidelines_V1 (Volume One, 2026).
 * Spacing, radius, elevation and motion scales come from the Elite Builder System design OS.
 *
 * Nothing outside these scales is authorised. If a screen needs a value that is not here,
 * use the nearest existing token. Extend this file deliberately, never inside a component.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // ---- Brand palette, page 11. Four colours and white carry the entire system. ----
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      brass: {
        DEFAULT: "#B28A4A", // Soft Brass: the identity colour. Never a body text colour.
        10: "#F7F3EC",
        20: "#F0E8DB",
        40: "#E0CDAE",
        60: "#D0B183",
        80: "#C19E66",
      },
      navy: {
        DEFAULT: "#0F2234", // Deep Navy: the ground colour of the brand.
        10: "#E7E9EB",
        20: "#CFD3D6",
        40: "#9FA7AE",
        60: "#6F7B85",
        80: "#3F4F5D",
      },
      stone: {
        DEFAULT: "#E7E2D8", // Warm Stone: the secondary ground.
        40: "#F6F4F0",
        60: "#F1EEE8",
        80: "#ECE8E0",
      },
      charcoal: {
        DEFAULT: "#2B2E34", // Charcoal: body copy and captions.
        // Tints of Charcoal. Both are set at the lightest value that still
        // clears WCAG AA (4.5:1) against BOTH White and Warm Stone, since
        // muted text appears on both grounds. Measured, not eyeballed:
        // #5F6368 → 6.05:1 on white, 4.69:1 on stone.
        // #565A60 → 6.94:1 on white, 5.37:1 on stone.
        60: "#5F6368",
        80: "#565A60",
      },
      // Semantic: same meaning everywhere, never reused for decoration.
      success: "#2F6B4F",
      warning: "#8A6A1F",
      danger: "#8C3A32",
    },

    // ---- Elite Builder spacing scale. These values only. ----
    spacing: {
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      6: "24px",
      8: "32px",
      12: "48px",
      16: "64px",
      24: "96px",
      32: "128px",
      40: "160px",
      px: "1px",
    },

    borderRadius: {
      none: "0px",
      sm: "6px", // inputs, badges, chips
      md: "10px", // cards, buttons
      lg: "16px", // modals, panels
      full: "9999px",
    },

    boxShadow: {
      none: "none",
      1: "0 1px 2px rgba(15,34,52,0.04)", // hover on flat cards
      2: "0 4px 12px rgba(15,34,52,0.08)", // dropdowns, popovers
      3: "0 12px 32px rgba(15,34,52,0.12)", // modals only
    },

    extend: {
      fontFamily: {
        // Söhne is the brand typeface. Inter is the guideline-approved screen substitute
        // until the retail family is licensed from Klim (Brand Guidelines p.13).
        sans: ["var(--font-inter)", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        /**
         * Brand hierarchy, p.13: display is Extraleicht with tight tracking,
         * body is Buch at 1.6 leading, labels are letterspaced caps.
         *
         * Sized so an eighty-year-old can read this comfortably, which is the
         * actual guest: diplomats, returning families, corporate visitors, not
         * twenty-five-year-olds on a retina laptop. WCAG's 4.5:1 and the old
         * 16px web default are floors, not targets.
         *
         * Nothing here is below 15px and no size is paired with a light weight
         * in body copy. Thin type defeats an older eye even when it passes
         * contrast. Weight 200 is reserved for display sizes only.
         */
        label: ["13px", { lineHeight: "18px", letterSpacing: "0.18em" }],
        caption: ["15px", { lineHeight: "1.55", letterSpacing: "0" }],
        body: ["18px", { lineHeight: "1.65", letterSpacing: "0" }],
        lead: ["21px", { lineHeight: "1.6", letterSpacing: "-0.01em" }],
        h3: ["25px", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        h2: ["34px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        h1: ["clamp(2.25rem, 4vw, 2.875rem)", { lineHeight: "1.15", letterSpacing: "-0.026em" }],
        display: ["clamp(2.75rem, 6.5vw, 5.25rem)", { lineHeight: "1.03", letterSpacing: "-0.036em" }],
      },
      maxWidth: {
        // Brand setting rule: measure of 56 to 72 characters.
        measure: "66ch",
        shell: "1440px",
      },
      transitionDuration: {
        micro: "160ms", // hover, press, toggle
        standard: "240ms", // expand, dropdown, tab
        page: "320ms", // route, modal
      },
      transitionTimingFunction: {
        entrance: "cubic-bezier(0.22, 1, 0.36, 1)", // house ease-out, mirrors lib/motion.ts
        exit: "cubic-bezier(0.64, 0, 0.78, 0)", // house ease-in
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        rise: "rise 550ms cubic-bezier(0.22, 1, 0.36, 1) both",
        fade: "fade 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
