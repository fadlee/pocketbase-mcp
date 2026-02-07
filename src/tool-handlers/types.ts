import type { ToolName } from '../tool-definitions.js';
import type { PocketBaseApi } from '../pocketbase-api.js';

export type ToolArgs = Record<string, unknown>;
export type ToolHandler = (args: ToolArgs) => Promise<unknown>;
export type ToolHandlerMap = Partial<Record<ToolName, ToolHandler>>;

export interface ToolHandlerContext {
  api: PocketBaseApi;
}
