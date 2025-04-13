import { verifierRappelsQuotidiens } from '../services/rappelService';

jest.useFakeTimers();

// --------------------------------------------
// Test for verifierRappelsQuotidiens
// --------------------------------------------
describe('Daily reminder verification scheduling', () => {
    it('schedules the call every 24h', () => {
        verifierRappelsQuotidiens();

        jest.advanceTimersByTime(86400000); 
    });
});

