/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type {
  DiscoverCategory,
  DiscoverLocation,
  DiscoverLocationDetail,
} from "@/features/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import MarkerCard from "./MarkerCard";
import WelcomeMessage from "./WelcomeMessage";
import type { WelcomeContent } from "./WelcomeMessage";
import welcomeContent from "@/data/welcome.json";
import detailsData from "@/data/discover-details.json";
import LocationInfo from "./LocationInfo";
import SegmentedControl from "@/components/SegmentedControl";
import { CATEGORY_META, getSegmentActiveClass } from "@/features/categoryMeta";

type BottomSheetProps = {
  groupedMarkers: Record<DiscoverCategory, DiscoverLocation[]>;
  allMarkers: DiscoverLocation[];
  state: "collapsed" | "expanded";
  onStateChange: (next: "collapsed" | "expanded") => void;
  onMarkerFocus: (id: string) => void;
  activeMarkerId: string | null;
  bottomSafeOffset?: number;
  activeSegment: DiscoverCategory | "all";
  onSegmentChange: (segment: DiscoverCategory | "all") => void;
  isDesktopLayout?: boolean;
  activeMarker?: DiscoverLocation | null;
  onMarkerClear?: () => void;
};

const detailsMap = detailsData as Record<string, DiscoverLocationDetail>;

