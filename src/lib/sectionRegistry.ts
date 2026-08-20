import type { AstroComponentFactory } from "astro/runtime/server/index.js";

// Static imports — required for Astro components
import HeroImageOverlay from "@/components/sections/hero/HeroImageOverlay.astro";
import HeroFull from "@/components/sections/hero/HeroFull.astro";
import HeroMinimal from "@/components/sections/hero/HeroMinimal.astro";
import HeroSplitForm from "@/components/sections/hero/HeroSplitForm.astro";
import HeroStackedForm from "@/components/sections/hero/HeroStackedForm.astro";
import ServicesGrid from "@/components/sections/services/ServicesGrid.astro";
import ServicesPhotoGrid from "@/components/sections/services/ServicesPhotoGrid.astro";
import ServicesShowcase from "@/components/sections/services/ServicesShowcase.astro";
import ServicesCategorySplit from "@/components/sections/services/ServicesCategorySplit.astro";
import ServicesCategoryShowcase from "@/components/sections/services/ServicesCategoryShowcase.astro";
import ServicesList from "@/components/sections/services/ServicesList.astro";
import ServicesCards from "@/components/sections/services/ServicesCards.astro";
import ServicesSideBySide from "@/components/sections/services/ServicesSideBySide.astro";
import ServiceAreasMapSplit from "@/components/sections/service-areas/ServiceAreasMapSplit.astro";
import DividerShape from "@/components/sections/divider/DividerShape.astro";
import ProcessNumbered from "@/components/sections/process/ProcessNumbered.astro";
import ProcessHorizontal from "@/components/sections/process/ProcessHorizontal.astro";
import ProcessVertical from "@/components/sections/process/ProcessVertical.astro";
import ReviewsCards from "@/components/sections/reviews/ReviewsCards.astro";
import ReviewsVideoCta from "@/components/sections/reviews/ReviewsVideoCta.astro";
import ReviewsRatingSummary from "@/components/sections/reviews/ReviewsRatingSummary.astro";
import ReviewsMasonry from "@/components/sections/reviews/ReviewsMasonry.astro";
import ReviewsFeatured from "@/components/sections/reviews/ReviewsFeatured.astro";
import FAQAccordion from "@/components/sections/faqs/FAQAccordion.astro";
import FAQStacked from "@/components/sections/faqs/FAQStacked.astro";
import CTABanner from "@/components/sections/cta/CTABanner.astro";
import CTAStatement from "@/components/sections/cta/CTAStatement.astro";
import CTASplit from "@/components/sections/cta/CTASplit.astro";
import CTACentered from "@/components/sections/cta/CTACentered.astro";
import MagnetCta from "@/components/sections/magnets/MagnetCta.astro";
import AboutSplit from "@/components/sections/about/AboutSplit.astro";
import AboutPromiseTrio from "@/components/sections/about/AboutPromiseTrio.astro";
import AboutStacked from "@/components/sections/about/AboutStacked.astro";
import WhyChooseUsSideBySide from "@/components/sections/about/WhyChooseUsSideBySide.astro";
import TrustBarBadges from "@/components/sections/trust-bar/TrustBarBadges.astro";
import TrustBarLogos from "@/components/sections/trust-bar/TrustBarLogos.astro";
import TrustBarStats from "@/components/sections/trust-bar/TrustBarStats.astro";
import RichText from "@/components/sections/content/RichText.astro";
import ContactForm from "@/components/sections/contact/ContactForm.astro";
import ServiceAreasGrid from "@/components/sections/service-areas/ServiceAreasGrid.astro";
import GalleryGrid from "@/components/sections/gallery/GalleryGrid.astro";
import BeforeAfter from "@/components/sections/gallery/BeforeAfter.astro";
import BeforeAfterGrid from "@/components/sections/gallery/BeforeAfterGrid.astro";
import PricingTiers from "@/components/sections/pricing/PricingTiers.astro";
import GuaranteeCallout from "@/components/sections/guarantee/GuaranteeCallout.astro";
import TeamGrid from "@/components/sections/team/TeamGrid.astro";
import FeatureAlternating from "@/components/sections/features/FeatureAlternating.astro";
import UsVsThem from "@/components/sections/comparison/UsVsThem.astro";
import TrustBarRatings from "@/components/sections/trust-bar/TrustBarRatings.astro";
import TrustBarIconStrip from "@/components/sections/trust-bar/TrustBarIconStrip.astro";
import TrustBarGoogleBadge from "@/components/sections/trust-bar/TrustBarGoogleBadge.astro";
import TrustBarStatLockups from "@/components/sections/trust-bar/TrustBarStatLockups.astro";
import TrustBarReviewQuote from "@/components/sections/trust-bar/TrustBarReviewQuote.astro";
import TrustBarSplitCta from "@/components/sections/trust-bar/TrustBarSplitCta.astro";
import AnnouncementBanner from "@/components/sections/banner/AnnouncementBanner.astro";
import CTAStickyBar from "@/components/sections/cta/CTAStickyBar.astro";
import BenefitsTabs from "@/components/sections/benefits/BenefitsTabs.astro";
import BenefitsProblemCards from "@/components/sections/benefits/BenefitsProblemCards.astro";
import FAQTwoColumn from "@/components/sections/faqs/FAQTwoColumn.astro";
import InlineForm from "@/components/sections/contact/InlineForm.astro";
import CertificationsGrid from "@/components/sections/certifications/CertificationsGrid.astro";
import StatsCounters from "@/components/sections/stats/StatsCounters.astro";
import StatsDiagonal from "@/components/sections/stats/StatsDiagonal.astro";
import Timeline from "@/components/sections/about/Timeline.astro";
import ReviewsCarousel from "@/components/sections/reviews/ReviewsCarousel.astro";
import PricingEstimate from "@/components/sections/pricing/PricingEstimate.astro";
import MapEmbed from "@/components/sections/location/MapEmbed.astro";
import HeroVideo from "@/components/sections/hero/HeroVideo.astro";
import HeroGradient from "@/components/sections/hero/HeroGradient.astro";
import HeroStats from "@/components/sections/hero/HeroStats.astro";
import HeroSplitImage from "@/components/sections/hero/HeroSplitImage.astro";
import HeroCenteredCard from "@/components/sections/hero/HeroCenteredCard.astro";
import HeroSplitContent from "@/components/sections/hero/HeroSplitContent.astro";
import HeroSplitStats from "@/components/sections/hero/HeroSplitStats.astro";
import HeroOverlayCard from "@/components/sections/hero/HeroOverlayCard.astro";
import HeroAngled from "@/components/sections/hero/HeroAngled.astro";
import HeroRatingSpotlight from "@/components/sections/hero/HeroRatingSpotlight.astro";
import HeroSplitPanel from "@/components/sections/hero/HeroSplitPanel.astro";
import HeroSpotlight from "@/components/sections/hero/HeroSpotlight.astro";
import HeroFormOverlay from "@/components/sections/hero/HeroFormOverlay.astro";
import HeroShowcase from "@/components/sections/hero/HeroShowcase.astro";
import HeroSplitVideo from "@/components/sections/hero/HeroSplitVideo.astro";
import HeroBadgeRow from "@/components/sections/hero/HeroBadgeRow.astro";
import HeroSplitChecklist from "@/components/sections/hero/HeroSplitChecklist.astro";
import ServicesAccordion from "@/components/sections/services/ServicesAccordion.astro";
import ServicesTabs from "@/components/sections/services/ServicesTabs.astro";
import ServicesIconGrid from "@/components/sections/services/ServicesIconGrid.astro";
import ServicesFeaturedSplit from "@/components/sections/services/ServicesFeaturedSplit.astro";
import ServicesCarousel from "@/components/sections/services/ServicesCarousel.astro";
import FeatureList from "@/components/sections/features/FeatureList.astro";
import FeatureCenteredIcons from "@/components/sections/features/FeatureCenteredIcons.astro";
import FeatureCards from "@/components/sections/features/FeatureCards.astro";
import FeatureChecklist from "@/components/sections/features/FeatureChecklist.astro";
import FeatureHighlight from "@/components/sections/features/FeatureHighlight.astro";
import AboutStatsBand from "@/components/sections/about/AboutStatsBand.astro";
import AboutValues from "@/components/sections/about/AboutValues.astro";
import AboutMission from "@/components/sections/about/AboutMission.astro";
import AboutTeamStory from "@/components/sections/about/AboutTeamStory.astro";
import AboutFullBleed from "@/components/sections/about/AboutFullBleed.astro";
import CTAGradient from "@/components/sections/cta/CTAGradient.astro";
import CTACard from "@/components/sections/cta/CTACard.astro";
import CTAPhoneFocused from "@/components/sections/cta/CTAPhoneFocused.astro";
import CTASplitImage from "@/components/sections/cta/CTASplitImage.astro";
import CTANewsletter from "@/components/sections/cta/CTANewsletter.astro";
import GalleryMasonry from "@/components/sections/gallery/GalleryMasonry.astro";
import GalleryCarousel from "@/components/sections/gallery/GalleryCarousel.astro";
import GalleryFeatured from "@/components/sections/gallery/GalleryFeatured.astro";
import GalleryFilterable from "@/components/sections/gallery/GalleryFilterable.astro";
import GalleryInstagram from "@/components/sections/gallery/GalleryInstagram.astro";
import ReviewsList from "@/components/sections/reviews/ReviewsList.astro";
import ReviewsQuote from "@/components/sections/reviews/ReviewsQuote.astro";
import ReviewsSummary from "@/components/sections/reviews/ReviewsSummary.astro";
import ReviewsCompactGrid from "@/components/sections/reviews/ReviewsCompactGrid.astro";
import ReviewsSplit from "@/components/sections/reviews/ReviewsSplit.astro";
import PricingTable from "@/components/sections/pricing/PricingTable.astro";
import PricingSingle from "@/components/sections/pricing/PricingSingle.astro";
import PricingPackages from "@/components/sections/pricing/PricingPackages.astro";
import PricingAddons from "@/components/sections/pricing/PricingAddons.astro";
import PricingCards from "@/components/sections/pricing/PricingCards.astro";
import TeamList from "@/components/sections/team/TeamList.astro";
import TeamCardsDetailed from "@/components/sections/team/TeamCardsDetailed.astro";
import TeamCarousel from "@/components/sections/team/TeamCarousel.astro";
import TeamFeatured from "@/components/sections/team/TeamFeatured.astro";
import TeamCompact from "@/components/sections/team/TeamCompact.astro";
import ServiceAreasList from "@/components/sections/service-areas/ServiceAreasList.astro";
import ServiceAreasAccordion from "@/components/sections/service-areas/ServiceAreasAccordion.astro";
import ServiceAreasCardsDetailed from "@/components/sections/service-areas/ServiceAreasCardsDetailed.astro";
import ServiceAreasTabs from "@/components/sections/service-areas/ServiceAreasTabs.astro";
import ServiceAreasMapFull from "@/components/sections/service-areas/ServiceAreasMapFull.astro";
import ContentTwoColumn from "@/components/sections/content/TwoColumn.astro";
import ContentImageText from "@/components/sections/content/ImageText.astro";
import ContentCallout from "@/components/sections/content/Callout.astro";
import ContentQuote from "@/components/sections/content/Quote.astro";
import ContentCards from "@/components/sections/content/Cards.astro";
import ContactSplit from "@/components/sections/contact/ContactSplit.astro";
import ContactCards from "@/components/sections/contact/ContactCards.astro";
import ContactMapForm from "@/components/sections/contact/ContactMapForm.astro";
import ContactHours from "@/components/sections/contact/ContactHours.astro";
import ContactCta from "@/components/sections/contact/ContactCta.astro";
import TrustBarMarquee from "@/components/sections/trust-bar/TrustBarMarquee.astro";
import TrustBarInline from "@/components/sections/trust-bar/TrustBarInline.astro";
import CertificationsLogosRow from "@/components/sections/certifications/CertificationsLogosRow.astro";
import FAQGrid from "@/components/sections/faqs/FAQGrid.astro";
import FAQCategorized from "@/components/sections/faqs/FAQCategorized.astro";
import ProcessCards from "@/components/sections/process/ProcessCards.astro";
import ProcessTimeline from "@/components/sections/process/ProcessTimeline.astro";
import ProcessIconRow from "@/components/sections/process/ProcessIconRow.astro";
import StatsCards from "@/components/sections/stats/StatsCards.astro";
import StatsSplit from "@/components/sections/stats/StatsSplit.astro";
import GuaranteeBadges from "@/components/sections/guarantee/GuaranteeBadges.astro";
import BenefitsGrid from "@/components/sections/benefits/BenefitsGrid.astro";
import BenefitsIconList from "@/components/sections/benefits/BenefitsIconList.astro";
import ReviewsVideo from "@/components/sections/reviews/ReviewsVideo.astro";
import ReviewsVideoDuo from "@/components/sections/reviews/ReviewsVideoDuo.astro";
import OwnerVideo from "@/components/sections/about/OwnerVideo.astro";

