import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnvVariables } from "../env-validation";

// テスト内で process.env のキーを自由に操作するための型キャスト用
const env = process.env as Record<string, string | undefined>;

describe("validateEnvVariables", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    // process.env を元の状態にリセット
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  it("全ての必須環境変数が設定されている場合、エラーをスローしない", () => {
    env.SHOPIFY_API_KEY = "test-key";
    env.SHOPIFY_API_SECRET = "test-secret";
    env.HOST = "https://example.com";
    env.DATABASE_URL = "postgresql://localhost:5432/test";

    expect(() => validateEnvVariables()).not.toThrow();
  });

  it("SHOPIFY_API_KEY が未設定の場合、エラーをスローする", () => {
    delete env.SHOPIFY_API_KEY;
    env.SHOPIFY_API_SECRET = "test-secret";
    env.HOST = "https://example.com";
    env.DATABASE_URL = "postgresql://localhost:5432/test";

    expect(() => validateEnvVariables()).toThrow("SHOPIFY_API_KEY");
  });

  it("複数の環境変数が未設定の場合、すべてをエラーメッセージに含む", () => {
    delete env.SHOPIFY_API_KEY;
    delete env.SHOPIFY_API_SECRET;
    delete env.HOST;
    delete env.DATABASE_URL;

    expect(() => validateEnvVariables()).toThrow(
      /SHOPIFY_API_KEY.*SHOPIFY_API_SECRET.*HOST.*DATABASE_URL/,
    );
  });

  it("空文字列の環境変数はエラーとして扱う", () => {
    env.SHOPIFY_API_KEY = "";
    env.SHOPIFY_API_SECRET = "test-secret";
    env.HOST = "https://example.com";
    env.DATABASE_URL = "postgresql://localhost:5432/test";

    expect(() => validateEnvVariables()).toThrow("SHOPIFY_API_KEY");
  });
});
