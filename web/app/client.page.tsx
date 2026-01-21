"use client";

import { graphql } from "@/lib/gql";
import { useAppBridge } from "@shopify/app-bridge-react";
import Link from "next/link";
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

  const app = useAppBridge();

  const handleGetAPIRequest = async () => {
    try {
      // global fetch has tokens automatically added
      // https://shopify.dev/docs/api/app-bridge-library/apis/resource-fetching
      const response = await fetch("/api/hello");
      const result = (await response.json()) as { data: Data };
      setData(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <s-page title="Home">
      <div className="flex items-center justify-center gap-1 p-2 bg-slate-800 text-white rounded-lg mb-4 shadow-lg">
        <p className="font-medium text-[1rem]">
          We can also use tailwindcss in this project!
        </p>
      </div>

      <div className="grid gap-4">
        <s-card>
          <div className="p-4 grid gap-3">
            <s-text as="h2" variant="headingMd">
              NextJs API Routes
            </s-text>
            <s-text>
              Call a NextJS api route from within your app. The request is
              verified using session tokens.
            </s-text>
            {data && (
              <s-text as="p" variant="bodyMd">
                {data.name} is {data.height} tall.
              </s-text>
            )}
            <div className="flex justify-end">
              <s-button onClick={handleGetAPIRequest}>Call API</s-button>
            </div>
          </div>
        </s-card>

        <s-card>
          <div className="p-4 grid gap-3">
            <s-text as="h2" variant="headingMd">
              React server actions
            </s-text>
            <s-text>
              Call a server action from within your app. The request is verified
              using session tokens.
            </s-text>
            {serverActionResult?.status === "success" && (
              <s-text as="p">Server action was successful.</s-text>
            )}
            {serverActionResult?.status === "error" && (
              <s-text as="p">Server action failed.</s-text>
            )}
            <div className="flex justify-end">
              <s-button
                onClick={async () => {
                  const token = await app.idToken();
                  const response = await doServerAction(token);
                  setServerActionResult(response);
                }}
              >
                Server action
              </s-button>
            </div>
          </div>
        </s-card>

        <s-card>
          <div className="p-4 grid gap-3">
            <s-text as="h2" variant="headingMd">
              Use Tanstack Query to query Shopify GraphQL
            </s-text>
            <s-text>
              Use Tanstack Query to query Shopify&apos;s GraphQL API directly
              from the client.
            </s-text>
            {graphqlLoading && <p>Loading...</p>}
            {graphqlData && <p>{graphqlData.shop.name}</p>}
            {graphqlError && <p>{graphqlError.message}</p>}
          </div>
        </s-card>

        <s-card>
          <div className="p-4 grid gap-3">
            <s-text as="h2" variant="headingMd">
              Shopify App Bridge
            </s-text>
            <s-text>
              Use the direct graphql api provided by Shopify App Bridge. This
              automatically uses an authenticated graphql route, no need to add
              tokens.
            </s-text>
            <div className="flex justify-end">
              <s-button
                onClick={async () => {
                  const res = await fetch("shopify:admin/api/graphql.json", {
                    method: "POST",
                    body: JSON.stringify({
                      query: /* GraphQL */ `
                        query {
                          shop {
                            name
                          }
                        }
                      `,
                    }),
                  });
                  const { data: adminData } = await res.json();
                  console.info("graphql response", adminData);
                }}
              >
                GraphQL Query - Check the console for the response
              </s-button>
            </div>
          </div>
        </s-card>

        <s-card>
          <div className="p-4 grid gap-3">
            <s-text as="h2" variant="headingMd">
              Shopify App Bridge
            </s-text>
            <s-text>
              Use Shopify App Bridge to interact with the Shopify admin. The
              request uses offline session tokens. This uses Shopify App Bridge
              v4.
            </s-text>
            <Link href="/new">New page using next/link</Link>
          </div>
        </s-card>
      </div>
    </s-page>
  );
}
