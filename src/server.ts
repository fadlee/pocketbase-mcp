import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import PocketBase from "pocketbase";
import type { ServerConfig } from "./config/index.js";
import { handlePocketBaseError } from "./utils/errors.js";

// Import all schemas
import {
  createCollectionSchema,
  deleteCollectionSchema,
  getCollectionSchemaSchema,
  listCollectionsSchema,
  createRecordSchema,
  listRecordsSchema,
  updateRecordSchema,
  deleteRecordSchema,
  authenticateUserSchema,
  createUserSchema,
  analyzeCollectionDataSchema,
  queryCollectionSchema,
  migrateCollectionSchema,
  backupDatabaseSchema,
  importDataSchema,
  manageIndexesSchema,
  generatePbSchemaSchema,
  generateTypescriptInterfacesSchema,
} from "./tools/index.js";

// Import all handlers
import {
  createCreateCollectionHandler,
  createDeleteCollectionHandler,
  createGetCollectionSchemaHandler,
  createListCollectionsHandler,
  createCreateRecordHandler,
  createListRecordsHandler,
  createUpdateRecordHandler,
  createDeleteRecordHandler,
  createAuthenticateUserHandler,
  createCreateUserHandler,
  createAnalyzeCollectionDataHandler,
  createQueryCollectionHandler,
  createMigrateCollectionHandler,
  createBackupDatabaseHandler,
  createImportDataHandler,
  createManageIndexesHandler,
  createGeneratePbSchemaHandler,
  createGenerateTypescriptInterfacesHandler,
} from "./tools/index.js";

/**
 * Create and configure the MCP server
 */
export function createServer(config: ServerConfig): Server {
  const server = new Server(
    {
      name: "pocketbase-mcp",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize PocketBase client
  const pb = new PocketBase(config.url);

  // Authenticate admin if credentials provided
  if (config.adminEmail && config.adminPassword) {
    pb.collection("_superusers").authWithPassword(config.adminEmail, config.adminPassword)
      .catch((error) => {
        console.error("Failed to authenticate admin:", error);
      });
  }

  // Tool definitions with their schemas and handlers
  const tools = [
    // Collection tools
    {
      name: "create_collection",
      description: "Create a new collection in PocketBase",
      inputSchema: createCollectionSchema,
      handler: createCreateCollectionHandler(pb),
    },
    {
      name: "delete_collection",
      description: "Delete a collection from PocketBase",
      inputSchema: deleteCollectionSchema,
      handler: createDeleteCollectionHandler(pb),
    },
    {
      name: "get_collection_schema",
      description: "Get schema details for a collection",
      inputSchema: getCollectionSchemaSchema,
      handler: createGetCollectionSchemaHandler(pb),
    },
    {
      name: "list_collections",
      description: "List all collections with optional sorting",
      inputSchema: listCollectionsSchema,
      handler: createListCollectionsHandler(pb),
    },

    // Record tools
    {
      name: "create_record",
      description: "Create a new record in a collection",
      inputSchema: createRecordSchema,
      handler: createCreateRecordHandler(pb),
    },
    {
      name: "list_records",
      description: "List records from a collection with optional filters",
      inputSchema: listRecordsSchema,
      handler: createListRecordsHandler(pb),
    },
    {
      name: "update_record",
      description: "Update an existing record",
      inputSchema: updateRecordSchema,
      handler: createUpdateRecordHandler(pb),
    },
    {
      name: "delete_record",
      description: "Delete a record",
      inputSchema: deleteRecordSchema,
      handler: createDeleteRecordHandler(pb),
    },

    // Auth tools
    {
      name: "authenticate_user",
      description: "Authenticate a user and get auth token",
      inputSchema: authenticateUserSchema,
      handler: createAuthenticateUserHandler(pb),
    },
    {
      name: "create_user",
      description: "Create a new user account",
      inputSchema: createUserSchema,
      handler: createCreateUserHandler(pb),
    },

    // Analysis tools
    {
      name: "analyze_collection_data",
      description: "Analyze data patterns and provide insights about a collection",
      inputSchema: analyzeCollectionDataSchema,
      handler: createAnalyzeCollectionDataHandler(pb),
    },
    {
      name: "query_collection",
      description: "Advanced query with filtering, sorting, and aggregation",
      inputSchema: queryCollectionSchema,
      handler: createQueryCollectionHandler(pb),
    },

    // Migration tools
    {
      name: "migrate_collection",
      description: "Migrate collection schema with data preservation",
      inputSchema: migrateCollectionSchema,
      handler: createMigrateCollectionHandler(pb),
    },
    {
      name: "backup_database",
      description: "Create a backup of the PocketBase database",
      inputSchema: backupDatabaseSchema,
      handler: createBackupDatabaseHandler(pb),
    },
    {
      name: "import_data",
      description: "Import data into a collection",
      inputSchema: importDataSchema,
      handler: createImportDataHandler(pb),
    },
    {
      name: "manage_indexes",
      description: "Manage collection indexes",
      inputSchema: manageIndexesSchema,
      handler: createManageIndexesHandler(pb),
    },

    // Generation tools
    {
      name: "generate_pb_schema",
      description: "Generate a PocketBase schema based on TypeScript interfaces or database diagram",
      inputSchema: generatePbSchemaSchema,
      handler: createGeneratePbSchemaHandler(pb),
    },
    {
      name: "generate_typescript_interfaces",
      description: "Generate TypeScript interfaces from PocketBase collections",
      inputSchema: generateTypescriptInterfacesSchema,
      handler: createGenerateTypescriptInterfacesHandler(pb),
    },
  ];

  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await tool.handler(args || {});
      return {
        content: result.content,
      };
    } catch (error: unknown) {
      throw handlePocketBaseError(`tool ${name}`, error);
    }
  });

  return server;
}

/**
 * Start the MCP server
 */
export async function startServer(config: ServerConfig): Promise<void> {
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("PocketBase MCP Server started successfully");
  console.error(`Connected to PocketBase at: ${config.url}`);
}
