// Structure of a tenant (data sourced from the JSON file)
export interface Locataire {
    email: string;
    date_paiement: string;
    date_debut_location: string; 
    date_fin_location: string; 
}

// Structure of an event associated with a tenant
export interface Evenement {
    nom: string;
    date_debut_evenement: string; 
    date_fin_evenement: string;   
}