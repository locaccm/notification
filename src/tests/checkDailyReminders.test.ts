import { checkDailyReminders } from "../services/reminder.service";
import * as dbModule from "../loadDatabase";
import * as emailModule from "../services/reminderEmail.service";

jest.mock("../loadDatabase");
jest.mock("../services/reminderEmail.service");

describe("Daily reminders check and sending process", () => {
  it("should perform all reminder checks and send emails successfully", async () => {
    const tenant = { USEC_MAIL: "test@example.com", leases: [], events: [] };

    (dbModule.loadDatabase as jest.Mock).mockResolvedValue([tenant]);
    jest
      .spyOn(require("../services/reminder.service"), "addRemindersForTenant")
      .mockReturnValue(["tenantReminder"]);
    jest
      .spyOn(require("../services/reminder.service"), "addRemindersForEvents")
      .mockReturnValue(["eventReminder"]);
    (emailModule.sendReminders as jest.Mock).mockResolvedValue(undefined);

    const setTimeoutSpy = jest
      .spyOn(global, "setTimeout")
      .mockImplementation(() => {
        return {} as NodeJS.Timeout;
      });

    await checkDailyReminders();

    expect(dbModule.loadDatabase).toHaveBeenCalled();
    expect(emailModule.sendReminders).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledWith(checkDailyReminders, 86400000);

    setTimeoutSpy.mockRestore();
  });
});
