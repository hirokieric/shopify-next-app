import { NextResponse } from "next/server";
import {
  AppNotInstalledError,
  ExpiredTokenError,
  ScopeMismatchError,
  SessionNotFoundError,
} from "@/lib/errors/session-errors";
import type { APIErrorResponse } from "@/lib/types/api";

export type { APIErrorResponse };

/**
 * エラーを適切な HTTP ステータスコードとレスポンスに変換
 */
export function handleApiError(error: unknown): NextResponse<APIErrorResponse> {
  // 既知のエラータイプを処理
  if (error instanceof AppNotInstalledError) {
    return NextResponse.json<APIErrorResponse>(
      {
        status: "error",
        message: "アプリがインストールされていません",
        code: "APP_NOT_INSTALLED",
      },
      { status: 401 },
    );
  }

  if (error instanceof SessionNotFoundError) {
    return NextResponse.json<APIErrorResponse>(
      {
        status: "error",
        message: "セッションが見つかりません",
        code: "SESSION_NOT_FOUND",
      },
      { status: 401 },
    );
  }

  if (error instanceof ExpiredTokenError) {
    return NextResponse.json<APIErrorResponse>(
      {
        status: "error",
        message: "トークンの有効期限が切れています",
        code: "TOKEN_EXPIRED",
      },
      { status: 401 },
    );
  }

  if (error instanceof ScopeMismatchError) {
    return NextResponse.json<APIErrorResponse>(
      {
        status: "error",
        message: "スコープが一致しません",
        code: "SCOPE_MISMATCH",
      },
      { status: 403 },
    );
  }

  // 一般的なエラー
  const errorMessage =
    error instanceof Error ? error.message : "予期しないエラーが発生しました";

  // 本番環境では詳細なエラー情報を隠す
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction ? "サーバーエラーが発生しました" : errorMessage;

  // エラーログを記録（本番環境でも）
  console.error("API Error:", error);

  return NextResponse.json<APIErrorResponse>(
    {
      status: "error",
      message,
      code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
    },
    { status: 500 },
  );
}
