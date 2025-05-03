import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

export async function fetchData(
  prisma: PrismaClient,
  outputPath: string
) {
  try {
    const tenants = await prisma.user.findMany({
      where: {
        USEC_TYPE: 'TENANT',  // Only fetch tenant users
      },
      select: {
        USEN_ID: true,
        USEC_FNAME: true,
        USEC_LNAME: true,
        USEC_MAIL: true,
        leases: {
          select: {
            LEAD_END: true,
            LEAD_PAYMENT: true,
          },
        },
        events: {
          select: {
            EVEC_LIB: true,
            EVED_START: true,
            EVED_END: true,
          },
        },
      },
    });

    // Write the retrieved data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(tenants, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    await prisma.$disconnect();  // Always close the DB connection
  }
}
