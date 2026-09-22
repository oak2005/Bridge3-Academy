export interface SiteSettings {
  logoText: string;
  logoUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroAnnouncement: string;
  illustrationUrl: string;
  illustrationCaption: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logoText: "Bridge3 Academy",
  logoUrl: "",
  heroHeadline: "Africa’s first structured Web3 education Platform.",
  heroSubheadline:
    "From zero knowledge to verified certification. Learn blockchain, DeFi, smart contracts, and career-ready Web3 skills without tutorial chaos.",
  heroCtaText: "Join Early Access",
  heroAnnouncement: "Early members receive priority verification and scholarship consideration.",
  illustrationUrl: "",
  illustrationCaption: "Web3 Academy Ecosystem",
};
