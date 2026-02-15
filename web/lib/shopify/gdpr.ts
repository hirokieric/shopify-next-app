import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "./initialize-context";

export function setupGDPRWebHooks(path: string) {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  return shopify.webhooks.addHandlers({
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, _shop, body) => {
        const _payload = JSON.parse(body);
        // TODO: 顧客データリクエストの処理を実装する
        // アプリが保持する顧客データを収集し、ストアオーナーに提供する
        // Shopify アプリ審査で実装が必要
        // Payload shape: { shop_id, shop_domain, orders_requested[], customer: { id, email, phone }, data_request: { id } }
      },
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, _shop, body) => {
        const _payload = JSON.parse(body);
        // TODO: 顧客データ削除の処理を実装する
        // アプリが保持する該当顧客のデータを削除する
        // Shopify アプリ審査で実装が必要
        // Payload shape: { shop_id, shop_domain, customer: { id, email, phone }, orders_to_redact[] }
      },
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (_topic, _shop, body) => {
        const _payload = JSON.parse(body);
        // TODO: ショップデータ削除の処理を実装する
        // アプリが保持する該当ショップの全データを削除する
        // Shopify アプリ審査で実装が必要
        // Payload shape: { shop_id, shop_domain }
      },
    },
  });
}
