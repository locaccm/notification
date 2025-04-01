export function creerRappel(nomEvenement: string, dateSpecifique?: Date): void {
    // Check if a specific date is provided; if not, log an error and return
    if (!dateSpecifique) {
        console.error("❌ Erreur : Veuillez fournir 'dateSpecifique'.");
        return;
    }

    // Get the current date and time
    const maintenant = new Date();

    // Get the target time (specific date in milliseconds)
    const tempsCible = dateSpecifique.getTime();

    // Calculate the time difference in milliseconds
    const diffEnMs = tempsCible - maintenant.getTime(); 

    // If the specified date is in the past, log an error and return
    if (diffEnMs < 0) {
        console.error(`❌ Erreur : La date spécifiée pour "${nomEvenement}" est dans le passé.`);
        return;
    }

    // Robust check to avoid the "1 day" error and handle reminders set for today
    const memeJour = dateSpecifique.toDateString() === maintenant.toDateString();
    const joursRestants = memeJour ? 0 : Math.floor(diffEnMs / (1000 * 60 * 60 * 24));

    // Log the reminder information: event name and how many days until the reminder
    console.log(`📅 Événement : ${nomEvenement} - Rappel prévu dans ${joursRestants} jours.`);

    // Set a timer that will log the reminder after the calculated delay (in milliseconds)
    const minuterie = setTimeout(() => {
        console.log(`🔔 Rappel : ${nomEvenement}`);
    }, diffEnMs);

    // Calling unref() ensures that the timer doesn't keep the event loop running if no other tasks are pending
    minuterie.unref();
}
