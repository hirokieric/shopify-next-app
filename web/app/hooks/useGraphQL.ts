import request from "graphql-request";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { OperationDefinitionNode } from "graphql";
const url = `shopify:admin/api/2025-10/graphql.json`;

// graphql-request の型定義が Next/TS の推論と噛み合わないことがあるため、
// TypedDocumentNode + variables を渡す最小の形に揃えたラッパーを用意する。
const gqlRequest = request as unknown as <TResult, TVariables extends object>(
  url: string,
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
) => Promise<TResult>;

/**
 * GraphQL ドキュメントから操作名を取得
 */
function getOperationName<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
): string {
  const operationDefinition = document.definitions.find(
    (def): def is OperationDefinitionNode => def.kind === "OperationDefinition",
  );

  if (operationDefinition?.name?.value) {
    return operationDefinition.name.value;
  }

  // フォールバック: ドキュメントの文字列表現を使用
  return JSON.stringify(document);
}

export function useGraphQL<TResult>(
  document: TypedDocumentNode<TResult, Record<string, never>>,
): UseQueryResult<TResult>;
export function useGraphQL<TResult, TVariables extends object>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): UseQueryResult<TResult>;
export function useGraphQL<TResult, TVariables extends object>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): UseQueryResult<TResult> {
  const operationName = getOperationName(document);
  const variablesForRequest = (variables ??
    ({} as Record<string, never>)) as unknown as TVariables;

  return useQuery({
    queryKey: [operationName, variables],
    queryFn: async () => gqlRequest(url, document, variablesForRequest),
  });
}
