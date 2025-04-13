import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// Load the Swagger YAML documentation file
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml")); 

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument);
