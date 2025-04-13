import fs from 'fs';  
import path from 'path'; 

// Structure of a tenant (data sourced from the JSON file)
interface Locataire {
    email: string;
    date_paiement: string;
    date_debut_location: string; 
    date_fin_location: string; 
}

// Structure of an event associated with a tenant
interface Evenement {
    nom: string;
    date_debut_evenement: string; 
    date_fin_evenement: string;   
}

// Function to load the JSON file containing tenant data
export function chargerBdd() {
    const cheminBdd = path.resolve(__dirname, '../src/bdd.json'); 
    try {
        const data = fs.readFileSync(cheminBdd, 'utf-8'); 
        const contenu = JSON.parse(data);

        if (!Array.isArray(contenu.locataires)) {
            throw new Error("The key 'locataires' must contain an array.");
        }

        console.log("Loaded tenants:", contenu.locataires); 
        return contenu.locataires;

    } catch (error) {
        console.error("Error reading the bdd.json file:", error); 
        return []; 
    }
}

// Function that schedules a reminder at a specific date
export function creerRappel(nomEvenement: string, dateSpecifique?: Date): void {
    if (!dateSpecifique) {
        console.error("Error: Please provide 'dateSpecifique'.");
        return;
    }

    const maintenant = new Date(); 
    const tempsCible = dateSpecifique.getTime(); 
    const diffEnMs = tempsCible - maintenant.getTime(); 

    if (diffEnMs <= 0) {
        console.log(`Reminder ignored: The event date is in the past or today.`);
        return;
    }

    const memeJour = dateSpecifique.toDateString() === maintenant.toDateString();
    let joursRestants = memeJour ? 0 : Math.floor(diffEnMs / (1000 * 60 * 60 * 24));
    joursRestants = joursRestants > 0 ? joursRestants : 0;

    const statut = joursRestants == 5 ? 'To send' : 'Do not send';

    const moisCible = dateSpecifique.getMonth();
    const anneeCible = dateSpecifique.getFullYear();
    const moisActuel = maintenant.getMonth();
    const anneeActuelle = maintenant.getFullYear();

    if (moisCible !== moisActuel || anneeCible !== anneeActuelle) {
        console.log(`Reminder ignored: The event is scheduled for a different month or year.`);
        return;
    }

    console.log(`📅 Event: ${nomEvenement} - Reminder scheduled in ${joursRestants} days. ➤ ${statut}`);

    if (statut === 'To send') {
        console.log(`🔔 Rappel: ${nomEvenement} - prévue dans ${joursRestants} jours.`);
    }
}

// Adds reminders for important events related to a tenant
export function ajouterRappelsPourLocataire(locataire: Locataire): void {

    const datePaiement = new Date(locataire.date_paiement);
    const rappelPaiementDate = new Date(datePaiement.getTime() - 5 * 24 * 60 * 60 * 1000);
    creerRappel(`Rappel de paiement pour ${locataire.email}`, rappelPaiementDate);

    const dateFinLocation = new Date(locataire.date_fin_location);
    const rappelFinLocationDate = new Date(dateFinLocation.getTime() - 5 * 24 * 60 * 60 * 1000);
    creerRappel(`Fin de location pour ${locataire.email}`, rappelFinLocationDate);
    
    ajouterRappelsPourEvenements(locataire);
}

// Function to manage reminders for specific events of the tenant
export function ajouterRappelsPourEvenements(locataire: Locataire & { evenements?: Evenement[] }): void {
    if (!locataire.evenements || locataire.evenements.length === 0) return;

    locataire.evenements.forEach((evenement) => {
        const dateDebut = new Date(evenement.date_debut_evenement);
        const rappelDate = new Date(dateDebut.getTime() - 5 * 24 * 60 * 60 * 1000);

        creerRappel(`Événement ${evenement.nom} pour ${locataire.email}`, rappelDate);
    });
}

// Checks daily if reminders should be sent
export function verifierRappelsQuotidiens() {
    const logements = chargerBdd(); 

    logements.forEach(ajouterRappelsPourLocataire);

    setTimeout(verifierRappelsQuotidiens, 86400000); 
}
