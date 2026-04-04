"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useRef, useState } from "react";
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

async function initializeSession(
  getToken: () => Promise<string>,
): Promise<void> {
  const token = await getToken();
  await Promise.all([
    withRetry(async () => {
      const result = await storeToken(token);
      if (result.status === "error") throw new Error(result.message);
    }),
    withRetry(async () => {
      const result = await doWebhookRegistration(token);
      if (result.status === "error") throw new Error(result.message);
    }),
  ]);
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();
  const initialized = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cancelled = false;

    initializeSession(() => app.idToken()).then(
      () => {
        // 成功時は何もしない
      },
      (err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Session initialization failed";
        console.error("SessionProvider error:", message);
        setError(message);
        initialized.current = false;
      },
    );

    return () => {
      cancelled = true;
    };
  }, [app, retryCount]);

  if (error) {
    return (
      <s-page title="Error">
        <s-banner
          tone="critical"
          onDismiss={() => {
            setError(null);
            initialized.current = false;
            setRetryCount((c) => c + 1);
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
