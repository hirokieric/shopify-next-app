import { storeSession } from "@/lib/db/session-storage";
import shopify from "@/lib/shopify/initialize-context";
import { RequestedTokenType, Session } from "@shopify/shopify-api";
import { SessionNotFoundError } from "@/lib/errors/session-errors";
export {
  AppNotInstalledError,
  ExpiredTokenError,
  ScopeMismatchError,
  SessionNotFoundError,
} from "@/lib/errors/session-errors";

export async function verifyRequest(
  req: Request,
  isOnline: boolean,
): Promise<{ shop: string; session: Session }> {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new SessionNotFoundError();
  }

  const sessionToken = authHeader.slice(7).trim();
  if (!sessionToken || sessionToken.split(".").length !== 3) {
    throw new SessionNotFoundError();
  }

  // セッションを保存して毎回トークン交換を避ける
  return handleSessionToken(sessionToken, isOnline, true);
}

/**
 * Do the token exchange from the sessionIdToken that comes from the client
 * This returns a valid session object.
 * Optionally store the session in the database. Sometimes, if you are focused on speed,
 * you don't want to always store the session in the database.
 */
export async function tokenExchange({
  shop,
  sessionToken,
  online,
  store,
}: {
  shop: string;
  sessionToken: string;
  online?: boolean;
  store?: boolean;
}): Promise<Session> {
  const response = await shopify.auth.tokenExchange({
    shop,
    sessionToken,
    requestedTokenType: online
      ? RequestedTokenType.OnlineAccessToken
      : RequestedTokenType.OfflineAccessToken,
  });
  const { session } = response;
  if (store) {
    await storeSession(session);
  }
  return session;
}

/**
 * @description Do all the necessary steps, to validate the session token and refresh it if it needs to.
 * @param sessionToken The session token from the request headers or directly sent by the client
 * @param online
 * @param store Whether to persist the session. Defaults to true.
 * @returns The session object
 */
export async function handleSessionToken(
  sessionToken: string,
  online?: boolean,
  store: boolean = true,
): Promise<{ shop: string; session: Session }> {
  const payload = await shopify.session.decodeSessionToken(sessionToken);
  const shop = payload.dest.replace("https://", "");
  const session = await tokenExchange({ shop, sessionToken, online, store });
  return { shop: session.shop, session };
}
