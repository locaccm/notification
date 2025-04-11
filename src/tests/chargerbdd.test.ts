import fs from 'fs';
import path from 'path';
import { chargerBdd } from '../reminder';

const cheminBdd = path.resolve(__dirname, '../bdd.json');

const originalConsoleError = console.error;

let sauvegardeOriginale: string | null = null;

beforeAll(() => {
    // Backup the original file if it exists
    if (fs.existsSync(cheminBdd)) {
        sauvegardeOriginale = fs.readFileSync(cheminBdd, 'utf-8');
    }
    // Silence error logs during tests
    console.error = () => {};
});

afterAll(() => {
    // Restore the original file after all tests
    if (sauvegardeOriginale !== null) {
        fs.writeFileSync(cheminBdd, sauvegardeOriginale, 'utf-8');
    } else if (fs.existsSync(cheminBdd)) {
        // If the file didn't exist originally, remove it
        fs.unlinkSync(cheminBdd);
    }
    console.error = originalConsoleError;
});

describe('chargerBdd (without mock)', () => {

    afterEach(() => {
        // Clean up after each test (remove the written file)
        if (fs.existsSync(cheminBdd)) {
            fs.unlinkSync(cheminBdd);
        }
    });

    it("should load tenants from a valid JSON file", () => {
        const contenu = {
            locataires: [
                { nom: "Alice" },
                { nom: "Bob" }
            ]
        };
        fs.writeFileSync(cheminBdd, JSON.stringify(contenu), 'utf-8');

        const result = chargerBdd();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0].nom).toBe("Alice");
    });

    it("should return an empty array if the file is malformed", () => {
        fs.writeFileSync(cheminBdd, "{ locataires: [", 'utf-8');

        const result = chargerBdd();

        expect(result).toEqual([]);
    });

    it("should return an empty array if 'locataires' is not an array", () => {
        const contenu = { locataires: "not an array" };
        fs.writeFileSync(cheminBdd, JSON.stringify(contenu), 'utf-8');

        const result = chargerBdd();

        expect(result).toEqual([]);
    });

    it("should return an empty array if the file does not exist", () => {
        if (fs.existsSync(cheminBdd)) fs.unlinkSync(cheminBdd);

        const result = chargerBdd();

        expect(result).toEqual([]);
    });
});
