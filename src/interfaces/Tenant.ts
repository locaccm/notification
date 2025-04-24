// Structure of a tenant (data sourced from the JSON file)
export interface Tenant {
    email: string;
    payment_date: string;
    lease_start_date: string; 
    lease_end_date: string; 
}

// Structure of an event associated with a tenant
export interface Event {
    name: string;
    event_start_date: string; 
    event_end_date: string;   
}
