#!/usr/bin/env node

import { createServerConfig } from "./config/index.js";
import { startServer } from "./server.js";

// Main entry point
async function main(): Promise<void> {
  try {
    // Create server configuration from CLI args and environment
    const config = createServerConfig();
    
    // Start the MCP server
    await startServer(config);
  } catch (error) {
    console.error("Failed to start PocketBase MCP Server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
