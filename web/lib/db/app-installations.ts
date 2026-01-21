import { deleteSessions, findSessionsByShop } from "./session-storage";
import type { Session as ShopifySession } from "@shopify/shopify-api";

export const AppInstallations = {
  includes: async function (shopDomain: string) {
    const shopSessions = await findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
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
