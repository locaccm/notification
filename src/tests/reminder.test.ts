import { creerRappel } from "../reminder";

describe("creerRappel", () => {
    // Setup before each test
    beforeAll(() => {
        // Use fake timers and set the system time to a fixed date (2025-04-01T12:00:00Z)
        jest.useFakeTimers().setSystemTime(new Date("2025-04-01T12:00:00Z"));
        
        // Mock the console.log and console.error methods to prevent actual logging during tests
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    // Cleanup after all tests
    afterAll(() => {
        // Restore real timers to avoid affecting other parts of the code
        jest.useRealTimers();
        
        // Restore the original console methods
        jest.restoreAllMocks();
    });

    // Helper function to generate a random future date (within the next 10 days)
    const obtenirDateFuturAleatoire = (): Date => {
        const maintenant = new Date(); // Get the current date
        const joursAleatoires = Math.floor(Math.random() * 10) + 1; // Generate a random number of days between 1 and 10
        return new Date(maintenant.getTime() + joursAleatoires * 24 * 60 * 60 * 1000); // Return the future date
    };

    // Test case: Should log an error if no specific date is provided
    it("devrait afficher une erreur si aucune date n'est fournie", () => {
        creerRappel("Événement Test"); // Call the function without a specific date

        // Expect an error message to be logged to the console
        expect(console.error).toHaveBeenCalledWith("❌ Erreur : Veuillez fournir 'dateSpecifique'.");
    });

    // Test case: Should log an error if the specified date is in the past
    it("devrait afficher une erreur si la date spécifiée est dans le passé", () => {
        // Create a date in the past (2025-03-31)
        const dateDansLePasse = new Date("2025-03-31T12:00:00Z");

        creerRappel("Événement Test", dateDansLePasse); // Call the function with the past date

        // Expect an error message indicating that the date is in the past
        expect(console.error).toHaveBeenCalledWith(
            `❌ Erreur : La date spécifiée pour "Événement Test" est dans le passé.`
        );
    });

    // Test case: Should log a reminder message for a random future event
    it("devrait afficher un message de rappel pour un événement futur aléatoire", () => {
        const nomEvenement = "Événement Aléatoire"; // Event name
        const dateEvenement = obtenirDateFuturAleatoire(); // Get a random future date

        // Call the function to create a reminder for the random event
        creerRappel(nomEvenement, dateEvenement);

        const maintenant = new Date(); // Get the current date
        const estMemeJour = dateEvenement.toDateString() === maintenant.toDateString(); // Check if the event is today
        const joursRestants = estMemeJour ? 0 : Math.floor((dateEvenement.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)); // Calculate remaining days

        // Expect a log message showing the number of days until the event
        expect(console.log).toHaveBeenCalledWith(
            `📅 Événement : ${nomEvenement} - Rappel prévu dans ${joursRestants} jours.`
        );

        // Advance the fake timers by the calculated time difference (in milliseconds)
        jest.advanceTimersByTime(dateEvenement.getTime() - maintenant.getTime());

        // Expect the reminder message to be logged after the timer is triggered
        expect(console.log).toHaveBeenCalledWith(`🔔 Rappel : ${nomEvenement}`);
    });
});
