import fs from 'fs';  // Importing the fs module for file management
import path from 'path'; // Module for handling file paths

// Structure of a tenant (data sourced from the JSON file)
interface Locataire {
    email: string;
    date_paiement: string; // Date of the monthly payment
    date_debut_location: string; // Rental start date
    date_fin_location: string; // Rental end date
}

// Structure of an event associated with a tenant
interface Evenement {
    nom: string;
    date_debut_evenement: string; // Event start date
    date_fin_evenement: string;   // Event end date
}

// Function to load the JSON file containing tenant data
export function chargerBdd() {
    const cheminBdd = path.resolve(__dirname, '../src/bdd.json'); // Determines the absolute path of the JSON file

    try {
        const data = fs.readFileSync(cheminBdd, 'utf-8'); // Synchronously reads the file
        const contenu = JSON.parse(data); // Converts the JSON text into a JavaScript object

        // Checks that the 'locataires' property is indeed an array
        if (!Array.isArray(contenu.locataires)) {
            throw new Error("The key 'locataires' must contain an array.");
        }

        console.log("Loaded tenants:", contenu.locataires); // Logs the loaded tenants
        return contenu.locataires;

    } catch (error) {
        console.error("Error reading the bdd.json file:", error); // Handles errors in opening or parsing
        return [];  // In case of error, returns an empty array
    }
}

// Function that schedules a reminder at a specific date
export function creerRappel(nomEvenement: string, dateSpecifique?: Date): void {
    if (!dateSpecifique) {
        console.error("Error: Please provide 'dateSpecifique'.");
        return;
    }

    const maintenant = new Date(); // Current date and time
    const tempsCible = dateSpecifique.getTime(); // Target time in milliseconds
    const diffEnMs = tempsCible - maintenant.getTime(); // Time remaining until the reminder

    if (diffEnMs <= 0) {
        console.log(`Reminder ignored: The event date is in the past or today.`);
        return;
    }

    // Calculates the remaining days
    const memeJour = dateSpecifique.toDateString() === maintenant.toDateString();
    let joursRestants = memeJour ? 0 : Math.floor(diffEnMs / (1000 * 60 * 60 * 24));
    joursRestants = joursRestants > 0 ? joursRestants : 0;

    // Reminder status based on whether the event is imminent (5 days)
    const statut = joursRestants == 5 ? 'To send' : 'Do not send';

    // Checks if the event is in the current month/year
    const moisCible = dateSpecifique.getMonth();
    const anneeCible = dateSpecifique.getFullYear();
    const moisActuel = maintenant.getMonth();
    const anneeActuelle = maintenant.getFullYear();

    if (moisCible !== moisActuel || anneeCible !== anneeActuelle) {
        console.log(`Reminder ignored: The event is scheduled for a different month or year.`);
        return;
    }

    console.log(`📅 Event: ${nomEvenement} - Reminder scheduled in ${joursRestants} days. ➤ ${statut}`);

    // Show reminder immediately if it's within 5 days
    if (statut === 'To send') {
        console.log(`🔔 Rappel: ${nomEvenement} - prévue dans ${joursRestants} jours.`);
    }
}

// Adds reminders for important events related to a tenant
export function ajouterRappelsPourLocataire(locataire: Locataire): void {
    // Creates the payment reminder (5 days before)
    const datePaiement = new Date(locataire.date_paiement);
    const rappelPaiementDate = new Date(datePaiement.getTime() - 5 * 24 * 60 * 60 * 1000);
    creerRappel(`Rappel de paiement pour ${locataire.email}`, rappelPaiementDate);

    // Creates the rental end reminder (5 day before)
    const dateFinLocation = new Date(locataire.date_fin_location);
    const rappelFinLocationDate = new Date(dateFinLocation.getTime() - 5 * 24 * 60 * 60 * 1000);
    creerRappel(`Fin de location pour ${locataire.email}`, rappelFinLocationDate);
    
    // Adds reminders for the tenant's events
    ajouterRappelsPourEvenements(locataire);
}

// Function to manage reminders for specific events of the tenant
export function ajouterRappelsPourEvenements(locataire: Locataire & { evenements?: Evenement[] }): void {
    // If no event exists, do nothing
    if (!locataire.evenements || locataire.evenements.length === 0) return;

    // For each event, create a reminder 5 days before the start
    locataire.evenements.forEach((evenement) => {
        const dateDebut = new Date(evenement.date_debut_evenement);
        const rappelDate = new Date(dateDebut.getTime() - 5 * 24 * 60 * 60 * 1000);

        creerRappel(`Événement ${evenement.nom} pour ${locataire.email}`, rappelDate);
    });
}

// Checks daily if reminders should be sent
export function verifierRappelsQuotidiens() {
    const logements = chargerBdd(); // Loads all tenants

    // For each tenant, adds the different reminders
    logements.forEach(ajouterRappelsPourLocataire);

    // Schedules a reminder in 24 hours to re-run this function
    setTimeout(verifierRappelsQuotidiens, 86400000); // 86400000 ms = 24h
}
