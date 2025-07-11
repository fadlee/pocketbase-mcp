import type PocketBase from "pocketbase";
import type { ToolHandler, CreateCollectionArgs, UpdateCollectionArgs, TruncateCollectionArgs } from "../../types/index.ts";
import { handlePocketBaseError } from "../../utils/errors.ts";
import { createJsonResponse } from "../../utils/response.ts";

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

/**
 * Truncate all records from a collection
 */
export function createTruncateCollectionHandler(pb: PocketBase): ToolHandler {
  return async (args: TruncateCollectionArgs) => {
    try {
      await pb.collections.truncate(args.collection);
      return createJsonResponse({
        success: true,
        message: `All records in collection '${args.collection}' have been deleted`
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("truncate collection", error);
    }
  };
}
