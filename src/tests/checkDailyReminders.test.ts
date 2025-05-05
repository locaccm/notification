import { checkDailyReminders } from "../services/reminderService";

jest.useFakeTimers();

// --------------------------------------------
// Test for checkDailyReminders
// --------------------------------------------
describe("Daily reminder verification scheduling", () => {
  it("schedules the call every 24 hours", () => {
    checkDailyReminders();

    jest.advanceTimersByTime(86400000);
  });
});
