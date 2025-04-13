import fs from 'fs';
import path from 'path';
import { chargerBdd } from '../reminder';

const cheminBdd = path.resolve(__dirname, '../bdd.json');

const originalConsoleError = console.error;

let sauvegardeOriginale: string | null = null;

beforeAll(() => {
    if (fs.existsSync(cheminBdd)) {
        sauvegardeOriginale = fs.readFileSync(cheminBdd, 'utf-8');
    }
    console.error = () => {};
});

afterAll(() => {
    if (sauvegardeOriginale !== null) {
        fs.writeFileSync(cheminBdd, sauvegardeOriginale, 'utf-8');
    } else if (fs.existsSync(cheminBdd)) {
        fs.unlinkSync(cheminBdd);
    }
    console.error = originalConsoleError;
});

// --------------------------------------------
// Test for chargerBdd
// --------------------------------------------
describe('Database loading from JSON file', () => {

    afterEach(() => {
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
