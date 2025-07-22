"use client";
import { useEffect } from "react";
import { doWebhookRegistration, storeToken } from "../actions";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // App Bridge is initialized by the script tag in layout.tsx
    // We'll use a simpler approach that doesn't require direct App Bridge usage
    async function initializeSession() {
      try {
        // Get session token if available via fetch with credentials
        const response = await fetch("/api/hello", {
          credentials: "include",
        });

        if (response.ok) {
          console.log("Session initialized");
        }
      } catch (error) {
        console.warn("Could not initialize session:", error);
      }
    }

    initializeSession();
  }, []);

  return <>{children}</>;
}
