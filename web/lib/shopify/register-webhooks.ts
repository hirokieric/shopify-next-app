import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "./gdpr";
import shopify from "./initialize-context";
import { AppInstallations } from "../db/app-installations";

let webhooksInitialized = false;

export function addHandlers() {
  if (!webhooksInitialized) {
    setupGDPRWebHooks("/api/webhooks");
    shopify.webhooks.addHandlers({
      ["APP_UNINSTALLED"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          console.info("Uninstalled app from shop: " + shop);
          await AppInstallations.delete(shop);
        },
      },
    });
    console.info("Added handlers");
    webhooksInitialized = true;
  } else {
    console.info("Handlers already added");
  }
}

export async function registerWebhooks(session: Session) {
  addHandlers();
  const responses = await shopify.webhooks.register({ session });
  console.info("Webhooks added", responses);
}
