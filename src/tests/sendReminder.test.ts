import { sendReminders } from "../services/reminderEmail.service";
import { sendEmailService } from "../services/mailer.service";
import { generateEmailTemplate } from "../services/email.service";
import { Tenant } from "../interfaces/tenant.interface";

jest.mock("../services/mailer.service");
jest.mock("../services/email.service");

describe("Sends formatted email reminders to the tenant for each provided reminder message", () => {
  const tenant: Tenant = {
    USEN_ID: 1,
    USEC_FNAME: "Jean",
    USEC_LNAME: "Dupont",
    USEC_MAIL: "jean.dupont@example.com",
    leases: [],
    events: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call generateEmailTemplate and sendEmailService with correct arguments for each reminder", async () => {
    const reminders = ["Reminder 1", "Reminder 2"];

    (generateEmailTemplate as jest.Mock).mockImplementation(
      ({ customContent }) => {
        return `<div>${customContent}</div>`;
      },
    );

    await sendReminders(reminders, tenant);

    reminders.forEach((reminder, index) => {
      expect(generateEmailTemplate).toHaveBeenNthCalledWith(index + 1, {
        recipientName: `${tenant.USEC_FNAME} ${tenant.USEC_LNAME}`,
        customContent: reminder,
      });
    });

    reminders.forEach((reminder, index) => {
      expect(sendEmailService).toHaveBeenNthCalledWith(
        index + 1,
        tenant.USEC_MAIL,
        "⏰ Automatic Reminder",
        undefined,
        `<div>${reminder}</div>`,
      );
    });

    expect(generateEmailTemplate).toHaveBeenCalledTimes(reminders.length);
    expect(sendEmailService).toHaveBeenCalledTimes(reminders.length);
  });

  it("should do nothing if reminders array is empty", async () => {
    await sendReminders([], tenant);
    expect(generateEmailTemplate).not.toHaveBeenCalled();
    expect(sendEmailService).not.toHaveBeenCalled();
  });

  it("should skip sending reminders and warn if tenant email is null or empty", async () => {
    const tenantWithNoEmail: Tenant = {
      ...tenant,
      USEC_MAIL: "",
    };
    const reminders = ["Reminder 1", "Reminder 2"];

    const warnMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    await sendReminders(reminders, tenantWithNoEmail);

    expect(generateEmailTemplate).not.toHaveBeenCalled();
    expect(sendEmailService).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledWith(
      `Skipping reminders for tenant ${tenantWithNoEmail.USEN_ID} because email is null or empty`,
    );

    warnMock.mockRestore();
  });
});
