import { prisma } from "@/lib/server/db";

async function main() {
  const service = await prisma.service.findFirst({ include: { packages: true }});
  console.log(service);
}

main().finally(() => process.exit());
