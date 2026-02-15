import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "./gdpr";
import shopify from "./initialize-context";
import { AppInstallations } from "../db/app-installations";
import logger from "@/lib/logger";

let webhooksInitialized = false;

export function addHandlers() {
  if (!webhooksInitialized) {
    setupGDPRWebHooks("/api/webhooks");
    shopify.webhooks.addHandlers({
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          logger.info({ shop }, "Uninstalled app from shop");
          await AppInstallations.delete(shop);
        },
      },
    });
    logger.info("Webhook handlers added");
    webhooksInitialized = true;
  } else {
    logger.debug("Webhook handlers already added");
  }
}

export async function registerWebhooks(session: Session) {
  addHandlers();
  const responses = await shopify.webhooks.register({ session });
  logger.info({ shop: session.shop, responses }, "Webhooks registered");
}
