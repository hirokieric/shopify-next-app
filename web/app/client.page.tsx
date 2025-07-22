"use client";

import { graphql } from "@/lib/gql";
import { Button, LegacyCard as Card, Page, Text } from "@shopify/polaris";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { doServerAction } from "./actions";
import { useGraphQL } from "./hooks/useGraphQL";

interface Data {
  name: string;
  height: string;
}

const GET_SHOP = graphql(`
  query getShop {
    shop {
      name
    }
  }
`);

export default function Home() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Data | null>(null);
  const [serverActionResult, setServerActionResult] = useState<{
    status: "success" | "error";
  }>();

  // useGraphQL is a hook that uses Tanstack Query to query Shopify GraphQL, everything is typed!
  const {
    data: graphqlData,
    isLoading: graphqlLoading,
    error: graphqlError,
  } = useGraphQL(GET_SHOP);

  const handleGetAPIRequest = async () => {
    console.log("------ DEBUG: API Request Start ------");
    console.time("API Request Duration");
    try {
      console.log("Making request to: /api/hello");
      // global fetch has tokens automatically added
      // https://shopify.dev/docs/api/app-bridge-library/apis/resource-fetching
      const response = await fetch("/api/hello");
      console.log("Response Status:", response.status);

      // Convert headers to a plain object safely
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Response Headers:", headers);

      const result = (await response.json()) as { data: Data };
      console.log("API Response Data:", result);
      setData(result.data);
      console.log("------ DEBUG: API Request End ------");
    } catch (err: any) {
      console.error("------ DEBUG: API Request Error ------");
      console.error("Error details:", err);
      console.error("Error name:", err?.name || "Unknown");
      console.error("Error message:", err?.message || "No message available");
      console.error("Error stack:", err?.stack || "No stack trace available");
      console.error("------ DEBUG: API Request Error End ------");
    } finally {
      console.timeEnd("API Request Duration");
    }
  };

  return (
    <Page title="Home">
      <div className="flex items-center justify-center gap-1 p-2 bg-slate-800 text-white rounded-lg mb-2 shadow-lg">
        <p className="font-medium text-[1rem]">
          We can also use tailwindcss in this project!
        </p>
      </div>
      <Card
        sectioned
        title="NextJs API Routes"
        primaryFooterAction={{
          content: "Call API",
          onAction: handleGetAPIRequest,
        }}
      >
        <Text as="p" variant="bodyMd">
          Call a NextJS api route from within your app. The request is verified
          using session tokens.
        </Text>
        {data && (
          <Text as="h1" variant="headingSm">
            {data.name} is {data.height} tall.
          </Text>
        )}
      </Card>

      <Card
        sectioned
        title="React server actions"
        primaryFooterAction={{
          content: "Server action",
          onAction: async () => {
            console.log("------ DEBUG: Server Action Start ------");
            console.time("Server Action Duration");
            try {
              // Server action will handle authentication internally
              console.log("Calling doServerAction");
              const response = await doServerAction("");
              console.log("Server Action Response:", response);
              setServerActionResult(response);
              console.log("------ DEBUG: Server Action End ------");
            } catch (err: any) {
              console.error("------ DEBUG: Server Action Error ------");
              console.error("Error details:", err);
              console.error("Error name:", err?.name || "Unknown");
              console.error(
                "Error message:",
                err?.message || "No message available",
              );
              console.error(
                "Error stack:",
                err?.stack || "No stack trace available",
              );
              console.error("------ DEBUG: Server Action Error End ------");
            } finally {
              console.timeEnd("Server Action Duration");
            }
          },
        }}
      >
        <Text as="p" variant="bodyMd">
          Call a server action from within your app. The request is verified
          using session tokens.
        </Text>
        {serverActionResult && serverActionResult.status === "success" && (
          <Text as="h1" variant="headingSm">
            Server action was successful.
          </Text>
        )}
        {serverActionResult && serverActionResult.status === "error" && (
          <Text as="h1" variant="headingSm">
            Server action failed.
          </Text>
        )}
      </Card>

      <Card sectioned title="Use Tanstack Query to query Shopify GraphQL">
        <Text as="p" variant="bodyMd">
          Use Tanstack Query to query Shopify&apos;s GraphQL API directly from
          the client.
        </Text>
        {graphqlLoading && <p>Loading...</p>}
        {graphqlData && <p>{graphqlData.shop.name}</p>}
        {graphqlError && <p>{graphqlError.message}</p>}
      </Card>

      <Card sectioned title="Shopify App Bridge">
        <Text as="p" variant="bodyMd">
          Use the direct graphql api provided by Shopify App Bridge. This
          automatically uses an authenticated graphql route, no need to add
          tokens.
        </Text>
        <div className="space-y-4">
          <Button
            onClick={async () => {
              console.log("------ DEBUG: GraphQL API Request Start ------");
              try {
                console.log("Making request to: /api/graphql");
                console.time("GraphQL Request Duration");

                const query = /* GraphQL */ `
                  query {
                    shop {
                      name
                    }
                  }
                `;
                console.log("Query:", query);

                const res = await fetch("/api/graphql", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ query }),
                });

                console.log("Response Status:", res.status);

                // Convert headers to a plain object safely
                const headers: Record<string, string> = {};
                res.headers.forEach((value, key) => {
                  headers[key] = value;
                });
                console.log("Response Headers:", headers);

                const responseData = await res.json();
                console.log("GraphQL Response Data:", responseData);

                if (responseData.errors) {
                  console.error("GraphQL Errors:", responseData.errors);
                }

                console.timeEnd("GraphQL Request Duration");
                console.log("------ DEBUG: GraphQL API Request End ------");
              } catch (error: any) {
                console.error("------ DEBUG: GraphQL API Request Error ------");
                console.error("Error details:", error);
                console.error("Error name:", error?.name || "Unknown");
                console.error(
                  "Error message:",
                  error?.message || "No message available",
                );
                console.error(
                  "Error stack:",
                  error?.stack || "No stack trace available",
                );
                console.timeEnd("GraphQL Request Duration");
                console.error(
                  "------ DEBUG: GraphQL API Request Error End ------",
                );
              }
            }}
          >
            GraphQL Query with Debug Logs
          </Button>
          <Text as="p" variant="bodySm" tone="subdued">
            Check the browser console (F12 &gt; Console tab) to see detailed
            debug logs
          </Text>
        </div>
      </Card>

      <Card sectioned title="Shopify App Bridge Navigation">
        <Text as="p" variant="bodyMd">
          Use Shopify App Bridge to navigate within the embedded app context.
          This preserves the embedded iframe and maintains proper navigation.
        </Text>
        <div className="space-y-4">
          <Button
            onClick={() => {
              const host = searchParams.get("host");
              const shop = searchParams.get("shop");
              const url = `/new?host=${host}&shop=${shop}`;

              // Use safer navigation method that works in embedded context
              // This preserves the app context better than direct window.location
              try {
                // Use pushState to change URL and then manually navigate
                window.history.pushState({}, "", url);
                window.location.href = url;
              } catch (error) {
                // Fallback to direct navigation
                window.location.href = url;
              }
            }}
          >
            New page using improved navigation
          </Button>
          <Button
            onClick={() => {
              const host = searchParams.get("host");
              const shop = searchParams.get("shop");
              window.location.href = `/new?host=${host}&shop=${shop}`;
            }}
          >
            New page using direct navigation (breaks embedded context)
          </Button>
          <Text as="p" variant="bodySm" tone="subdued">
            Compare the two navigation methods above. The App Bridge navigation
            maintains the embedded context, while direct navigation breaks out
            of it.
          </Text>
        </div>
      </Card>
    </Page>
  );
}
