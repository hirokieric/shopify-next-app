"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Shopify GraphQL の呼び出しを60秒間キャッシュ
        staleTime: 60 * 1000,
        // 未使用データを5分間保持
        gcTime: 5 * 60 * 1000,
        // ウィンドウフォーカス時のリフェッチを無効化（埋め込みアプリでは頻繁に発火する）
        refetchOnWindowFocus: false,
        // ネットワークエラー時のリトライ回数
        retry: 2,
      },
    },
  });
}

export function TanstackProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
