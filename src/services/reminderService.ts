import { Tenant, Event } from "../interfaces/Tenant";

// Function that schedules a reminder at a specific date
export function createReminder(
  eventName: string,
  specificDate?: Date,
): string | null {
  if (!specificDate) {
    return "Error: Please provide 'specificDate'.";
  }

  const now = new Date();
  const targetTime = specificDate.getTime();
  const diffInMs = targetTime - now.getTime();

  if (diffInMs <= 0) {
    return "Error: The event date is in the past or today. No reminder can be created.";
  }

  const daysRemaining = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (daysRemaining !== 5) {
    return `📅 Event: ${eventName} - Reminder not needed now (scheduled in ${daysRemaining} days).`;
  }

  return `🔔 Reminder: ${eventName} - scheduled in ${daysRemaining} days.`;
}

// Adds reminders for important events related to a tenant
export function addRemindersForTenant(tenant: Tenant): string[] {
  const results: string[] = [];

  const paymentDate = new Date(tenant.paymentDate);
  const paymentReminderDate = new Date(
    paymentDate.getTime() - 5 * 24 * 60 * 60 * 1000,
  );
  const paymentReminder = createReminder(
    `Payment reminder for ${tenant.email}`,
    paymentReminderDate,
  );
  if (paymentReminder) results.push(paymentReminder);

  const leaseEndDate = new Date(tenant.leaseEndDate);
  const leaseEndReminderDate = new Date(
    leaseEndDate.getTime() - 5 * 24 * 60 * 60 * 1000,
  );
  const leaseEndReminder = createReminder(
    `Lease end reminder for ${tenant.email}`,
    leaseEndReminderDate,
  );
  if (leaseEndReminder) results.push(leaseEndReminder);

  return results;
}

// Function to manage reminders for specific events of the tenant
export function addRemindersForEvents(
  tenant: Tenant & { events: Event[] },
): string[] {
  const results: string[] = [];

  if (!tenant.events) return results;

  tenant.events.forEach((event: Event) => {
    const startDate = new Date(event.eventStartDate);
    const reminderDate = new Date(
      startDate.getTime() - 5 * 24 * 60 * 60 * 1000,
    );
    const eventReminder = createReminder(
      `Event ${event.name} for ${tenant.email}`,
      reminderDate,
    );
    if (eventReminder) results.push(eventReminder);
  });

  return results;
}

// Checks daily if reminders should be sent
export function checkDailyReminders() {
  const { loadDatabase } = require("../models/tenantModel");

  const tenants = loadDatabase();

  tenants.forEach((tenant: Tenant & { events: Event[] }) => {
    const tenantReminders = addRemindersForTenant(tenant);
    tenantReminders.forEach((reminder) => {
      // Remplacer par votre logique d'envoi de rappels
      sendReminder(reminder);
    });

    const eventReminders = addRemindersForEvents(tenant);
    eventReminders.forEach((reminder) => {
      // Remplacer par votre logique d'envoi de rappels
      sendReminder(reminder);
    });
  });

  // Vérifie les rappels tous les 24h (86400000 ms)
  setTimeout(checkDailyReminders, 86400000);
}

export function sendReminder(reminder: string) {
  reminder;
}
