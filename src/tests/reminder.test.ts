import {
  createReminder,
  addRemindersForTenant,
  addRemindersForEvents,
} from "../services/reminderService";

jest.useFakeTimers();

// --------------------------------------------
// Tests for the createReminder function
// --------------------------------------------
describe("Reminder creation logic based on event dates", () => {
  it("should return an error if specificDate is not provided", () => {
    const result = createReminder("Reminder without date");

    expect(result).toBe("Error: Please provide 'specificDate'.");
  });

  it('should create a reminder for a future event and mark as "Do not send"', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const reminderMessage = createReminder("End of lease for tenant@example.com", futureDate);

    expect(reminderMessage).toContain(
      "📅 Event: End of lease for tenant@example.com - Reminder not needed now (scheduled in 2 days)."
    );
  });

  it("does not create a reminder if the date is in the past", () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = createReminder("Past event", pastDate);
    expect(result).toBe("Error: The event date is in the past or today. No reminder can be created.");
  });

  it("does not create a reminder if the date is today", () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const result = createReminder("Event today", todayDate);

    expect(result).toBe("Error: The event date is in the past or today. No reminder can be created.");
  });

  it("should create a reminder even if the event is in the next year (e.g., 31 Dec for 4 Jan next year)", () => {
    const futureDateNextYear = new Date("2025-12-31T00:00:00");
    futureDateNextYear.setFullYear(2025);  // 31 Dec 2025, event on 4 Jan 2026.

    const reminderMessage = createReminder("New Year's event", futureDateNextYear);

    expect(reminderMessage).toContain(
      "📅 Event: New Year's event - Reminder not needed now (scheduled in 230 days)."
    );
  });

  it("should create a reminder only when the event is exactly 5 days away", () => {
    const dateFiveDaysAway = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const reminderMessage = createReminder("Event in 5 days", dateFiveDaysAway);

    expect(reminderMessage).toContain(
      "🔔 Reminder: Event in 5 days - scheduled in 5 days."
    );
  });

  it("should not create a reminder if the event is more or less than 5 days away", () => {
    const dateMoreThanFiveDaysAway = new Date(
      Date.now() + 6 * 24 * 60 * 60 * 1000,
    );
    const dateLessThanFiveDaysAway = new Date(
      Date.now() + 4 * 24 * 60 * 60 * 1000,
    );

    const result1 = createReminder("Event in 6 days", dateMoreThanFiveDaysAway);
    const result2 = createReminder("Event in 4 days", dateLessThanFiveDaysAway);

    expect(result1).not.toContain("🔔 Reminder");
    expect(result2).not.toContain("🔔 Reminder");
  });
});

// --------------------------------------------
// Helper function to generate a tenant for tests
// --------------------------------------------
function generateTestTenant() {
  const now = new Date();
  const paymentDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const leaseStartDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const leaseEndDate = new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000);

  const eventStartDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const eventEndDate = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
  return {
    email: "test@example.com",
    payment_date: paymentDate.toISOString(),
    lease_start_date: leaseStartDate.toISOString(),
    lease_end_date: leaseEndDate.toISOString(),
    events: [
      {
        name: "Plumbing repair",
        event_start_date: eventStartDate.toISOString(),
        event_end_date: eventEndDate.toISOString(),
      },
    ],
  };
}

// --------------------------------------------
// Test for addRemindersForTenant
// --------------------------------------------
describe("Reminder generation for tenant and tenant events", () => {
  it("should call createReminder twice for a tenant", () => {
    const tenant = generateTestTenant();

    const result = addRemindersForTenant(tenant);

    expect(result).toEqual([
      "🔔 Reminder: Payment reminder for test@example.com - scheduled in 5 days.",
      "📅 Event: Lease end reminder for test@example.com - Reminder not needed now (scheduled in 45 days)."
    ]);
  });

  it("should call createReminder for each event of the tenant", () => {
    const tenant = generateTestTenant();

    const result = addRemindersForEvents(tenant);

    expect(result).toEqual([
      "🔔 Reminder: Event Plumbing repair for test@example.com - scheduled in 5 days."
    ]);
  });
});
