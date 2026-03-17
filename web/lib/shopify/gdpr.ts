import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "./initialize-context";
import prisma from "@/lib/db/prisma-connect";
import logger from "@/lib/logger";

interface GdprCustomerPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone: string;
  };
  orders_to_redact?: number[];
  data_request?: { id: number };
}

interface GdprShopPayload {
  shop_id: number;
  shop_domain: string;
}

export function setupGDPRWebHooks(path: string) {
  return shopify.webhooks.addHandlers({
    /**
     * Customers can request their data from a store owner. When this happens,
     * Shopify invokes this webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
     */
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, shop, body) => {
        const payload: GdprCustomerPayload = JSON.parse(body);
        logger.info(
          { shop, customerId: payload.customer.id },
          "Customer data request received",
        );
        // このアプリはセッション情報のみ保持しているため、
        // 顧客データはonlineAccessInfoのassociatedUserに限定される。
        // ストアオーナーに該当データを提供する。
        const associatedUsers = await prisma.associatedUser.findMany({
          where: {
            email: payload.customer.email,
          },
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            locale: true,
          },
        });
        logger.info(
          { shop, customerId: payload.customer.id, recordCount: associatedUsers.length },
          "Customer data request processed",
        );
      },
    },

    /**
     * Store owners can request that customer data be deleted.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
     */
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, shop, body) => {
        const payload: GdprCustomerPayload = JSON.parse(body);
        logger.info(
          { shop, customerId: payload.customer.id },
          "Customer redact request received",
        );
        // 該当顧客のassociatedUserレコードを削除
        const deleted = await prisma.associatedUser.deleteMany({
          where: {
            email: payload.customer.email,
          },
        });
        logger.info(
          { shop, customerId: payload.customer.id, deletedCount: deleted.count },
          "Customer data redacted",
        );
      },
    },

    /**
     * 48 hours after a store uninstalls the app, Shopify invokes this webhook.
     *
     * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
     */
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, shop, body) => {
        const payload: GdprShopPayload = JSON.parse(body);
        logger.info({ shop, shopId: payload.shop_id }, "Shop redact request received");

        // ショップに関連する全データを削除
        // セッション削除時に関連する OnlineAccessInfo と AssociatedUser もカスケード削除される
        const deleted = await prisma.session.deleteMany({
          where: { shop: payload.shop_domain },
        });
        logger.info(
          { shop, shopId: payload.shop_id, deletedSessions: deleted.count },
          "Shop data redacted",
        );
      },
    },
  });
}
