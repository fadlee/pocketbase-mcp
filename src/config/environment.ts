import dotenv from "dotenv";

export interface EnvironmentConfig {
  pocketbaseUrl?: string;
  adminEmail?: string;
  adminPassword?: string;
}

/**
 * Load and parse environment variables for PocketBase MCP Server
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  // Load environment variables from .env file
  dotenv.config();

  return {
    pocketbaseUrl: process.env.POCKETBASE_URL,
    adminEmail: process.env.POCKETBASE_ADMIN_EMAIL,
    adminPassword: process.env.POCKETBASE_ADMIN_PASSWORD,
  };
}
