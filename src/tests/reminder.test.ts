import {
    creerRappel,
    ajouterRappelsPourLocataire,
    ajouterRappelsPourEvenements
} from '../reminder';

jest.useFakeTimers();

let spyLog: jest.SpyInstance; 
let spyError: jest.SpyInstance;

beforeEach(() => {
    spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.clearAllTimers();
    spyLog.mockRestore();
});

// --------------------------------------------
// Tests for the creerRappel function
// --------------------------------------------
describe('Reminder creation logic based on event dates', () => {
    it('should display an error if dateSpecifique is not provided', () => {
        creerRappel('Reminder without date');
    
        expect(spyError).toHaveBeenCalledWith("Error: Please provide 'dateSpecifique'.");
    });
    
    it('should create a reminder for a future event and mark as "Do not send"', () => {
        const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        creerRappel('End of lease for locataire@example.com', futureDate);

        jest.runAllTimers();

        expect(spyLog).toHaveBeenCalledWith(
            expect.stringContaining("📅 Event: End of lease for locataire@example.com - Reminder scheduled in 2 days. ➤ Do not send")
        );
    });

    it('does not create a reminder if the date is in the past', () => {
        const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        creerRappel('Past event', pastDate);

        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining("Reminder ignored"));
    });

    it('does not create a reminder if the date is today', () => {
        const todayDate = new Date(); 
        todayDate.setHours(0, 0, 0, 0); 
    
        creerRappel('Event today', todayDate);
    
        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining("Reminder ignored"));
    });
    

    it('does not create a reminder if the month or year does not match', () => {
        const futureDateDifferentMonth = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        futureDateDifferentMonth.setMonth(futureDateDifferentMonth.getMonth() + 1); 

        creerRappel('Event in a different month', futureDateDifferentMonth);

        jest.runAllTimers();

        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining("Reminder ignored"));
    });

    it('should create a reminder only when the event is exactly 5 days away', () => {
        const dateFiveDaysAway = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); 
        creerRappel('Event in 5 days', dateFiveDaysAway);

        jest.runAllTimers();

        expect(spyLog).toHaveBeenCalledWith(
            expect.stringContaining("🔔 Rappel: Event in 5 days - prévue dans 5 jours.")
        );
    });

    it('should not create a reminder if the event is more or less than 5 days away', () => {
        const dateMoreThanFiveDaysAway = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000); 
        const dateLessThanFiveDaysAway = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); 

        creerRappel('Event in 6 days', dateMoreThanFiveDaysAway);
        creerRappel('Event in 4 days', dateLessThanFiveDaysAway);

        jest.runAllTimers();

        expect(spyLog).not.toHaveBeenCalledWith(expect.stringContaining("🔔 Rappel"));
    });
});

// --------------------------------------------
// Helper function to generate a tenant for tests
// Dates are chosen such that the reminders (calculated in creerRappel)
// will be in the future for the payment reminder (datePaiement - 5 days)
// and for the end of lease (dateFin - 1 day).
function genererLocataireTest() {
    const now = new Date();
    const datePaiement = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const dateDebut = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const dateFin = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

    const dateDebutEvenement = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const dateFinEvenement = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
    return {
        email: "test@example.com",
        date_paiement: datePaiement.toISOString(),
        date_debut_location: dateDebut.toISOString(),
        date_fin_location: dateFin.toISOString(),
        evenements: [{
            nom: "Réparation de plomberie",
            date_debut_evenement: dateDebutEvenement.toISOString(),
            date_fin_evenement: dateFinEvenement.toISOString()
        }]        
    };
}

// --------------------------------------------
// Test for ajouterRappelsPourLocataire
// --------------------------------------------
describe('Reminder generation for tenant and tenant events', () => {
    it('should call creerRappel twice for a tenant', () => {
        const locataire = genererLocataireTest();

        ajouterRappelsPourLocataire(locataire);

        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining(`📅 Event: Rappel de paiement pour ${locataire.email} - Reminder scheduled in 5 days. ➤ To send`));
        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining(`🔔 Rappel: Rappel de paiement pour ${locataire.email} - prévue dans 5 jours.`));
        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining(`📅 Event: Fin de location pour test@example.com - Reminder scheduled in 15 days. ➤ Do not send`));
    });

    it('should call creerRappel for each event of the tenant', () => {
        const locataire = genererLocataireTest();

        ajouterRappelsPourEvenements(locataire);

        expect(spyLog).toHaveBeenCalledTimes(2); 

        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining(`📅 Event: Événement Réparation de plomberie pour ${locataire.email} - Reminder scheduled in 5 days. ➤ To send`));
        expect(spyLog).toHaveBeenCalledWith(expect.stringContaining(`🔔 Rappel: Événement Réparation de plomberie pour ${locataire.email} - prévue dans 5 jours.`));
    });
});




