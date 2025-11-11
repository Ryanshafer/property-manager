import type { DiscoverCategory } from "./types";

export interface CategoryMetaEntry {
  label: string;
  helper: string;
  gradient: string;
  segmentLabel: string;
  segmentActiveClass: string;
  markerClasses: string;
}

export const CATEGORY_META: Record<DiscoverCategory, CategoryMetaEntry> = {
  restaurant: {
    label: "Restaurants",
    helper: "Local kitchens + chef tables",
    gradient: "from-rose-500/80 to-rose-400/50",
    segmentLabel: "Food",
    segmentActiveClass: "bg-rose-200",
    markerClasses: "bg-rose-500 border-rose-100 text-white",
  },
  beach: {
    label: "Beaches",
    helper: "Loungers, coves, and calm water",
    gradient: "from-cyan-500/80 to-cyan-400/50",
    segmentLabel: "Beaches",
    segmentActiveClass: "bg-cyan-200",
    markerClasses: "bg-cyan-500 border-cyan-100 text-white",
  },
  nightlife: {
    label: "Nightlife",
    helper: "Lounges, DJ pop-ups, cocktail dens",
    gradient: "from-indigo-500/80 to-indigo-400/50",
    segmentLabel: "Nightlife",
    segmentActiveClass: "bg-indigo-200",
    markerClasses: "bg-indigo-500 border-indigo-100 text-white",
  },
  activity: {
    label: "Activities",
    helper: "Workshops, markets, and day trips",
    gradient: "from-emerald-500/80 to-emerald-400/50",
    segmentLabel: "Activities",
    segmentActiveClass: "bg-emerald-200",
    markerClasses: "bg-emerald-500 border-emerald-100 text-white",
  },
};

export const getSegmentActiveClass = (key: DiscoverCategory | "all") =>
  key === "all" ? "bg-white" : CATEGORY_META[key].segmentActiveClass;

export const getMarkerClasses = (category: DiscoverCategory) => CATEGORY_META[category].markerClasses;
