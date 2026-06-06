import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating existing manifestations...");
  const manifestations = await prisma.manifestation.findMany();

  let updatedCount = 0;
  for (const manifestation of manifestations) {
    let status = "In process";
    if (manifestation.state) {
      const stateStr = manifestation.state.toLowerCase().trim();
      if (stateStr === 'manifestation has fully arrived' || stateStr === 'manifestation has fully arrived successfully') {
        status = "Done";
      }
    }

    await prisma.manifestation.update({
      where: { id: manifestation.id },
      data: { status }
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} manifestations.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
