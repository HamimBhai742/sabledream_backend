import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all reminders to set enabled = true...");
  const result = await prisma.reminder.updateMany({
    data: {
      enabled: true
    }
  });

  console.log(`Successfully updated ${result.count} reminders.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
