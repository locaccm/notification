import { verifierRappelsQuotidiens } from '../reminder';

jest.useFakeTimers();

describe('verifierRappelsQuotidiens', () => {
    it('schedules the call every 24h', () => {
        // Launch the function for the first time
        verifierRappelsQuotidiens();

        // Advance the time by 24h to simulate the next scheduled call
        jest.advanceTimersByTime(86400000); // 24h in ms
    });
});

