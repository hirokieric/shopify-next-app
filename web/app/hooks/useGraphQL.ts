import request from "graphql-request";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { OperationDefinitionNode } from "graphql";
const url = `shopify:admin/api/2024-10/graphql.json`;

/**
 * GraphQL ドキュメントから操作名を取得
 */
function getOperationName(
  document: TypedDocumentNode<unknown, unknown>,
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

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  const operationName = getOperationName(document);

  return useQuery({
    queryKey: [operationName, variables],
    queryFn: async () => request(url, document, variables),
  });
}
