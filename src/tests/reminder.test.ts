import {
  createReminder,
  addRemindersForTenant,
  addRemindersForEvents,
} from "../services/reminderService";

jest.useFakeTimers();

let spyLog: jest.SpyInstance;
let spyError: jest.SpyInstance;

beforeEach(() => {
  spyLog = jest.spyOn(console, "log").mockImplementation(() => {});
  spyError = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllTimers();
  spyLog.mockRestore();
});

// --------------------------------------------
// Tests for the createReminder function
// --------------------------------------------
describe("Reminder creation logic based on event dates", () => {
  it("should display an error if specificDate is not provided", () => {
    createReminder("Reminder without date");

    expect(spyError).toHaveBeenCalledWith(
      "Error: Please provide 'specificDate'.",
    );
  });

  it('should create a reminder for a future event and mark as "Do not send"', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    createReminder("End of lease for tenant@example.com", futureDate);

    jest.runAllTimers();

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "📅 Event: End of lease for tenant@example.com - Reminder scheduled in 2 days. ➤ Do not send",
      ),
    );
  });

  it("does not create a reminder if the date is in the past", () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    createReminder("Past event", pastDate);
    expect(spyError).toHaveBeenCalledWith(
      "Error: The event date is in the past or today. No reminder can be created.",
    );
  });

  it("does not create a reminder if the date is today", () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    createReminder("Event today", todayDate);

    expect(spyError).toHaveBeenCalledWith(
      "Error: The event date is in the past or today. No reminder can be created.",
    );
  });

  it("does not create a reminder if the month or year does not match", () => {
    const futureDateDifferentMonth = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000,
    );
    futureDateDifferentMonth.setMonth(futureDateDifferentMonth.getMonth() + 1);

    createReminder("Event in a different month", futureDateDifferentMonth);

    jest.runAllTimers();

    expect(spyError).toHaveBeenCalledWith(
      `Error: The event date does not match the current month or year. Reminder not created.`,
    );
  });

  it("should create a reminder only when the event is exactly 5 days away", () => {
    const dateFiveDaysAway = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    createReminder("Event in 5 days", dateFiveDaysAway);

    jest.runAllTimers();

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "🔔 Reminder: Event in 5 days - scheduled in 5 days.",
      ),
    );
  });

  it("should not create a reminder if the event is more or less than 5 days away", () => {
    const dateMoreThanFiveDaysAway = new Date(
      Date.now() + 6 * 24 * 60 * 60 * 1000,
    );
    const dateLessThanFiveDaysAway = new Date(
      Date.now() + 4 * 24 * 60 * 60 * 1000,
    );

    createReminder("Event in 6 days", dateMoreThanFiveDaysAway);
    createReminder("Event in 4 days", dateLessThanFiveDaysAway);

    jest.runAllTimers();

    expect(spyLog).not.toHaveBeenCalledWith(
      expect.stringContaining("🔔 Reminder"),
    );
  });
});

// --------------------------------------------
// Helper function to generate a tenant for tests
// Dates are chosen such that the reminders (calculated in createReminder)
// will be in the future for the payment reminder (paymentDate - 5 days)
// and for the end of lease (leaseEndDate - 1 day).
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

    addRemindersForTenant(tenant);

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        `📅 Event: Payment reminder for ${tenant.email} - Reminder scheduled in 5 days. ➤ To send`,
      ),
    );
    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        `🔔 Reminder: Payment reminder for ${tenant.email} - scheduled in 5 days.`,
      ),
    );
    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        `📅 Event: Event ${tenant.events[0].name} for ${tenant.email} - Reminder scheduled in 5 days. ➤ To send`,
      ),
    );
  });

  it("should call createReminder for each event of the tenant", () => {
    const tenant = generateTestTenant();

    addRemindersForEvents(tenant);

    expect(spyLog).toHaveBeenCalledTimes(2);

    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        `📅 Event: Event Plumbing repair for ${tenant.email} - Reminder scheduled in 5 days. ➤ To send`,
      ),
    );
    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining(
        `🔔 Reminder: Event Plumbing repair for ${tenant.email} - scheduled in 5 days.`,
      ),
    );
  });
});
