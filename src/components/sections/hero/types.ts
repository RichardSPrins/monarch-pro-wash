import type { FormConfig } from "@/types/sections";

export interface HeroData {
  // Eyebrow
  eyebrow?: {
    text: string;
    variant?: "badge" | "tag" | "text";
  };

  // Heading
  heading: string;
  useBusinessName?: boolean;

  // Supporting content
  subheading?: string;
  body?: string | string[];

  // Trust badges
  trustBadges?: Array<{
    text: string;
    icon?: string;
  }>;

  // Limited time offer
  offer?: {
    label?: string;
    text: string;
  };

  // CTAs
  ctas?: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
  }>;

  // Phone
  showPhone?: boolean;

  // Images — available on ANY hero variant
  backgroundImage?: {
    src: string;
    alt?: string;
    overlayOpacity?: number; // 0-100, default 60
    /** Background crop focal point (center|left|right|top|bottom|top-left|…). Default center. */
    focal?: string;
    /** Optional mobile-only focal override; falls back to `focal` when unset. */
    focalMobile?: string;
  };
  foregroundImage?: {
    src: string;
    alt: string;
    position?: "right" | "left" | "bottom" | "float";
  };

  // Form — the lead-form slot. `form.type` selects which form renders
  // (simple | quiz) via the form registry; omit to show the simple form.
  showForm?: boolean;
  form?: FormConfig;
}
