import { deleteSessions, findSessionsByShop } from "./session-storage";
import prisma from "./prisma-connect";
import type { Session as ShopifySession } from "@shopify/shopify-api";

function getApiKey(): string {
  const key = process.env.SHOPIFY_API_KEY;
  if (!key) throw new Error("SHOPIFY_API_KEY is not set");
  return key;
}

export const AppInstallations = {
  includes: async function (shopDomain: string) {
    // 直接DBクエリで有効なセッションの存在を確認（N+1回避）
    const session = await prisma.session.findFirst({
      where: {
        shop: shopDomain,
        accessToken: { not: null },
        apiKey: getApiKey(),
      },
      select: { id: true },
    });
    return session !== null;
  },

  delete: async function (shopDomain: string) {
    const shopSessions = await findSessionsByShop(shopDomain);
    if (shopSessions.length > 0) {
      await deleteSessions(
        shopSessions.map((session: ShopifySession) => session.id),
      );
    }
  },
};
