"use client";

import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TanstackProvider>
      <SessionProvider>{children}</SessionProvider>
    </TanstackProvider>
  );
}
