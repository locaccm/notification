import { prisma } from "../lib/prisma.lib";
import { loadDatabase } from "../loadDatabase";

// Import helpers directement si possible, sinon dupliquer ici pour test
import { nonNullString, nonNullDate } from "../loadDatabase";

const isCI = process.env.CI === "true";

describe("Helper functions", () => {
  test("nonNullString returns empty string when null", () => {
    expect(nonNullString(null)).toBe("");
  });
  test("nonNullString returns string unchanged when not null", () => {
    expect(nonNullString("hello")).toBe("hello");
  });

  test("nonNullDate returns epoch date when null", () => {
    expect(nonNullDate(null)).toEqual(new Date(0));
  });
  test("nonNullDate returns date unchanged when not null", () => {
    const now = new Date();
    expect(nonNullDate(now)).toBe(now);
  });
});

if (!isCI) {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Tenant data retrieval from database", () => {
    it("should fetch tenants array with proper properties", async () => {
      const tenants = await loadDatabase();

      expect(Array.isArray(tenants)).toBe(true);
      expect(tenants.length).toBeGreaterThan(0);

      const tenant = tenants[0];
      expect(typeof tenant.USEC_MAIL).toBe("string");
      expect(typeof tenant.USEC_FNAME).toBe("string");
      expect(typeof tenant.USEC_LNAME).toBe("string");
      expect(Array.isArray(tenant.leases)).toBe(true);
      expect(Array.isArray(tenant.events)).toBe(true);
    });

    it("should replace null strings with empty strings", async () => {
      const tenants = await loadDatabase();
      tenants.forEach((tenant) => {
        expect(tenant.USEC_MAIL).not.toBeNull();
        expect(tenant.USEC_FNAME).not.toBeNull();
        expect(tenant.USEC_LNAME).not.toBeNull();
        expect(tenant.USEC_MAIL).toEqual(expect.any(String));
        expect(tenant.USEC_FNAME).toEqual(expect.any(String));
        expect(tenant.USEC_LNAME).toEqual(expect.any(String));
      });
    });

    it("should replace null dates in leases and events with new Date(0)", async () => {
      const tenants = await loadDatabase();
      tenants.forEach((tenant) => {
        tenant.leases.forEach((lease) => {
          expect(lease.LEAD_START).toBeInstanceOf(Date);
          expect(lease.LEAD_END).toBeInstanceOf(Date);
          expect(lease.LEAD_PAYMENT).toBeInstanceOf(Date);
        });
        tenant.events.forEach((event) => {
          expect(event.EVED_START).toBeInstanceOf(Date);
          expect(event.EVED_END).toBeInstanceOf(Date);
        });
      });
    });
  });
} else {
  describe.skip("Tenant data retrieval from database (skipped in CI)", () => {
    it("CI environment detected – test skipped", () => {
      // Intentionally empty
    });
  });
}
