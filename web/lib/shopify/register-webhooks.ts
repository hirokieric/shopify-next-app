import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "./gdpr";
import shopify from "./initialize-context";
import { AppInstallations } from "../db/app-installations";
import logger from "@/lib/logger";

// Promise ベースのガードでレースコンディションを防止
let handlersPromise: Promise<void> | null = null;

export function addHandlers() {
  if (!handlersPromise) {
    handlersPromise = initHandlers();
  }
  return handlersPromise;
}

async function initHandlers(): Promise<void> {
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
}

export async function registerWebhooks(session: Session) {
  await addHandlers();
  const responses = await shopify.webhooks.register({ session });
  // レスポンス全体をログに出すとトークンが漏洩するリスクがあるため、ステータスのみログ出力
  const registrationSummary = Object.entries(responses).map(
    ([topic, results]) => ({
      topic,
      success: Array.isArray(results)
        ? results.every((r) => r.success)
        : false,
    }),
  );
  logger.info(
    { shop: session.shop, registrations: registrationSummary },
    "Webhooks registered",
  );
}
