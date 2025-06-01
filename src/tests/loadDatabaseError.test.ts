import { prisma } from "../lib/prisma.lib";
import { loadDatabase } from "../loadDatabase";

jest.mock("../lib/prisma.lib", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

describe("Tenant data retrieval from database - error handling", () => {
  it("should return [] if prisma.user.findMany throws an error", async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValue(
      new Error("DB failure"),
    );

    const tenants = await loadDatabase();

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants).toEqual([]);
  });
});
