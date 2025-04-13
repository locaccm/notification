import fs from 'fs';
import path from 'path';
import { Locataire } from '../interfaces/locataire';

// Function to load the JSON file containing tenant data
export function chargerBdd(): Locataire[]{
    const cheminBdd = path.resolve(__dirname, '../bdd.json'); 
    try {
        const data = fs.readFileSync(cheminBdd, 'utf-8'); 
        const contenu = JSON.parse(data);

        if (!Array.isArray(contenu.locataires)) {
            throw new Error("The key 'locataires' must contain an array.");
        }

        console.log("Loaded tenants:", contenu.locataires); 
        return contenu.locataires;

    } catch (error) {
        console.error("Error reading the bdd.json file:", error); 
        return []; 
    }
}
