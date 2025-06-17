// Defines the shape of a lease with relevant dates for start, payment, and end
export interface Lease {
  LEAD_START: Date;
  LEAD_END: Date;
  LEAD_PAYMENT: Date;
}

// Defines the structure of an event with a title and start/end dates
export interface Event {
  EVEC_LIB: string;
  EVED_START: Date;
  EVED_END: Date;
}

// Defines the shape of a tenant including personal info and related leases and events
export interface Tenant {
  USEN_ID: number;
  USEC_FNAME: string;
  USEC_LNAME: string;
  USEC_MAIL: string;
  leases: Lease[];
  events: Event[];
}
