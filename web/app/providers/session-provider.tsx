"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { doWebhookRegistration, storeToken } from "../actions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function withRetry(
  fn: () => Promise<void>,
  retries: number = MAX_RETRIES,
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)),
      );
    }
  }
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();
  const initialized = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const token = await app.idToken();

      await Promise.all([
        withRetry(() => storeToken(token)),
        withRetry(() => doWebhookRegistration(token)),
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Session initialization failed";
      console.error("SessionProvider error:", message);
      setError(message);
      initialized.current = false;
    }
  }, [app]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (error) {
    return (
      <s-page title="Error">
        <s-banner
          tone="critical"
          onDismiss={() => {
            setError(null);
            initSession();
          }}
        >
          <p>Failed to initialize session: {error}</p>
          <p>Dismiss this banner to retry.</p>
        </s-banner>
        {children}
      </s-page>
    );
  }

  return <>{children}</>;
}
