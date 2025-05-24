import { Tenant } from "../interfaces/tenant.interface";
import { loadDatabase } from "../loadDatabase";
import { sendReminders } from "./reminderEmail.service";

// Create a reminder if the date is within the next 5 days
export function createReminder(
  eventName: string,
  specificDate?: Date,
): string | null {
  if (!specificDate) {
    return null;
  }

  //console.log("passe1 :" + specificDate, eventName)

  const now = new Date();
  const targetTime = specificDate.getTime();
  const diffInMs = targetTime - now.getTime();

  if (diffInMs <= 0) {
    return null;
  }

  //console.log("passe2 :" + specificDate, eventName)

  const daysRemaining = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (daysRemaining > 5) {
    return null;
  }

  //console.log("passe3 :" + specificDate, eventName)

  return `🔔 Reminder: ${eventName} - scheduled in ${daysRemaining} days.`;
}

// Generate reminders for tenant lease payments and lease ends
export function addRemindersForTenant(tenant: Tenant): string[] {
  const results: string[] = [];

  tenant.leases.forEach((lease) => {
    const paymentReminderDate = new Date(lease.LEAD_PAYMENT.getTime());
    const paymentReminder = createReminder(
      `Payment reminder for ${tenant.USEC_MAIL}`,
      paymentReminderDate,
    );
    if (paymentReminder) results.push(paymentReminder);

    const leaseEndReminderDate = new Date(lease.LEAD_END.getTime());
    const leaseEndReminder = createReminder(
      `Lease end reminder for ${tenant.USEC_MAIL}`,
      leaseEndReminderDate,
    );
    if (leaseEndReminder) results.push(leaseEndReminder);
  });

  return results;
}

// Generate reminders for tenant events
export function addRemindersForEvents(tenant: Tenant): string[] {
  const results: string[] = [];

  if (!tenant.events) return results;

  tenant.events.forEach((event) => {
    const reminderDate = new Date(event.EVED_START.getTime());
    const eventReminder = createReminder(
      `Event ${event.EVEC_LIB} for ${tenant.USEC_MAIL}`,
      reminderDate,
    );
    if (eventReminder) results.push(eventReminder);
  });

  return results;
}

// Daily check to send reminders for all tenants and reschedule itself
export async function checkDailyReminders() {
  const tenants = await loadDatabase();

  for (const tenant of tenants) {
    const tenantReminders = addRemindersForTenant(tenant);
    const eventReminders = addRemindersForEvents(tenant);

    await sendReminders(tenantReminders, tenant);
    await sendReminders(eventReminders, tenant);
  }

  setTimeout(checkDailyReminders, 86400000);
}
