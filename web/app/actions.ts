"use server";
import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import { handleSessionToken } from "@/lib/shopify/verify";
import logger from "@/lib/logger";

/**
 * Do the server action and return the status
 */
export async function doServerAction(sessionIdToken: string): Promise<{
  status: "success" | "error";
  data?: {
    shop: string;
  };
  message?: string;
}> {
  try {
    const {
      session: { shop },
    } = await handleSessionToken(sessionIdToken);

    return {
      status: "success",
      data: {
        shop,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    logger.error({ err: error }, "Server action error");
    return {
      status: "error",
      message: errorMessage,
    };
  }
}

/**
 * Store the session (and access token) in the database
 */
export async function storeToken(sessionToken: string): Promise<void> {
  try {
    await handleSessionToken(sessionToken, false, true);
  } catch (error) {
    logger.error({ err: error }, "Error storing token");
    throw error;
  }
}

/**
 * Register the webhooks that we want setup.
 */
export async function doWebhookRegistration(
  sessionToken: string,
): Promise<void> {
  try {
    const { session } = await handleSessionToken(sessionToken);
    await registerWebhooks(session);
  } catch (error) {
    logger.error({ err: error }, "Error registering webhooks");
    throw error;
  }
}
