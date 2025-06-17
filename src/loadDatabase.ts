import { Tenant } from "./interfaces/tenant.interface";
import { prisma } from "./lib/prisma.lib";

export function nonNullString(value: string | null): string {
  return value ?? "";
}

export function nonNullDate(value: Date | null): Date {
  return value ?? new Date(0);
}

export async function loadDatabase() {
  try {
    const rawTenants = await prisma.user.findMany({
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

    const tenants: Tenant[] = rawTenants.map((t) => ({
      USEN_ID: t.USEN_ID,
      USEC_FNAME: nonNullString(t.USEC_FNAME),
      USEC_LNAME: nonNullString(t.USEC_LNAME),
      USEC_MAIL: nonNullString(t.USEC_MAIL),
      leases: t.leases.map((l) => ({
        LEAD_START: nonNullDate(l.LEAD_START),
        LEAD_END: nonNullDate(l.LEAD_END),
        LEAD_PAYMENT: nonNullDate(l.LEAD_PAYMENT),
      })),
      events: t.events.map((e) => ({
        EVEC_LIB: nonNullString(e.EVEC_LIB),
        EVED_START: nonNullDate(e.EVED_START),
        EVED_END: nonNullDate(e.EVED_END),
      })),
    }));

    return tenants;
  } catch (error) {
    console.error("Error fetching tenants from DB:", error);
    return [];
  }
}
