/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { AnimatePresence, motion } from "framer-motion";
import type {
  DiscoverLocation,
  DiscoverLocationDetail,
} from "@/features/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import detailsData from "@/data/discover-details.json";
import LocationInfo from "./LocationInfo";

type MarkerCardProps = {
  marker: DiscoverLocation | null;
  onDismiss: () => void;
  variant?: "overlay" | "inline";
};

const detailsMap = detailsData as Record<string, DiscoverLocationDetail>;

const MarkerCard = ({ marker, onDismiss, variant = "overlay" }: MarkerCardProps) => {
  const isInline = variant === "inline";
  const markerDetails = marker ? detailsMap[marker.id] : null;

  return (
    <AnimatePresence>
      {marker ? (
        <motion.div
          key={marker.id}
          initial={{ opacity: 0, y: isInline ? 12 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isInline ? 12 : -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={
            isInline
              ? "w-full"
              : "pointer-events-auto absolute left-1/2 top-6 w-[92%] max-w-md -translate-x-1/2"
          }
        >
          <Card
            className={
              isInline
                ? "border border-slate-200 bg-white shadow-lg"
                : "border border-slate-200 bg-white/95 shadow-2xl backdrop-blur"
            }
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {marker.name}
                </CardTitle>
                <CardDescription className="text-sm capitalize text-slate-500">
                  {marker.category}
                </CardDescription>
              </div>
              {isInline ? (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </CardHeader>
            <CardContent className="flex items-start justify-between gap-4 pt-0 text-sm text-slate-600">
              <div className="flex-1">
                <LocationInfo
                  markerDescription={marker.description}
                  markerAddress={marker.address}
                  detail={markerDetails}
                  hideTitle
                />
              </div>
              {markerDetails?.photo ? (
                <img
                  src={markerDetails.photo}
                  alt={marker.name}
                  className="h-24 w-24 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default MarkerCard;
