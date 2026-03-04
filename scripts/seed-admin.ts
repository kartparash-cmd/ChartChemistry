import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const updated = await prisma.user.updateMany({
    where: { email: "kart.parash@gmail.com" },
    data: { role: "ADMIN", plan: "PREMIUM" },
  });
  console.log("Updated", updated.count, "user(s) to ADMIN");

  await prisma.$disconnect();
  await pool.end();
}

main();
