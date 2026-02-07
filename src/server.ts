import { ValidationError } from './errors.js';
import { HttpClient } from './http-client.js';
import { PocketBaseApi } from './pocketbase-api.js';
import { createCollectionToolHandlers } from './tool-handlers/collections.js';
import { createMetaToolHandlers } from './tool-handlers/meta.js';
import { createRecordToolHandlers } from './tool-handlers/records.js';
import type { ToolHandler, ToolHandlerMap } from './tool-handlers/types.js';
import { TOOL_DEFINITIONS, type ToolName } from './tool-definitions.js';

export class PocketBaseMCPServer {
  private readonly http: HttpClient;
  private readonly api: PocketBaseApi;
  private readonly email?: string;
  private readonly password?: string;
  private readonly toolHandlers: Record<ToolName, ToolHandler>;

  constructor(baseUrl: string, token?: string, email?: string, password?: string) {
    this.http = new HttpClient(baseUrl, token);
    this.api = new PocketBaseApi(this.http);
    this.email = email;
    this.password = password;
    this.toolHandlers = this.createToolHandlers();
  }

  async initialize(): Promise<void> {
    if (!this.http.getToken() && this.email && this.password) {
      await this.http.authenticate(this.email, this.password);
    }
  }

  private createToolHandlers(): Record<ToolName, ToolHandler> {
    const handlers: ToolHandlerMap = {
      ...createMetaToolHandlers({ api: this.api }),
      ...createCollectionToolHandlers({ api: this.api }),
      ...createRecordToolHandlers({ api: this.api }),
    };

    const missing = TOOL_DEFINITIONS.map((tool) => tool.name).filter((name) => !handlers[name]);
    if (missing.length > 0) {
      throw new Error(`Missing tool handlers: ${missing.join(', ')}`);
    }

    return handlers as Record<ToolName, ToolHandler>;
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const handler = (this.toolHandlers as Record<string, ToolHandler | undefined>)[toolName];
    if (!handler) {
      throw new ValidationError(`Unknown tool: ${toolName}`);
    }

    return handler(args);
  }

  async listResources(): Promise<
    Array<{ uri: string; name: string; description: string; mimeType: string }>
  > {
    return this.api.listResources();
  }

  async readResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
    return this.api.readResource(uri);
  }
}
