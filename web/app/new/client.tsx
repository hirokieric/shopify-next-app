"use client";

import { Button } from "@shopify/polaris";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ClientNewPage() {
  const searchParams = useSearchParams();

  return (
    <div>
      <h1>New Page</h1>
      <div className="space-y-4">
        <Button
          onClick={() => {
            const url = `/?${searchParams.toString()}`;
            // Use safer navigation method that works in embedded context
            try {
              window.history.pushState({}, "", url);
              window.location.href = url;
            } catch (error) {
              // Fallback to direct navigation
              window.location.href = url;
            }
          }}
        >
          Back to Home (Improved navigation)
        </Button>
        <Link href={`/?${searchParams.toString()}`}>
          Back to Home (Next.js Link - may break embedded context)
        </Link>
      </div>
    </div>
  );
}
