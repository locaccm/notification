// Structure of a tenant (data sourced from the JSON file)
export interface Tenant {
  email: string;
  paymentDate: string;
  leaseStartDate: string;
  leaseEndDate: string;
}

// Structure of an event associated with a tenant
export interface Event {
  name: string;
  eventStartDate: string;
  eventEndDate: string;
}
