/*
		Add Content Security Policy headers to all relevant requests.
*/

import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Exceptions:
     * /api/auth, /api/auth/callback, /api/webhooks, /api/proxy_route, /api/gdpr, /_next,
     * /_proxy, /_auth, /_static, /_vercel, /public (/favicon.ico, etc)
     */
    "/((?!api/auth|api/auth/callback|api/webhooks|api/proxy_route|api/gdpr|_next|_proxy|_auth|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export function middleware(request: NextRequest) {
  const {
    nextUrl: { search },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const rawShop = params.shop;
  const shop =
    rawShop && /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(rawShop)
      ? rawShop
      : "*.myshopify.com";

  const res = NextResponse.next();

  // Content Security Policy
  res.headers.set(
    "Content-Security-Policy",
    `frame-ancestors https://${shop} https://admin.shopify.com;`,
  );

  // HTTPS を強制（max-age: 1年、サブドメイン含む）
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // MIME タイプスニッフィングを防止
  res.headers.set("X-Content-Type-Options", "nosniff");

  // リファラー情報の漏洩を最小限に
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // クリックジャッキング防止（CSP frame-ancestors の補完）
  res.headers.set("X-Frame-Options", "DENY");

  // 権限ポリシー（不要な API へのアクセスを制限）
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return res;
}
