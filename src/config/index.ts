import { parseCliArgs, CLIConfig } from "./cli.js";
import { loadEnvironmentConfig, EnvironmentConfig } from "./environment.js";

export interface ServerConfig {
  url: string;
  adminEmail?: string;
  adminPassword?: string;
  dataDir?: string;
  port?: number;
  host?: string;
}

/**
 * Create unified server configuration by merging CLI args and environment variables
 * CLI arguments take precedence over environment variables
 */
export function createServerConfig(): ServerConfig {
  const cliConfig = parseCliArgs();
  const envConfig = loadEnvironmentConfig();

  // Prioritize CLI args over environment variables
  const url = cliConfig.url || envConfig.pocketbaseUrl;
  
  if (!url) {
    throw new Error(
      "PocketBase URL is required. Provide it via --url parameter or POCKETBASE_URL environment variable."
    );
  }

  return {
    url,
    adminEmail: cliConfig.adminEmail || envConfig.adminEmail,
    adminPassword: cliConfig.adminPassword || envConfig.adminPassword,
    dataDir: cliConfig.dataDir,
    port: cliConfig.port,
    host: cliConfig.host,
  };
}

export { CLIConfig, EnvironmentConfig };