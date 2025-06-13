import { PrismaClient } from "@prisma/client";

// Instantiate and export a single shared PrismaClient instance for use across the app
export const prisma = new PrismaClient();
