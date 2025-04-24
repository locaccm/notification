import fs from 'fs';
import path from 'path';
import { loadDatabase } from '../models/tenantModel';

const dbPath = path.resolve(__dirname, '../db.json');

const originalConsoleError = console.error;

let originalBackup: string | null = null;

beforeAll(() => {
    if (fs.existsSync(dbPath)) {
        originalBackup = fs.readFileSync(dbPath, 'utf-8');
    }
    console.error = () => {};
});

afterAll(() => {
    if (originalBackup !== null) {
        fs.writeFileSync(dbPath, originalBackup, 'utf-8');
    } else if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
    console.error = originalConsoleError;
});

// --------------------------------------------
// Test for loadDatabase
// --------------------------------------------
describe('Database loading from JSON file', () => {

    afterEach(() => {
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
    });

    it("should load tenants from a valid JSON file", () => {
        const content = {
            tenants: [
                { email: "Alice@test02.fr" },
                { email: "Bob@test02.com" }
            ]
        };
        fs.writeFileSync(dbPath, JSON.stringify(content), 'utf-8');

        const result = loadDatabase();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0].email).toBe("Alice@test02.fr");
    });

    it("should return an empty array if the file is malformed", () => {
        fs.writeFileSync(dbPath, "{ tenants: [", 'utf-8');

        const result = loadDatabase();

        expect(result).toEqual([]);
    });

    it("should return an empty array if 'tenants' is not an array", () => {
        const content = { tenants: "not an array" };
        fs.writeFileSync(dbPath, JSON.stringify(content), 'utf-8');

        const result = loadDatabase();

        expect(result).toEqual([]);
    });

    it("should return an empty array if the file does not exist", () => {
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

        const result = loadDatabase();

        expect(result).toEqual([]);
    });
});
