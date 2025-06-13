import {
  createReminder,
  addRemindersForTenant,
  addRemindersForEvents,
} from "../services/reminder.service";
import { Tenant } from "../interfaces/tenant.interface";

jest.useFakeTimers();

describe("Validating reminder generation based on event timing", () => {
  it("should return null if specificDate is undefined", () => {
    expect(createReminder("event")).toBeNull();
  });

  it("should return null if specificDate is in the past", () => {
    const pastDate = new Date(Date.now() - 1000);
    expect(createReminder("event", pastDate)).toBeNull();
  });

  it("should return null if daysRemaining is greater than 5", () => {
    const futureDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    expect(createReminder("event", futureDate)).toBeNull();
  });

  it("should return reminder string if daysRemaining is 5 or less", () => {
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const result = createReminder("Test Event", futureDate);
    expect(result).toMatch(/🔔 Reminder: Test Event - scheduled in \d+ days./);
  });
});

// Helper function to generate a valid Tenant
function createTenantWithDates(overrides?: Partial<Tenant>): Tenant {
  const now = new Date();
  return {
    USEN_ID: 1,
    USEC_FNAME: "Test",
    USEC_LNAME: "User",
    USEC_MAIL: "test@example.com",
    leases: [
      {
        LEAD_START: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        LEAD_PAYMENT: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
        LEAD_END: new Date(now.getTime() + 51 * 24 * 60 * 60 * 1000),
      },
    ],
    events: [
      {
        EVEC_LIB: "Maintenance",
        EVED_START: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
        EVED_END: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      },
    ],
    ...overrides,
  };
}

describe("Generating lease-related reminders within 5 days", () => {
  it("should return reminders for payment and lease end within 5 days", () => {
    const now = new Date();
    const tenant = createTenantWithDates({
      leases: [
        {
          LEAD_START: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          LEAD_PAYMENT: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          LEAD_END: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const reminders = addRemindersForTenant(tenant);

    expect(reminders).toContainEqual(
      expect.stringContaining(`Payment reminder for ${tenant.USEC_MAIL}`),
    );
    expect(reminders).toContainEqual(
      expect.stringContaining(`Lease end reminder for ${tenant.USEC_MAIL}`),
    );
  });
});

describe("Generating event-related reminders within 5 days", () => {
  it("should return reminders for events within 5 days", () => {
    const now = new Date();
    const tenant = createTenantWithDates({
      events: [
        {
          EVEC_LIB: "Inspection",
          EVED_START: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          EVED_END: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const reminders = addRemindersForEvents(tenant);

    expect(reminders.length).toBeGreaterThan(0);
    expect(reminders[0]).toContain(`Event Inspection for ${tenant.USEC_MAIL}`);
  });
});
