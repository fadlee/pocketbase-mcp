#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { serializeError } from './errors.js';
import { PocketBaseMCPServer } from './server.js';
import { getToolDefinitions } from './tool-definitions.js';

const POCKETBASE_URL = process.env.POCKETBASE_URL;
const POCKETBASE_TOKEN = process.env.POCKETBASE_TOKEN;
const POCKETBASE_EMAIL = process.env.POCKETBASE_EMAIL;
const POCKETBASE_PASSWORD = process.env.POCKETBASE_PASSWORD;

if (!POCKETBASE_URL) {
  console.error('Error: POCKETBASE_URL environment variable is required');
  process.exit(1);
}

const pbServer = new PocketBaseMCPServer(
  POCKETBASE_URL,
  POCKETBASE_TOKEN,
  POCKETBASE_EMAIL,
  POCKETBASE_PASSWORD
);

const mcpServer = new McpServer(
  {
    name: 'pocketbase-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

const server = mcpServer.server;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getToolDefinitions(),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await pbServer.callTool(name, args || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const serialized = serializeError(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: serialized }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = await pbServer.listResources();
  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    const content = await pbServer.readResource(uri);
    return {
      contents: [content],
    };
  } catch (error) {
    const serialized = serializeError(error);
    throw new Error(`[${serialized.type}] ${serialized.message}`);
  }
});

async function main() {
  await pbServer.initialize();
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
