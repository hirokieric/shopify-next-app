import { GraphQLClient } from "graphql-request";
import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

// Use a relative URL that will be handled by our API route
const url = `/api/graphql`;

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): UseQueryResult<TResult> {
  const app = useAppBridge();

  return useQuery({
    queryKey: [(document.definitions[0] as any).name.value, variables],
    queryFn: async ({ queryKey }) => {
      console.log("------ DEBUG: TanStack Query GraphQL Request Start ------");
      console.time("TanStack Query GraphQL Request Duration");

      try {
        // Get query information
        const queryName =
          (document.definitions[0] as any).name?.value || "unnamed_query";
        const queryVariables = queryKey[1] ? queryKey[1] : undefined;

        console.log(`Executing GraphQL query: ${queryName}`);
        console.log("Query:", document.loc?.source.body);
        console.log("Variables:", queryVariables);
        console.log("Endpoint URL:", url);

        // Get session token from App Bridge
        console.log("Getting session token from App Bridge...");
        // Use app.idToken() instead of getSessionToken
        const token = await app.idToken();
        console.log("Session token received");

        // Create a GraphQL client with the session token
        const client = new GraphQLClient(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Make the GraphQL request
        console.log("Sending GraphQL request...");
        const result = await client.request(document, queryVariables);
        console.log("GraphQL response received:", result);

        console.timeEnd("TanStack Query GraphQL Request Duration");
        console.log("------ DEBUG: TanStack Query GraphQL Request End ------");

        return result;
      } catch (err: any) {
        console.error("------ DEBUG: TanStack Query GraphQL Error ------");
        console.error("Error details:", err);
        console.error("Error name:", err?.name || "Unknown");
        console.error("Error message:", err?.message || "No message available");
        console.error("Error stack:", err?.stack || "No stack trace available");
        console.timeEnd("TanStack Query GraphQL Request Duration");
        console.error("------ DEBUG: TanStack Query GraphQL Error End ------");
        throw err; // Re-throw so React Query can handle it
      }
    },
  });
}
