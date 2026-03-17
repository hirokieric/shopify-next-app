"use server";

import { z } from "zod";
import { handleSessionToken } from "@/lib/shopify/verify";
import logger from "@/lib/logger";

export type AppSettings = {
  appName: string;
  notificationsEnabled: boolean;
};

const AppSettingsSchema = z.object({
  appName: z.string().min(1, "App name is required").max(255),
  notificationsEnabled: z.boolean(),
});

const GENERIC_ERROR_MESSAGE = "設定の保存に失敗しました。もう一度お試しください。";

export async function saveSettings(
  sessionToken: string,
  settings: AppSettings,
): Promise<{ status: "success" | "error"; message?: string }> {
  try {
    // 入力バリデーション
    const parsed = AppSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      return { status: "error", message: "入力内容に不備があります。" };
    }

    const { session } = await handleSessionToken(sessionToken);
    const shop = session.shop;

    // TODO: Prisma でショップごとの設定を保存する
    // 例:
    // await prisma.appSettings.upsert({
    //   where: { shop },
    //   update: { ...parsed.data },
    //   create: { shop, ...parsed.data },
    // });

    logger.info({ shop }, "Settings saved");

    return { status: "success" };
  } catch (error) {
    logger.error({ err: error }, "Error saving settings");
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}
