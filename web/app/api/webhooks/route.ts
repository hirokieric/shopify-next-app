import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";
import {
  InvalidHmacError,
  InvalidWebhookError,
} from "@shopify/shopify-api";
import { headers } from "next/headers";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const topic = (await headers()).get("x-shopify-topic") as string;

    if (!topic) {
      logger.error("Webhook topic is missing");
      return new Response(null, { status: 400 });
    }

    // Seems like there is some weird behaviour where the shopify api doesn't have the handlers registered - possibly due to some serverless behaviour
    const handlers = shopify.webhooks.getHandlers(topic);
    if (handlers.length === 0) {
      logger.warn({ topic }, "No handlers found for topic, re-adding");
      addHandlers();
    }

    const rawBody = await req.text();

    if (!rawBody) {
      logger.error({ topic }, "Webhook body is empty");
      return new Response(null, { status: 400 });
    }

    await shopify.webhooks.process({
      rawBody,
      rawRequest: req,
    });

    logger.info({ topic }, "Webhook processed successfully");
    return new Response(null, { status: 200 });
  } catch (error) {
    logger.error({ err: error }, "Webhook processing error");

    // SDK の型付きエラーで分類する（文字列マッチングではなく）
    // InvalidHmacError / InvalidWebhookError → 永続的エラー → 400（再試行不要）
    // その他 → 一時的エラー → 500（Shopify が再試行する）
    if (
      error instanceof InvalidHmacError ||
      error instanceof InvalidWebhookError
    ) {
      return new Response(null, { status: 401 });
    }

    return new Response(null, { status: 500 });
  }
}
