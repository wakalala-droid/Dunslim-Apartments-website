import {
  PlaneLanding,
  Bus,
  Car,
  UserRound,
  ShoppingBag,
  Compass,
  PlaneTakeoff,
  Shirt,
  type LucideIcon,
} from "lucide-react";

/**
 * One mark per extra service, keyed by the `id` in `extraServices`.
 *
 * Kept out of content.ts so that file stays plain data. Kept in one place
 * so the homepage band and the /extra-services page can never show a service
 * with two different icons.
 */
export const EXTRA_ICONS: Record<string, LucideIcon> = {
  airport: PlaneLanding,
  bus: Bus,
  "self-drive": Car,
  driver: UserRound,
  shopping: ShoppingBag,
  tours: Compass,
  flights: PlaneTakeoff,
  laundry: Shirt,
};
