import * as reminderService from "../services/reminderService";
import * as tenantModel from "../models/tenantModel";

jest.useFakeTimers();

// --------------------------------------------
// Test for checkDailyReminders
// --------------------------------------------
describe("Daily reminder verification scheduling", () => {
  it("schedules the call every 24 hours", () => {
    const mockTenant = {
      email: "mock@example.com",
      payment_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      lease_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
      lease_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          name: "Inspection",
          event_start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          event_end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };    

    jest.spyOn(tenantModel, "loadDatabase").mockReturnValue([mockTenant]);

    const spy = jest.spyOn(reminderService, "checkDailyReminders");

    reminderService.checkDailyReminders();

    jest.advanceTimersByTime(86400000);

    expect(spy).toHaveBeenCalledTimes(1); 
  });
});

