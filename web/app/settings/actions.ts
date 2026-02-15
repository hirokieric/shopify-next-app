"use server";

import { handleSessionToken } from "@/lib/shopify/verify";
import logger from "@/lib/logger";

export type AppSettings = {
  appName: string;
  notificationsEnabled: boolean;
};

export async function saveSettings(
  sessionToken: string,
  settings: AppSettings,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    const { shop } = await handleSessionToken(sessionToken);

    // TODO: Prisma でショップごとの設定を保存する
    // 例:
    // await prisma.appSettings.upsert({
    //   where: { shop },
    //   update: { ...settings },
    //   create: { shop, ...settings },
    // });

    logger.info({ shop, settings }, "Settings saved");

    return { status: "success" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings";
    logger.error({ err: error }, "Error saving settings");
    return { status: "error", message };
  }
}
