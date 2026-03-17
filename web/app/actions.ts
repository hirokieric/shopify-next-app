"use server";
import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import { handleSessionToken } from "@/lib/shopify/verify";
import logger from "@/lib/logger";

const GENERIC_ERROR_MESSAGE = "予期しないエラーが発生しました";

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
    const { session } = await handleSessionToken(sessionIdToken);

    return {
      status: "success",
      data: {
        shop: session.shop,
      },
    };
  } catch (error) {
    logger.error({ err: error }, "Server action error");
    return {
      status: "error",
      message: GENERIC_ERROR_MESSAGE,
    };
  }
}

/**
 * Store the session (and access token) in the database
 */
export async function storeToken(
  sessionToken: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    await handleSessionToken(sessionToken, false, true);
    return { status: "success" };
  } catch (error) {
    logger.error({ err: error }, "Error storing token");
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}

/**
 * Register the webhooks that we want setup.
 */
export async function doWebhookRegistration(
  sessionToken: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    const { session } = await handleSessionToken(sessionToken);
    await registerWebhooks(session);
    return { status: "success" };
  } catch (error) {
    logger.error({ err: error }, "Error registering webhooks");
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}
