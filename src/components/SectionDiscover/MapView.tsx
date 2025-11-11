/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { useEffect, useState } from "react";
import type { DiscoverLocation } from "@/features/types";
import { AlertTriangle, MapPin } from "lucide-react";
import { getMarkerClasses } from "@/features/categoryMeta";

import "mapbox-gl/dist/mapbox-gl.css";

type MapModule = typeof import("react-map-gl/mapbox");

type MapViewProps = {
  markers: DiscoverLocation[];
  selectedMarkerId: string | null;
  onMarkerSelect: (id: string) => void;
};

const MAPBOX_TOKEN =
  // Mapbox token stored in .env.local for production. Use public read-only token in prototype.
  import.meta.env.PUBLIC_MAPBOX_TOKEN ??
  "pk.eyJ1IjoicnlhbnNoYWZlciIsImEiOiJjbWhyaWt4aGEwcDQxMnJyNGFyeHJkNnJtIn0.JlW3iImP_sNtUexh634zJw";

if (import.meta.env.DEV) {
  // Surface token presence during local troubleshooting.
  // eslint-disable-next-line no-console
  console.log("PUBLIC_MAPBOX_TOKEN present:", Boolean(import.meta.env.PUBLIC_MAPBOX_TOKEN));
}

const MapView = ({ markers, selectedMarkerId, onMarkerSelect }: MapViewProps) => {
  const [mapKit, setMapKit] = useState<{
    Map: MapModule["Map"];
    Marker: MapModule["Marker"];
  } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 40.732,
    longitude: 17.566,
    zoom: 12.4,
  });
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const module = await import("react-map-gl/mapbox");
        if (mounted) {
          setMapKit({ Map: module.Map, Marker: module.Marker });
        }
      } catch (error) {
        if (mounted) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Unable to load Mapbox dependency",
          );
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // On marker tap: centers map and opens info card.
  // Replace mock data ID lookup with dynamic query once API is live.
  useEffect(() => {
    if (!selectedMarkerId) return;
    const location = markers.find((item) => item.id === selectedMarkerId);
    if (!location) return;
    setViewState((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      zoom: Math.max(prev.zoom, 13.2),
    }));
  }, [selectedMarkerId, markers]);

  const { Map, Marker } = mapKit ?? {};

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-center text-sm text-slate-500">
        <AlertTriangle className="h-5 w-5 text-slate-400" />
        <p>Add `PUBLIC_MAPBOX_TOKEN` to your environment to load the map.</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center text-sm text-slate-500">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
        <p>Map failed to load.</p>
        <p className="text-xs text-slate-400">{mapError}</p>
      </div>
    );
  }

if (!Map || !Marker) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-center text-sm text-slate-500">
      <AlertTriangle className="h-6 w-6 text-amber-400" />
      <p>Loading map libraries…</p>
    </div>
  );
}

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      reuseMaps
      attributionControl={false}
      pitch={40}
      bearing={-8}
      {...viewState}
      onMove={(event) => setViewState(event.viewState)}
      style={{ width: "100%", height: "100%" }}
      onError={(event) => {
        if (event?.error) {
          const message = event.error?.message ?? "Unknown Mapbox error";
          // eslint-disable-next-line no-console
          console.error("Mapbox error:", message, event.error);
          setMapError(message);
        }
      }}
    >
      {markers.map((marker) => {
        const isActive = marker.id === selectedMarkerId;
        const palette = getMarkerClasses(marker.category);
        return (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => onMarkerSelect(marker.id)}
              className={`flex flex-col items-center text-[10px] font-semibold text-white drop-shadow-lg`}
            >
              <span
                className={`flex items-center justify-center rounded-full border ${palette} ${
                  isActive ? "h-12 w-12" : "h-11 w-11"
                }`}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-800 shadow">
                {marker.name.split(" ")[0]}
              </span>
            </button>
          </Marker>
        );
      })}
    </Map>
  );
};

export default MapView;
