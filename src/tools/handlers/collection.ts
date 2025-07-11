import type PocketBase from "pocketbase";
import type { ToolHandler, CreateCollectionArgs } from "../../types/index.js";
import { handlePocketBaseError } from "../../utils/errors.js";
import { createJsonResponse } from "../../utils/response.js";

/**
 * Create a new collection in PocketBase
 */
export function createCreateCollectionHandler(pb: PocketBase): ToolHandler {
  return async (args: CreateCollectionArgs) => {
    try {
      const result = await pb.collections.create({
        ...args,
      });
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("create collection", error);
    }
  };
}

/**
 * Delete a collection from PocketBase
 */
export function createDeleteCollectionHandler(pb: PocketBase): ToolHandler {
  return async (args: { collection: string }) => {
    try {
      await pb.collections.delete(args.collection);
      return createJsonResponse({ 
        success: true, 
        message: `Collection '${args.collection}' deleted successfully` 
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("delete collection", error);
    }
  };
}

/**
 * Get schema details for a collection
 */
export function createGetCollectionSchemaHandler(pb: PocketBase): ToolHandler {
  return async (args: { collection: string }) => {
    try {
      const result = await pb.collections.getOne(args.collection);
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("get collection schema", error);
    }
  };
}

/**
 * List all collections
 */
export function createListCollectionsHandler(pb: PocketBase): ToolHandler {
  return async (args: { sort?: string }) => {
    try {
      const result = await pb.collections.getFullList({ 
        sort: args.sort || "-created" 
      });
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("list collections", error);
    }
  };
}