import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface CLIConfig {
  url?: string;
  adminEmail?: string;
  adminPassword?: string;
  dataDir?: string;
  port?: number;
  host?: string;
}

/**
 * Parse command line arguments for PocketBase MCP Server
 */
export function parseCliArgs(): CLIConfig {
  const argv = yargs(hideBin(process.argv))
    .option("url", {
      alias: "u",
      type: "string",
      description: "PocketBase URL",
    })
    .option("admin-email", {
      alias: "e",
      type: "string",
      description: "Admin email for authentication",
    })
    .option("admin-password", {
      alias: "p",
      type: "string",
      description: "Admin password for authentication",
    })
    .option("data-dir", {
      alias: "d",
      type: "string",
      description: "Custom data directory path",
    })
    .option("port", {
      type: "number",
      description: "HTTP server port (if using HTTP instead of STDIO)",
    })
    .option("host", {
      type: "string",
      description: "HTTP server host (if using HTTP instead of STDIO)",
    })
    .help()
    .alias("help", "h")
    .parseSync();

  return {
    url: argv.url as string,
    adminEmail: argv["admin-email"] as string,
    adminPassword: argv["admin-password"] as string,
    dataDir: argv["data-dir"] as string,
    port: argv.port as number,
    host: argv.host as string,
  };
}