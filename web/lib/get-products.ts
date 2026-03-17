// Example of how to use the generated types from the backend

import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "./db/session-storage";
import { AppNotInstalledError } from "@/lib/errors/session-errors";
import {
  GetProductsQuery,
  GetProductsQueryVariables,
} from "@/types/admin.generated";

const GET_PRODUCTS = /* GraphQL */ `
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        tags
      }
    }
  }
`;

export const getProducts = async (shop: string) => {
  const sessions = await findSessionsByShop(shop);

  // 有効なオフラインセッション（アクセストークンあり＋期限内）を優先選択
  const validSession = sessions.find(
    (s) =>
      s.accessToken && (!s.expires || s.expires > new Date()) && !s.isOnline,
  );

  if (!validSession) {
    throw new AppNotInstalledError();
  }

  const client = new shopify.clients.Graphql({
    session: validSession,
  });
  const { data, errors } = await client.request<GetProductsQuery>(
    GET_PRODUCTS,
    { variables: { first: 10 } as GetProductsQueryVariables },
  );
  if (errors) {
    throw new Error(errors.message);
  }
  if (!data) {
    throw new Error("No data returned from Shopify");
  }
  return data.products.nodes;
};
