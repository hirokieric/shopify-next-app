"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <s-page title="Error">
      <s-card>
        <div className="p-6 grid gap-4">
          <s-text as="h2" variant="headingLg">
            Something went wrong
          </s-text>
          <s-text as="p" variant="bodyMd">
            An unexpected error occurred. Please try again.
          </s-text>
          {process.env.NODE_ENV === "development" && error.message && (
            <s-text as="p" variant="bodySm" tone="critical">
              {error.message}
            </s-text>
          )}
          <div className="flex justify-end">
            <s-button onClick={reset}>Try again</s-button>
          </div>
        </div>
      </s-card>
    </s-page>
  );
}
