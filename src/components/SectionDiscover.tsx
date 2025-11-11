/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { useEffect, useMemo, useState } from "react";

import MapView from "./SectionDiscover/MapView";
import BottomSheet from "./SectionDiscover/BottomSheet";
import MarkerCard from "./SectionDiscover/MarkerCard";
// Temporary mock data — replace with backend response or CMS integration.
import discoverData from "@/data/discover.json";
import type { DiscoverCategory, DiscoverLocation } from "@/features/types";

const MAP_VIEWPORT_MIN_HEIGHT = "max(32rem, calc(100dvh - 5.5rem))";
const NAV_SAFE_OFFSET_PX = 0; // Matches ~pb-24 to clear the bottom nav.

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const SectionDiscover = () => {
  const [sheetState, setSheetState] = useState<"collapsed" | "expanded">(
    "collapsed",
  );
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<DiscoverCategory | "all">(
    "all",
  );
  const [isDesktopSheet, setIsDesktopSheet] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQueryList = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktopSheet(event.matches);
    };
    handleChange(mediaQueryList);
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    setSheetState(isDesktopSheet ? "expanded" : "collapsed");
  }, [isDesktopSheet]);

  const locations = discoverData as DiscoverLocation[];

  const groupedByCategory = useMemo(() => {
    return locations.reduce(
      (acc, item) => {
        acc[item.category].push(item as DiscoverLocation);
        return acc;
      },
      {
        restaurant: [] as DiscoverLocation[],
        beach: [] as DiscoverLocation[],
        nightlife: [] as DiscoverLocation[],
        activity: [] as DiscoverLocation[],
      },
    );
  }, []);

  const filteredLocations = useMemo(() => {
    if (activeSegment === "all") return locations;
    return locations.filter((item) => item.category === activeSegment);
  }, [locations, activeSegment]);

  const activeMarker = useMemo(
    () => locations.find((item) => item.id === activeMarkerId) ?? null,
    [activeMarkerId],
  );

  useEffect(() => {
    if (!activeMarkerId) return;
    if (!filteredLocations.some((location) => location.id === activeMarkerId)) {
      setActiveMarkerId(null);
    }
  }, [filteredLocations, activeMarkerId]);

  const handleMarkerSelect = (id: string) => {
    setActiveMarkerId(id);
  };

  return (
    <section
      className="relative h-full w-full overflow-hidden"
      style={{ minHeight: MAP_VIEWPORT_MIN_HEIGHT }}
    >
      <div className="absolute inset-0 z-0">
        <MapView
          markers={filteredLocations}
          selectedMarkerId={activeMarkerId}
          onMarkerSelect={handleMarkerSelect}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end">
        <div className="pb-0">
          <BottomSheet
            groupedMarkers={groupedByCategory}
            state={sheetState}
            onStateChange={setSheetState}
            onMarkerFocus={handleMarkerSelect}
            activeMarkerId={activeMarkerId}
            bottomSafeOffset={NAV_SAFE_OFFSET_PX}
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
            allMarkers={locations}
            isDesktopLayout={isDesktopSheet}
            activeMarker={activeMarker ?? null}
            onMarkerClear={() => setActiveMarkerId(null)}
          />
        </div>
      </div>

      {!isDesktopSheet && (
        <MarkerCard
          marker={activeMarker ?? null}
          onDismiss={() => setActiveMarkerId(null)}
        />
      )}

    </section>
  );
};

export default SectionDiscover;
