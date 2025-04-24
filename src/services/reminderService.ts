import { Tenant, Event } from '../interfaces/Tenant';

// Function that schedules a reminder at a specific date
export function createReminder(eventName: string, specificDate?: Date): void {
    if (!specificDate) {
        console.error("Error: Please provide 'specificDate'.");
        return;
    }

    const now = new Date(); 
    const targetTime = specificDate.getTime(); 
    const diffInMs = targetTime - now.getTime(); 

    if (diffInMs <= 0) {
        console.error(`Error: The event date is in the past or today. No reminder can be created.`);
        return;
    }

    const isSameDay = specificDate.toDateString() === now.toDateString();
    let daysRemaining = isSameDay ? 0 : Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    daysRemaining = daysRemaining > 0 ? daysRemaining : 0;

    const status = daysRemaining === 5 ? 'To send' : 'Do not send';

    const targetMonth = specificDate.getMonth();
    const targetYear = specificDate.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (targetMonth !== currentMonth || targetYear !== currentYear) {
        console.error(`Error: The event date does not match the current month or year. Reminder not created.`);
        return;
    }

    console.log(`📅 Event: ${eventName} - Reminder scheduled in ${daysRemaining} days. ➤ ${status}`);

    if (status === 'To send') {
        console.log(`🔔 Reminder: ${eventName} - scheduled in ${daysRemaining} days.`);
    }
}

// Adds reminders for important events related to a tenant
export function addRemindersForTenant(tenant: Tenant): void {

    const paymentDate = new Date(tenant.payment_date);
    const paymentReminderDate = new Date(paymentDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    createReminder(`Payment reminder for ${tenant.email}`, paymentReminderDate);

    const leaseEndDate = new Date(tenant.lease_end_date);
    const leaseEndReminderDate = new Date(leaseEndDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    createReminder(`Lease end reminder for ${tenant.email}`, leaseEndReminderDate);
    
    addRemindersForEvents(tenant);
}

// Function to manage reminders for specific events of the tenant
export function addRemindersForEvents(tenant: Tenant & { events?: Event[] }): void {
    if (!tenant.events || tenant.events.length === 0) return;

    tenant.events.forEach((event: Event) => {
        const startDate = new Date(event.event_start_date);
        const reminderDate = new Date(startDate.getTime() - 5 * 24 * 60 * 60 * 1000);

        createReminder(`Event ${event.name} for ${tenant.email}`, reminderDate);
    });
}

// Checks daily if reminders should be sent
export function checkDailyReminders() {
    const { loadDatabase } = require('../models/tenantModel');

    const tenants = loadDatabase(); 

    tenants.forEach(addRemindersForTenant);

    setTimeout(checkDailyReminders, 86400000); 
}
