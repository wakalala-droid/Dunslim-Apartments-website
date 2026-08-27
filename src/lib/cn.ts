import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about this project's type scale.
 *
 * The brand type scale uses named sizes (text-body, text-h2, text-label…).
 * Out of the box tailwind-merge cannot tell a custom `text-body` from a text
 * colour, so it treats them as the same group and the later class wins — which
 * silently stripped `text-white` off every button that also set `text-body`.
 * Declaring the font-size names here keeps size and colour in separate groups.
 */
const FONT_SIZES = ["label", "caption", "body", "lead", "h3", "h2", "h1", "display"];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
