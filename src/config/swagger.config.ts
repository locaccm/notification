import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Load the Swagger YAML documentation file
const swaggerDocument = YAML.load("./swagger.yaml");

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument);
