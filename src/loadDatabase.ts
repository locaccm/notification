import { Tenant } from "./interfaces/tenant.interface";
import { prisma } from "./lib/prisma.lib";

export async function loadDatabase() {
  try {
    const tenants: Tenant[] = await prisma.user.findMany({
      where: { USEC_TYPE: "TENANT" },
      select: {
        USEN_ID: true,
        USEC_FNAME: true,
        USEC_LNAME: true,
        USEC_MAIL: true,
        leases: {
          select: {
            LEAD_START: true,
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
    return tenants;
  } catch (error) {
    console.error("Error fetching tenants from DB:", error);
    return [];
  }
}
