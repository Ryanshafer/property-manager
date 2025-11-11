/**
 * This prototype component is designed for rapid iteration.
 * When moving to production:
 * - Replace mock data imports with API hooks or GraphQL queries.
 * - Extract shared layout (e.g., BottomSheet) into reusable hooks.
 * - Move map state management into a context provider if global state is needed.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy } from "lucide-react";
import wifi from "@/data/wifi.json";
import { Button } from "@/components/ui/button";

const SectionWifi = () => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wifiPayload = useMemo(
    () => `WIFI:T:WPA;S:${wifi.networkName};P:${wifi.password};;`,
    [wifi.networkName, wifi.password],
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dataUrl = await QRCode.toDataURL(wifiPayload, {
          margin: 1,
          scale: 6,
          color: { dark: "#000000", light: "#ffffffff" },
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (isMounted) {
          setQrDataUrl(null);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wifiPayload]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(wifi.password);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  return (
    <section className="mx-auto flex h-full max-w-md flex-col gap-6 px-4 pb-24 pt-8 text-slate-900">
      <header className="space-y-1">
        <h2 className="text-4xl font-bold leading-tight text-neutral-950">
          Want to share WiFi?
        </h2>
        <p className="text-base text-neutral-500">
         {wifi.shareNote}
        </p>
      </header>

      <div className="rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-sm">
        <div className="mt-5 flex justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Wi-Fi QR code" className="h-52 w-52 object-contain" />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center text-sm text-slate-400">
                Generating QR…
              </div>
            )}
        </div>
        <div className="mt-6 space-y-1 text-center text-sm text-neutral-500">
          <div>
            Access Point
            <p className="text-lg font-semibold text-neutral-900">{wifi.networkName}</p>
          </div>
          <div>
            Password
            <p className="text-lg font-semibold text-neutral-900">{wifi.password}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            onClick={handleCopy}
            className="my-4 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy password"}
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Connection tips</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
          {wifi.instructions.map((instruction: string) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SectionWifi;
