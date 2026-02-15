/**
 * API レスポンスの共通型定義
 */
export type APIResponse<T = unknown> = {
  status: "success" | "error";
  data?: T;
  message?: string;
};

export type APIErrorResponse = {
  status: "error";
  message: string;
  code?: string;
};
