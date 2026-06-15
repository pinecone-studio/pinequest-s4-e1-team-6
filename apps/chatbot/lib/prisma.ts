// import { PrismaNeon } from "@prisma/adapter-neon";
// import { Pool } from "@neondatabase/serverless";
// import { PrismaClient } from "@prisma/client";
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });

// const adapter = new PrismaNeon(pool as any);

// export const prisma = new PrismaClient({
//   adapter,
// });
// import "dotenv/config";
// import { PrismaNeon } from "@prisma/adapter-neon";
// import { PrismaClient } from "@/generated/prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error("DATABASE_URL is not set");
// }

// const adapter = new PrismaNeon({
//   connectionString,
// });

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log: ["error", "warn"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

function normalizeSslMode(url: string) {
  const parsedUrl = new URL(url);
  const sslMode = parsedUrl.searchParams.get("sslmode");
  const modesWithCurrentVerifyFullBehavior = ["prefer", "require", "verify-ca"];

  if (sslMode && modesWithCurrentVerifyFullBehavior.includes(sslMode)) {
    parsedUrl.searchParams.set("sslmode", "verify-full");
  }

  return parsedUrl.toString();
}

const pool = new Pool({
  connectionString: normalizeSslMode(connectionString),
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export default prisma;
