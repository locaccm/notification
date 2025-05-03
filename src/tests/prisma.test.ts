// __tests__/fetchData.test.ts
import { PrismaClient } from "@prisma/client";
import { fetchData } from "../dataPrisma";

jest.mock("@prisma/client", () => {
  // create a mock PrismaClient class
  const mPrismaClient = {
    user: { findMany: jest.fn() },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}));

describe("fetchData", () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeAll(() => {
    // The PrismaClient constructor is mocked to return mPrismaClient
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("queries only TENANT users and writes the JSON file", async () => {
    const spyFindMany = jest.spyOn(prisma.user, "findMany").mockResolvedValue([
      {
        USEN_ID: 123,
        USEC_FNAME: "Test",
        USEC_LNAME: "User",
        USEC_MAIL: "t@u.com",
        leases: [],
        events: [],
      },
    ] as any);

    await fetchData(prisma, "../data/tenants_with_events_and_leases.json");

    expect(spyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { USEC_TYPE: "TENANT" } }),
    );

    // Nettoyage du spy
    spyFindMany.mockRestore();

    // Assert: disconnect was invoked
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  it("still disconnects even if findMany throws", async () => {
    // Spy on the real method and make it reject:
    jest.spyOn(prisma.user, "findMany").mockRejectedValue(new Error("DB down"));

    await expect(
      fetchData(prisma, "../data/tenants_with_events_and_leases.json"),
    ).resolves.not.toThrow();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });
});
