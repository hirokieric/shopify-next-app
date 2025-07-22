import { NextRequest, NextResponse } from "next/server";
import shopify from "@/lib/shopify/initialize-context";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

/**
 * API route that proxies GraphQL requests to Shopify's Admin API
 */
export async function POST(request: NextRequest) {
  console.log("------ DEBUG: GraphQL API Route Start ------");
  console.time("GraphQL API Route Duration");

  try {
    console.log("Received GraphQL request");

    // Log headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Request Headers:", headers);

    const session = await getSessionFromRequest(request);

    if (!session) {
      console.error("No active Shopify session found");
      console.timeEnd("GraphQL API Route Duration");
      console.log("------ DEBUG: GraphQL API Route End (401) ------");
      return NextResponse.json(
        { error: "Unauthorized - No active Shopify session" },
        { status: 401 },
      );
    }

    console.log("Session found:", { shop: session.shop });

    // Get the GraphQL query data from the request
    const body = await request.json();
    console.log("Request Body:", body);

    const { query, variables } = body;

    if (!query) {
      console.error("Missing GraphQL query");
      console.timeEnd("GraphQL API Route Duration");
      console.log("------ DEBUG: GraphQL API Route End (400) ------");
      return NextResponse.json(
        { error: "Bad Request - Missing GraphQL query" },
        { status: 400 },
      );
    }

    try {
      console.log("Executing GraphQL query against Shopify Admin API");

      // Create a GraphQL client using the session
      const client = new shopify.clients.Graphql({
        session,
      });

      // Forward the request to Shopify's Admin API
      const response = await client.query({
        data: {
          query,
          variables: variables || {},
        },
      });

      console.log("GraphQL response received:", response.body);
      console.timeEnd("GraphQL API Route Duration");
      console.log("------ DEBUG: GraphQL API Route End (Success) ------");

      // Return the response from Shopify
      return NextResponse.json(response);
    } catch (graphqlError) {
      console.error("GraphQL execution error:", graphqlError);
      console.timeEnd("GraphQL API Route Duration");
      console.log("------ DEBUG: GraphQL API Route End (GraphQL Error) ------");

      return NextResponse.json(
        {
          error: "GraphQL Error",
          message: String(graphqlError),
          details: graphqlError,
        },
        { status: 422 },
      );
    }
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to get the Shopify session from the request
 */
async function getSessionFromRequest(request: NextRequest) {
  try {
    // For embedded apps, session token is typically in the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        // Validate and decode the session token
        const payload = await shopify.session.decodeSessionToken(token);
        const shop = payload.dest.replace(/^https?:\/\//, "");

        // Create a session object from the decoded payload
        return shopify.session.customAppSession(shop);
      } catch (e) {
        console.error("Invalid session token:", e);
      }
    }

    // For non-embedded requests, check cookies for session
    const shopCookie = request.cookies.get("shopify_shop_domain")?.value;
    if (shopCookie) {
      return shopify.session.customAppSession(shopCookie);
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
