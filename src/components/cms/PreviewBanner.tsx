import { draftMode } from "next/headers";

export function PreviewBanner() {
  const { isEnabled } = draftMode();
  if (!isEnabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-400 text-amber-900 py-2 text-center text-sm font-medium">
      Preview mode is active — showing draft content.{" "}
      <a href="/api/preview/disable" className="underline font-semibold">
        Exit preview
      </a>
    </div>
  );
}
