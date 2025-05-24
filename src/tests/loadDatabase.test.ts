import { prisma } from "../lib/prisma.lib";
import { loadDatabase } from "../loadDatabase";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Tenant data retrieval from database", () => {
  it("should fetch tenants from the database", async () => {
    const tenants = await loadDatabase();

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThan(0);

    const tenant = tenants[0];
    expect(tenant).toHaveProperty("USEC_MAIL");
    expect(tenant).toHaveProperty("leases");
    expect(tenant).toHaveProperty("events");
  });
});
