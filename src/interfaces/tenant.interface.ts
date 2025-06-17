// Defines the shape of a lease with relevant dates for start, payment, and end
export interface Lease {
  LEAD_START: Date | null;
  LEAD_END: Date | null;
  LEAD_PAYMENT: Date | null;
}

// Defines the structure of an event with a title and start/end dates
export interface Event {
  EVEC_LIB: string | null;
  EVED_START: Date | null;
  EVED_END: Date | null;
}

// Defines the shape of a tenant including personal info and related leases and events
export interface Tenant {
  USEN_ID: number;
  USEC_FNAME: string | null;
  USEC_LNAME: string | null;
  USEC_MAIL: string | null;
  leases: Lease[];
  events: Event[];
}