const BottomSheet = ({
  groupedMarkers,
  allMarkers,
  state,
  onStateChange,
  onMarkerFocus,
  activeMarkerId,
  bottomSafeOffset = 0,
  activeSegment,
  onSegmentChange,
  isDesktopLayout = false,
  activeMarker = null,
  onMarkerClear,
}: BottomSheetProps) => {
  const isDesktop = isDesktopLayout;
  const hasInlineDetail = isDesktop && Boolean(activeMarker);
  const segmentOptions = useMemo(() => {
    const mapToOption = (key: DiscoverCategory | "all") => ({
      id: key,
      label: key === "all" ? "All" : CATEGORY_META[key as DiscoverCategory].segmentLabel,
      activeClassName: getSegmentActiveClass(key),
    });
    return (["all", ...(Object.keys(CATEGORY_META) as DiscoverCategory[])] as Array<
      DiscoverCategory | "all"
    >).map(mapToOption);
  }, []);
  const activeCategoryMeta =
    activeSegment === "all"
      ? {
          label: "All highlights",
          helper: "Every saved recommendation",
          gradient: "from-neutral-200 to-neutral-200",
          segmentLabel: "All",
        }
      : CATEGORY_META[activeSegment];
  const visibleMarkers =
    activeSegment === "all"
      ? allMarkers
      : groupedMarkers[activeSegment] ?? [];
  const isAllSegment = activeSegment === "all";
  const BASE_EXPANDED_OFFSET = 0;
  const HANDLE_SAFE_ZONE = 150; // Keep grab handle + status bar visible.
  const MAX_VIEWPORT_RATIO = 0.7;
  const CHROME_EXTRA_GAP = -32;
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const [chromeHeight, setChromeHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!chromeRef.current) return;
    const measure = () => {
      setChromeHeight(chromeRef.current?.offsetHeight ?? 0);
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(chromeRef.current);
      return () => observer.disconnect();
    }
    return undefined;
  }, [state, activeSegment]);

  const sheetMaxHeight = viewportHeight
    ? Math.max(BASE_EXPANDED_OFFSET, viewportHeight * MAX_VIEWPORT_RATIO)
    : null;

  const expandedOffset = useMemo(() => {
    const desired = BASE_EXPANDED_OFFSET + bottomSafeOffset;
    if (!viewportHeight) return desired;
    const safeLimit = Math.max(bottomSafeOffset, sheetMaxHeight ?? desired);
    const globalLimit = viewportHeight - HANDLE_SAFE_ZONE - bottomSafeOffset;
    const limit = Math.max(bottomSafeOffset, globalLimit);
    return Math.min(desired, safeLimit, limit);
  }, [bottomSafeOffset, viewportHeight, sheetMaxHeight]);

  const listMaxHeight = sheetMaxHeight
    ? Math.max(
        180,
        sheetMaxHeight - chromeHeight - bottomSafeOffset - CHROME_EXTRA_GAP,
      )
    : undefined;

  // Drag constraints mimic iOS-style spring sheet behavior.
  // In production, consider fine-tuning dragElastic and damping.
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -80) {
      onStateChange("expanded");
    } else if (info.offset.y > 80) {
      onStateChange("collapsed");
    }
  };

  const handleSpotView = (id: string) => {
    onMarkerFocus(id);
    onStateChange(isDesktop ? "expanded" : "collapsed");
  };

  const dragEnabled = !isDesktop;

  const containerClasses = [
    "pointer-events-auto mx-auto w-full max-w-md overflow-hidden border border-white/40 bg-white/80 pb-0 shadow-2xl backdrop-blur-md dark:bg-neutral-900/80",
    "rounded-t-3xl md:rounded-3xl",
    "md:fixed md:left-5 md:top-5 md:mx-0 md:w-[400px] md:pb-4",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      drag={dragEnabled ? "y" : false}
      dragElastic={0.18}
      dragConstraints={dragEnabled ? { top: -expandedOffset, bottom: 0 } : undefined}
      onDragEnd={dragEnabled ? handleDragEnd : undefined}
      animate={{ y: dragEnabled && state === "expanded" ? -expandedOffset : 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className={containerClasses}
      style={
        sheetMaxHeight
          ? {
              maxHeight: `${sheetMaxHeight}px`,
            }
          : undefined
      }
    >
      <div ref={chromeRef}>
        {!isDesktop && (
          <>
            <button
              type="button"
              onClick={() => onStateChange(state === "expanded" ? "collapsed" : "expanded")}
              className="flex w-full flex-col items-center gap-1 pb-3 pt-3 text-slate-700"
            >
              <span className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" />
            </button>
            {state === "collapsed" && (
              <p className="pb-3 text-center text-sm font-semibold text-slate-500">
                {allMarkers.length} must-try local spots
              </p>
            )}
          </>
        )}
        {!hasInlineDetail && (
          <div className="px-3 pb-6 pt-0 md:pt-6">
            <SegmentedControl
              options={segmentOptions}
              value={activeSegment}
              onChange={onSegmentChange}
            />
          </div>
        )}
      </div>

      {state === "expanded" ? (
        <div className="space-y-4 px-3 pb-0">
          {hasInlineDetail && activeMarker ? (
            <MarkerCard
              marker={activeMarker}
              onDismiss={onMarkerClear ?? (() => undefined)}
              variant="inline"
            />
          ) : (
            <div
              className={`space-y-3 overflow-y-auto pr-1 md:pr-2 ${
                isAllSegment ? "pb-14" : "pb-14"
              }`}
              style={{ maxHeight: listMaxHeight }}
            >
              {visibleMarkers.map((spot) => {
                const isActive = spot.id === activeMarkerId;
                const spotDetails = detailsMap[spot.id];
                return (
                  <div
                    key={spot.id}
                    className={`rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-700 shadow-sm transition ${
                      isActive ? "ring-2 ring-slate-400" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSpotView(spot.id)}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <div className="flex-1">
                        <LocationInfo
                          markerName={spot.name}
                          markerDescription={spot.description}
                          markerAddress={spot.address}
                          detail={spotDetails}
                        />
                      </div>
                      {spotDetails?.photo ? (
                        <img
                          src={spotDetails.photo}
                          alt={spot.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="rounded-full bg-slate-100 p-3 text-slate-500">
                          <MapPin className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
              {visibleMarkers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                  No saved spots yet for {activeCategoryMeta.label}.
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default BottomSheet;