import OwnerLetter from "@/components/sections/about/OwnerLetter.astro";
import NumbersCollage from "@/components/sections/about/NumbersCollage.astro";
import CredentialsStrip from "@/components/sections/about/CredentialsStrip.astro";
import ImageOverlap from "@/components/sections/about/ImageOverlap.astro";
import PromisePledge from "@/components/sections/about/PromisePledge.astro";
import ContentLeadArticle from "@/components/sections/content/ContentLeadArticle.astro";
import ContentSidebar from "@/components/sections/content/ContentSidebar.astro";
import ContentStatInterrupt from "@/components/sections/content/ContentStatInterrupt.astro";
import ContentQuoteBand from "@/components/sections/content/ContentQuoteBand.astro";
import ContentQA from "@/components/sections/content/ContentQA.astro";
import CTAUrgencyBand from "@/components/sections/cta/CTAUrgencyBand.astro";
import CTAChoosePath from "@/components/sections/cta/CTAChoosePath.astro";
import CTAImageCard from "@/components/sections/cta/CTAImageCard.astro";
import CTAStatBacked from "@/components/sections/cta/CTAStatBacked.astro";
import CTAGuarantee from "@/components/sections/cta/CTAGuarantee.astro";
import FeatureBento from "@/components/sections/features/FeatureBento.astro";
import FeatureStickyList from "@/components/sections/features/FeatureStickyList.astro";
import FeatureSpotlight from "@/components/sections/features/FeatureSpotlight.astro";
import FeatureMediaRail from "@/components/sections/features/FeatureMediaRail.astro";
import FeatureStrip from "@/components/sections/features/FeatureStrip.astro";
import GalleryStrip from "@/components/sections/gallery/GalleryStrip.astro";
import GalleryProjectCards from "@/components/sections/gallery/GalleryProjectCards.astro";
import GalleryShowcase from "@/components/sections/gallery/GalleryShowcase.astro";
import GalleryPolaroid from "@/components/sections/gallery/GalleryPolaroid.astro";
import GalleryRecentJobs from "@/components/sections/gallery/GalleryRecentJobs.astro";
import ProcessZigzag from "@/components/sections/process/ProcessZigzag.astro";
import ProcessBigNumber from "@/components/sections/process/ProcessBigNumber.astro";
import ProcessPhased from "@/components/sections/process/ProcessPhased.astro";
import ProcessStepper from "@/components/sections/process/ProcessStepper.astro";
import ProcessChecklist from "@/components/sections/process/ProcessChecklist.astro";
import BenefitsAlternating from "@/components/sections/benefits/BenefitsAlternating.astro";
import BenefitsProblemSolution from "@/components/sections/benefits/BenefitsProblemSolution.astro";
import BenefitsStatCards from "@/components/sections/benefits/BenefitsStatCards.astro";
import BenefitsBigIconTrio from "@/components/sections/benefits/BenefitsBigIconTrio.astro";
import BenefitsCtaPanel from "@/components/sections/benefits/BenefitsCtaPanel.astro";
import UsVsThemCards from "@/components/sections/comparison/UsVsThemCards.astro";
import WhatSetsUsApart from "@/components/sections/comparison/WhatSetsUsApart.astro";
import CostOfCuttingCorners from "@/components/sections/comparison/CostOfCuttingCorners.astro";
import DiyVsPro from "@/components/sections/comparison/DiyVsPro.astro";
import BeforeHiringChecklist from "@/components/sections/comparison/BeforeHiringChecklist.astro";
import PricingStartingAt from "@/components/sections/pricing/PricingStartingAt.astro";
import PricingPriceList from "@/components/sections/pricing/PricingPriceList.astro";
import PricingFinancing from "@/components/sections/pricing/PricingFinancing.astro";
import PricingQuote from "@/components/sections/pricing/PricingQuote.astro";
import PricingBudgetBands from "@/components/sections/pricing/PricingBudgetBands.astro";
import StatsSpotlight from "@/components/sections/stats/StatsSpotlight.astro";
import StatsBar from "@/components/sections/stats/StatsBar.astro";
import StatsIconGrid from "@/components/sections/stats/StatsIconGrid.astro";
import StatsComparison from "@/components/sections/stats/StatsComparison.astro";
import StatsBand from "@/components/sections/stats/StatsBand.astro";
import TeamOwnerSpotlight from "@/components/sections/team/TeamOwnerSpotlight.astro";
import TeamRosterStrip from "@/components/sections/team/TeamRosterStrip.astro";
import TeamCrewGroup from "@/components/sections/team/TeamCrewGroup.astro";
import TeamSpecialtyCards from "@/components/sections/team/TeamSpecialtyCards.astro";
import TeamHiringPanel from "@/components/sections/team/TeamHiringPanel.astro";
import TrustBarRatingCallout from "@/components/sections/trust-bar/TrustBarRatingCallout.astro";
import TrustBarCountStrip from "@/components/sections/trust-bar/TrustBarCountStrip.astro";
import TrustBarAsFeaturedIn from "@/components/sections/trust-bar/TrustBarAsFeaturedIn.astro";
import TrustBarCertChips from "@/components/sections/trust-bar/TrustBarCertChips.astro";
import TrustBarGuaranteeStrip from "@/components/sections/trust-bar/TrustBarGuaranteeStrip.astro";
import FAQDisclosureList from "@/components/sections/faqs/FAQDisclosureList.astro";
import FAQContactSplit from "@/components/sections/faqs/FAQContactSplit.astro";
import FAQNumbered from "@/components/sections/faqs/FAQNumbered.astro";
import FAQGridCompact from "@/components/sections/faqs/FAQGridCompact.astro";
import FAQFeature from "@/components/sections/faqs/FAQFeature.astro";
import ReviewsSpotlight from "@/components/sections/reviews/ReviewsSpotlight.astro";
import ReviewsWall from "@/components/sections/reviews/ReviewsWall.astro";
import ReviewsMarquee from "@/components/sections/reviews/ReviewsMarquee.astro";
import ReviewsVerified from "@/components/sections/reviews/ReviewsVerified.astro";
import ReviewsBand from "@/components/sections/reviews/ReviewsBand.astro";
import ServiceAreasChips from "@/components/sections/service-areas/ServiceAreasChips.astro";
import ServiceAreasColumns from "@/components/sections/service-areas/ServiceAreasColumns.astro";
import ServiceAreasFeaturedSplit from "@/components/sections/service-areas/ServiceAreasFeaturedSplit.astro";
import ServiceAreasMapChips from "@/components/sections/service-areas/ServiceAreasMapChips.astro";
import ServiceAreasDirectory from "@/components/sections/service-areas/ServiceAreasDirectory.astro";
import ServicesBento from "@/components/sections/services/ServicesBento.astro";
import ServicesNumbered from "@/components/sections/services/ServicesNumbered.astro";
import ServicesSidebarCta from "@/components/sections/services/ServicesSidebarCta.astro";
import ServicesMasonry from "@/components/sections/services/ServicesMasonry.astro";
import ServicesHoverReveal from "@/components/sections/services/ServicesHoverReveal.astro";
import PhoneCTABar from "@/components/sections/banner/PhoneCTABar.astro";
import PromoStrip from "@/components/sections/banner/PromoStrip.astro";
import WeatherAlertBar from "@/components/sections/banner/WeatherAlertBar.astro";
import FinancingBar from "@/components/sections/banner/FinancingBar.astro";
import ReviewRatingBar from "@/components/sections/banner/ReviewRatingBar.astro";
import CertificationsDetailCards from "@/components/sections/certifications/CertificationsDetailCards.astro";
import CertificationsPartnerShowcase from "@/components/sections/certifications/CertificationsPartnerShowcase.astro";
import CertificationsCredentialList from "@/components/sections/certifications/CertificationsCredentialList.astro";
import CertificationsSplitCopy from "@/components/sections/certifications/CertificationsSplitCopy.astro";
import CertificationsCtaPanel from "@/components/sections/certifications/CertificationsCtaPanel.astro";
import ContactFormTrust from "@/components/sections/contact/ContactFormTrust.astro";
import ContactHoursMapForm from "@/components/sections/contact/ContactHoursMapForm.astro";
import ContactEmergency from "@/components/sections/contact/ContactEmergency.astro";
import ContactCallback from "@/components/sections/contact/ContactCallback.astro";
import ContactBanner from "@/components/sections/contact/ContactBanner.astro";
import GuaranteeSealSpotlight from "@/components/sections/guarantee/GuaranteeSealSpotlight.astro";
import GuaranteeCardGrid from "@/components/sections/guarantee/GuaranteeCardGrid.astro";
import GuaranteePromiseSignature from "@/components/sections/guarantee/GuaranteePromiseSignature.astro";
import GuaranteeImageSplit from "@/components/sections/guarantee/GuaranteeImageSplit.astro";
import GuaranteePledgeBanner from "@/components/sections/guarantee/GuaranteePledgeBanner.astro";
import LocationMapOverlay from "@/components/sections/location/LocationMapOverlay.astro";
import LocationDirectionsCta from "@/components/sections/location/LocationDirectionsCta.astro";
import LocationMultiGrid from "@/components/sections/location/LocationMultiGrid.astro";
import LocationMapHoursCta from "@/components/sections/location/LocationMapHoursCta.astro";
import LocationServiceArea from "@/components/sections/location/LocationServiceArea.astro";
import ServicesByCategory from "@/components/sections/services/ServicesByCategory.astro";
import ServicesCategoryTabs from "@/components/sections/services/ServicesCategoryTabs.astro";
import ServicesCategoryCards from "@/components/sections/services/ServicesCategoryCards.astro";
import ServicesCategoryFilter from "@/components/sections/services/ServicesCategoryFilter.astro";
// GEN:variant-imports
export const sectionRegistry: Record<string, AstroComponentFactory> = {
  "hero:image-overlay": HeroImageOverlay,
  "hero:full": HeroFull,
  "hero:minimal": HeroMinimal,
  "hero:split-form": HeroSplitForm,
  "hero:stacked-form": HeroStackedForm,
  "services:grid": ServicesGrid,
  "services:photo-grid": ServicesPhotoGrid,
  "services:showcase": ServicesShowcase,
  "services:category-split": ServicesCategorySplit,
  "services:category-showcase": ServicesCategoryShowcase,
  "services:list": ServicesList,
  "services:cards": ServicesCards,
  "services:side-by-side": ServicesSideBySide,
  "service-areas:map-split": ServiceAreasMapSplit,
  "process:numbered": ProcessNumbered,
  "process:horizontal": ProcessHorizontal,
  "process:vertical": ProcessVertical,
  "reviews:cards": ReviewsCards,
  "reviews:video-cta": ReviewsVideoCta,
  "reviews:rating-summary": ReviewsRatingSummary,
  "reviews:masonry": ReviewsMasonry,
  "reviews:featured": ReviewsFeatured,
  "faqs:accordion": FAQAccordion,
  "faqs:stacked": FAQStacked,
  "cta:banner": CTABanner,
  "cta:statement": CTAStatement,
  "cta:split": CTASplit,
  "cta:centered": CTACentered,
  "magnet:cta": MagnetCta,
  "about:split": AboutSplit,
  "about:promise-trio": AboutPromiseTrio,
  "about:stacked": AboutStacked,
  "about:why-choose-us": WhyChooseUsSideBySide,
  "trust-bar:badges": TrustBarBadges,
  "trust-bar:logos": TrustBarLogos,
  "trust-bar:stats": TrustBarStats,
  "content:rich-text": RichText,
  "contact:form": ContactForm,
  "service-areas:grid": ServiceAreasGrid,
  "gallery:grid": GalleryGrid,
  "gallery:before-after": BeforeAfter,
  "gallery:before-after-grid": BeforeAfterGrid,
  "pricing:tiers": PricingTiers,
  "guarantee:callout": GuaranteeCallout,
  "team:grid": TeamGrid,
  "feature:alternating": FeatureAlternating,
  "comparison:us-vs-them": UsVsThem,
  "trust-bar:ratings": TrustBarRatings,
  "trust-bar:icon-strip": TrustBarIconStrip,
  "trust-bar:google-badge": TrustBarGoogleBadge,
  "trust-bar:stat-lockups": TrustBarStatLockups,
  "trust-bar:review-quote": TrustBarReviewQuote,
  "trust-bar:split-cta": TrustBarSplitCta,
  "banner:announcement": AnnouncementBanner,
  "cta:sticky-bar": CTAStickyBar,
  "benefits:tabs": BenefitsTabs,
  "benefits:problem-cards": BenefitsProblemCards,
  "faqs:two-column": FAQTwoColumn,
  "contact:inline-form": InlineForm,
  "certifications:grid": CertificationsGrid,
  "stats:counters": StatsCounters,
  "stats:diagonal": StatsDiagonal,
  "about:timeline": Timeline,
  "reviews:carousel": ReviewsCarousel,
  "pricing:estimate": PricingEstimate,
  "location:map-embed": MapEmbed,
  "hero:video": HeroVideo,
  "hero:gradient": HeroGradient,
  "hero:stats": HeroStats,
  "hero:split-image": HeroSplitImage,
  "hero:centered-card": HeroCenteredCard,
  "hero:split-content": HeroSplitContent,
  "hero:split-stats": HeroSplitStats,
  "hero:overlay-card": HeroOverlayCard,
  "hero:angled": HeroAngled,
  "hero:rating-spotlight": HeroRatingSpotlight,
  "hero:split-panel": HeroSplitPanel,
  "hero:spotlight": HeroSpotlight,
  "hero:form-overlay": HeroFormOverlay,
  "hero:showcase": HeroShowcase,
  "hero:split-video": HeroSplitVideo,
  "hero:badge-row": HeroBadgeRow,
  "hero:split-checklist": HeroSplitChecklist,
  "services:accordion": ServicesAccordion,
  "services:tabs": ServicesTabs,
  "services:icon-grid": ServicesIconGrid,
  "services:featured-split": ServicesFeaturedSplit,
  "services:carousel": ServicesCarousel,
  "feature:list": FeatureList,
  "feature:centered-icons": FeatureCenteredIcons,
  "feature:cards": FeatureCards,
  "feature:checklist": FeatureChecklist,
  "feature:highlight": FeatureHighlight,
  "about:stats-band": AboutStatsBand,
  "about:values": AboutValues,
  "about:mission": AboutMission,
  "about:team-story": AboutTeamStory,
  "about:full-bleed": AboutFullBleed,
  "cta:gradient": CTAGradient,
  "cta:card": CTACard,
  "cta:phone-focused": CTAPhoneFocused,
  "cta:split-image": CTASplitImage,
  "cta:newsletter": CTANewsletter,
  "gallery:masonry": GalleryMasonry,
  "gallery:carousel": GalleryCarousel,
  "gallery:featured": GalleryFeatured,
  "gallery:filterable": GalleryFilterable,
  "gallery:instagram": GalleryInstagram,
  "reviews:list": ReviewsList,
  "reviews:quote": ReviewsQuote,
  "reviews:summary": ReviewsSummary,
  "reviews:compact-grid": ReviewsCompactGrid,
  "reviews:split": ReviewsSplit,
  "pricing:table": PricingTable,
  "pricing:single": PricingSingle,
  "pricing:packages": PricingPackages,
  "pricing:addons": PricingAddons,
  "pricing:cards": PricingCards,
  "team:list": TeamList,
  "team:cards-detailed": TeamCardsDetailed,
  "team:carousel": TeamCarousel,
  "team:featured": TeamFeatured,
  "team:compact": TeamCompact,
  "service-areas:list": ServiceAreasList,
  "service-areas:accordion": ServiceAreasAccordion,
  "service-areas:cards-detailed": ServiceAreasCardsDetailed,
  "service-areas:tabs": ServiceAreasTabs,
  "service-areas:map-full": ServiceAreasMapFull,
  "content:two-column": ContentTwoColumn,
  "content:image-text": ContentImageText,
  "content:callout": ContentCallout,
  "content:quote": ContentQuote,
  "content:cards": ContentCards,
  "contact:split": ContactSplit,
  "contact:cards": ContactCards,
  "contact:map-form": ContactMapForm,
  "contact:hours": ContactHours,
  "contact:cta": ContactCta,
  "trust-bar:marquee": TrustBarMarquee,
  "trust-bar:inline": TrustBarInline,
  "certifications:logos-row": CertificationsLogosRow,
  "faqs:grid": FAQGrid,
  "faqs:categorized": FAQCategorized,
  "process:cards": ProcessCards,
  "process:timeline": ProcessTimeline,
  "process:icon-row": ProcessIconRow,
  "stats:cards": StatsCards,
  "stats:split": StatsSplit,
  "guarantee:badges": GuaranteeBadges,
  "benefits:grid": BenefitsGrid,
  "benefits:icon-list": BenefitsIconList,
  "reviews:video": ReviewsVideo,
  "reviews:video-duo": ReviewsVideoDuo,
  "about:owner-video": OwnerVideo,
  "about:owner-letter": OwnerLetter,
  "about:numbers-collage": NumbersCollage,
  "about:credentials": CredentialsStrip,
  "about:image-overlap": ImageOverlap,
  "about:promise": PromisePledge,
  "content:lead-article": ContentLeadArticle,
  "content:sidebar": ContentSidebar,
  "content:stat-interrupt": ContentStatInterrupt,
  "content:quote-band": ContentQuoteBand,
  "content:qa": ContentQA,
  "cta:urgency-band": CTAUrgencyBand,
  "cta:choose-path": CTAChoosePath,
  "cta:image-card": CTAImageCard,
  "cta:stat-backed": CTAStatBacked,
  "cta:guarantee": CTAGuarantee,
  "feature:bento": FeatureBento,
  "feature:sticky-list": FeatureStickyList,
  "feature:spotlight": FeatureSpotlight,
  "feature:media-rail": FeatureMediaRail,
  "feature:strip": FeatureStrip,
  "gallery:strip": GalleryStrip,
  "gallery:project-cards": GalleryProjectCards,
  "gallery:showcase": GalleryShowcase,
  "gallery:polaroid": GalleryPolaroid,
  "gallery:recent-jobs": GalleryRecentJobs,
  "process:zigzag": ProcessZigzag,
  "process:big-number": ProcessBigNumber,
  "process:phased": ProcessPhased,
  "process:stepper": ProcessStepper,
  "process:checklist": ProcessChecklist,
  "benefits:alternating": BenefitsAlternating,
  "benefits:problem-solution": BenefitsProblemSolution,
  "benefits:stat-cards": BenefitsStatCards,
  "benefits:big-icon-trio": BenefitsBigIconTrio,
  "benefits:cta-panel": BenefitsCtaPanel,
  "comparison:us-vs-them-cards": UsVsThemCards,
  "comparison:what-sets-us-apart": WhatSetsUsApart,
  "comparison:cost-of-cutting-corners": CostOfCuttingCorners,
  "comparison:diy-vs-pro": DiyVsPro,
  "comparison:before-hiring-checklist": BeforeHiringChecklist,
  "pricing:starting-at": PricingStartingAt,
  "pricing:price-list": PricingPriceList,
  "pricing:financing": PricingFinancing,
  "pricing:quote": PricingQuote,
  "pricing:bands": PricingBudgetBands,
  "stats:spotlight": StatsSpotlight,
  "stats:bar": StatsBar,
  "stats:icon-grid": StatsIconGrid,
  "stats:comparison": StatsComparison,
  "stats:band": StatsBand,
  "team:owner-spotlight": TeamOwnerSpotlight,
  "team:roster-strip": TeamRosterStrip,
  "team:crew-group": TeamCrewGroup,
  "team:specialty-cards": TeamSpecialtyCards,
  "team:hiring-panel": TeamHiringPanel,
  "trust-bar:rating-callout": TrustBarRatingCallout,
  "trust-bar:count-strip": TrustBarCountStrip,
  "trust-bar:as-featured-in": TrustBarAsFeaturedIn,
  "trust-bar:cert-chips": TrustBarCertChips,
  "trust-bar:guarantee-strip": TrustBarGuaranteeStrip,
  "faqs:disclosure": FAQDisclosureList,
  "faqs:contact-split": FAQContactSplit,
  "faqs:numbered": FAQNumbered,
  "faqs:grid-compact": FAQGridCompact,
  "faqs:feature": FAQFeature,
  "reviews:spotlight": ReviewsSpotlight,
  "reviews:wall": ReviewsWall,
  "reviews:marquee": ReviewsMarquee,
  "reviews:verified": ReviewsVerified,
  "reviews:band": ReviewsBand,
  "service-areas:chips": ServiceAreasChips,
  "service-areas:columns": ServiceAreasColumns,
  "service-areas:featured-split": ServiceAreasFeaturedSplit,
  "service-areas:map-chips": ServiceAreasMapChips,
  "service-areas:directory": ServiceAreasDirectory,
  "services:bento": ServicesBento,
  "services:numbered": ServicesNumbered,
  "services:sidebar-cta": ServicesSidebarCta,
  "services:masonry": ServicesMasonry,
  "services:hover-reveal": ServicesHoverReveal,
  "banner:phone-cta": PhoneCTABar,
  "banner:promo-strip": PromoStrip,
  "banner:weather-alert": WeatherAlertBar,
  "banner:financing": FinancingBar,
  "banner:review-rating": ReviewRatingBar,
  "certifications:detail-cards": CertificationsDetailCards,
  "certifications:partner-showcase": CertificationsPartnerShowcase,
  "certifications:credential-list": CertificationsCredentialList,
  "certifications:split-copy": CertificationsSplitCopy,
  "certifications:cta-panel": CertificationsCtaPanel,
  "contact:form-trust": ContactFormTrust,
  "contact:hours-map-form": ContactHoursMapForm,
  "contact:emergency": ContactEmergency,
  "contact:callback": ContactCallback,
  "contact:banner": ContactBanner,
  "guarantee:seal-spotlight": GuaranteeSealSpotlight,
  "guarantee:card-grid": GuaranteeCardGrid,
  "guarantee:promise-signature": GuaranteePromiseSignature,
  "guarantee:image-split": GuaranteeImageSplit,
  "guarantee:pledge-banner": GuaranteePledgeBanner,
  "location:map-overlay": LocationMapOverlay,
  "location:directions-cta": LocationDirectionsCta,
  "location:multi": LocationMultiGrid,
  "location:map-hours-cta": LocationMapHoursCta,
  "location:service-area": LocationServiceArea,
  "services:by-category": ServicesByCategory,
  "services:category-tabs": ServicesCategoryTabs,
  "services:category-cards": ServicesCategoryCards,
  "services:category-filter": ServicesCategoryFilter,
  "divider:shape": DividerShape,
  // GEN:variant-keys
};
