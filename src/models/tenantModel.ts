import fs from 'fs';
import path from 'path';
import { Tenant } from '../interfaces/Tenant';

// Function to load the JSON file containing tenant data
export function loadDatabase(): Tenant[] {
    const dbPath = path.resolve(__dirname, '../db.json'); 
    try {
        const data = fs.readFileSync(dbPath, 'utf-8'); 
        const content = JSON.parse(data);

        if (!Array.isArray(content.tenants)) {
            throw new Error("The key 'tenants' must contain an array.");
        }
        return content.tenants;

    } catch (error) {
        console.error("Error reading the db.json file:", error); 
        return []; 
    }
}
