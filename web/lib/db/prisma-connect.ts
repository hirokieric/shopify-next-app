import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma Client");
  }

  // サーバーレス環境向けコネクションプール設定
  const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || "5", 10);
  const adapter = new PrismaPg({
    connectionString,
    pool: {
      max: poolSize,
    },
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
