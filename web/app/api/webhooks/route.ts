import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";
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

    // Shopify は 5xx エラーの場合に再試行するため、一時的なエラーは 500 を返す
    // 永続的なエラー（バリデーションエラーなど）は 400 を返す
    const statusCode =
      error instanceof Error && error.message.includes("validation")
        ? 400
        : 500;

    return new Response(null, { status: statusCode });
  }
}
