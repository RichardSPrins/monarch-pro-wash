import { getMenu, getSiteSettings } from "emdash";
import type { BusinessData, SiteData } from "@/lib/schema";
import siteConfig from "@/config/site.config";
import { getBusiness } from "@/lib/content";

/** Compose BusinessData from the two native-first sources: native SiteSettings
 * (title→businessName, tagline, social) + the custom `business` singleton
 * (NAP/GBP — no native slot). Falls back to site.config when settings are absent. */
export async function getBusinessData(): Promise<BusinessData> {
  try {
    const [settings, biz] = await Promise.all([getSiteSettings(), getBusiness()]);
    const businessName = settings.title;
    if (!businessName) throw new Error("No site settings found");
    const s = settings.social;
    const l = (settings as any).logo;
    return {
      businessName,
      tagline: settings.tagline,
      logo: l?.url
        ? { url: l.url, alt: l.alt || businessName, width: l.width, height: l.height }
        : undefined,
      phone: biz.phone ?? "",
      email: biz.email ?? "",
      address: biz.address ?? "",
      city: biz.city ?? "",
      state: biz.state ?? "",
      zip: biz.zip ?? "",
      gbpUrl: biz.gbp_url || undefined,
      social: s
        ? {
            facebook: s.facebook,
            instagram: s.instagram,
            youtube: s.youtube,
            twitter: (s as any).twitter,
            linkedin: (s as any).linkedin,
          }
        : undefined,
    };
  } catch {
    return {
      businessName: siteConfig.name,
      tagline: siteConfig.description,
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    };
  }
}

export function getSiteData(): SiteData {
  return {
    url: siteConfig.url,
    ogImage: siteConfig.ogImage,
  };
}

export interface NavNode {
  label: string;
  href?: string;
  children?: NavNode[];
}

/** A native EmDash menu item as returned by getMenu(). */
interface MenuItem {
  label: string;
  url: string;
  children?: MenuItem[];
}

const toNode = (i: MenuItem): NavNode => ({
  label: i.label,
  href: i.url && i.url !== "#" ? i.url : undefined,
  children: i.children?.length ? i.children.map(toNode) : undefined,
});

/** Read any native EmDash menu (primary, footer, footer-legal, …) recursively,
 * exactly as authored in the CMS Navigation admin. Nothing is derived — the menu
 * IS the source of truth for what links appear. */
export async function getMenuLinks(name: string): Promise<NavNode[]> {
  try {
    const menu = await getMenu(name);
    if (!menu) return [];
    return (menu.items as unknown as MenuItem[]).map(toNode);
  } catch (e) {
    console.error(`[emdash] getMenuLinks("${name}")`, e);
    return [];
  }
}

/** The site's primary navigation — the native `primary` menu, verbatim. */
export const getResolvedNav = (): Promise<NavNode[]> => getMenuLinks("primary");

/** Footer navigation from native menus, shaped for every footer design:
 * - `groups`: the `footer` menu's top-level items (= columns), each with its `children` (= links)
 * - `flat`:   those children flattened into one list (for row/minimal footers)
 * - `legal`:  the `footer-legal` menu (rendered in every footer's bottom bar)
 * All CMS-editable; nothing is derived from the `primary` (header) menu. */
export async function getFooterNav(): Promise<{ groups: NavNode[]; flat: NavNode[]; legal: NavNode[] }> {
  const [groups, legal] = await Promise.all([getMenuLinks("footer"), getMenuLinks("footer-legal")]);
  const flat = groups.flatMap((g) => (g.children?.length ? g.children : g.href ? [g] : []));
  return { groups, flat, legal };
}
