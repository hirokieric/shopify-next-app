import { Session as ShopifySession } from "@shopify/shopify-api";
import type {
  Session as DbSession,
  OnlineAccessInfo as DbOnlineAccessInfo,
  AssociatedUser as DbAssociatedUser,
} from "@/generated/prisma/client";
import { SessionNotFoundError } from "@/lib/errors/session-errors";
import { encryptToken, decryptToken } from "@/lib/crypto/token-encryption";
import prisma from "./prisma-connect";

function getApiKey(): string {
  const key = process.env.SHOPIFY_API_KEY;
  if (!key) throw new Error("SHOPIFY_API_KEY is not set");
  return key;
}

/**
 * Stores the session in the database.
 * Access tokens are encrypted at rest using AES-256-GCM.
 */
export async function storeSession(session: ShopifySession) {
  const encryptedToken = session.accessToken
    ? encryptToken(session.accessToken)
    : null;

  await prisma.session.upsert({
    where: { id: session.id },
    update: {
      shop: session.shop,
      accessToken: encryptedToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey: getApiKey(),
    },
    create: {
      id: session.id,
      shop: session.shop,
      accessToken: encryptedToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey: getApiKey(),
    },
  });

  if (session.onlineAccessInfo) {
    const onlineAccessInfo = await prisma.onlineAccessInfo.upsert({
      where: { sessionId: session.id },
      update: {
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
      create: {
        sessionId: session.id,
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
    });

    const { associated_user } = session.onlineAccessInfo;
    await prisma.associatedUser.upsert({
      where: { onlineAccessInfoId: onlineAccessInfo.id },
      update: {
        firstName: associated_user.first_name,
        lastName: associated_user.last_name,
        email: associated_user.email,
        emailVerified: associated_user.email_verified,
        accountOwner: associated_user.account_owner,
        locale: associated_user.locale,
        collaborator: associated_user.collaborator,
        userId: associated_user.id,
      },
      create: {
        onlineAccessInfoId: onlineAccessInfo.id,
        firstName: associated_user.first_name,
        lastName: associated_user.last_name,
        email: associated_user.email,
        emailVerified: associated_user.email_verified,
        accountOwner: associated_user.account_owner,
        locale: associated_user.locale,
        collaborator: associated_user.collaborator,
        userId: associated_user.id,
      },
    });
  }
}

export async function loadSession(id: string) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      onlineAccessInfo: {
        include: {
          associatedUser: true,
        },
      },
    },
  });

  if (session) {
    return generateShopifySessionFromDB(session);
  } else {
    throw new SessionNotFoundError();
  }
}

export async function deleteSession(id: string) {
  // deleteMany never throws on 0 rows (safe for concurrent uninstall webhooks)
  await prisma.session.deleteMany({
    where: { id },
  });
}

export async function deleteSessions(ids: string[]) {
  await prisma.session.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function cleanUpSession(shop: string, accessToken: string) {
  const encryptedToken = encryptToken(accessToken);
  await prisma.session.deleteMany({
    where: { shop, accessToken: encryptedToken, apiKey: getApiKey() },
  });
}

export async function findSessionsByShop(shop: string) {
  const sessions = await prisma.session.findMany({
    where: { shop, apiKey: getApiKey() },
    include: {
      onlineAccessInfo: {
        include: {
          associatedUser: true,
        },
      },
    },
  });

  return sessions.map((session) => generateShopifySessionFromDB(session));
}

type DbSessionWithRelations = DbSession & {
  onlineAccessInfo?:
    | (DbOnlineAccessInfo & {
        associatedUser?: DbAssociatedUser | null;
      })
    | null;
};

function generateShopifySessionFromDB(
  session: DbSessionWithRelations,
): ShopifySession {
  const decryptedToken = session.accessToken
    ? decryptToken(session.accessToken)
    : undefined;

  const shopifySession = new ShopifySession({
    id: session.id,
    shop: session.shop,
    accessToken: decryptedToken,
    scope: session.scope || undefined,
    state: session.state,
    isOnline: session.isOnline,
    expires: session.expires || undefined,
  });

  // onlineAccessInfo を復元
  if (session.onlineAccessInfo) {
    const oai = session.onlineAccessInfo;
    shopifySession.onlineAccessInfo = {
      expires_in: oai.expiresIn,
      associated_user_scope: oai.associatedUserScope,
      associated_user: oai.associatedUser
        ? {
            id: Number(oai.associatedUser.userId),
            first_name: oai.associatedUser.firstName,
            last_name: oai.associatedUser.lastName,
            email: oai.associatedUser.email,
            email_verified: oai.associatedUser.emailVerified,
            account_owner: oai.associatedUser.accountOwner,
            locale: oai.associatedUser.locale,
            collaborator: oai.associatedUser.collaborator,
          }
        : {
            id: 0,
            first_name: "",
            last_name: "",
            email: "",
            email_verified: false,
            account_owner: false,
            locale: "",
            collaborator: false,
          },
    };
  }

  return shopifySession;
}
