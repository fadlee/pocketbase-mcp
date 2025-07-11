import type PocketBase from "pocketbase";
import type { 
  ToolHandler, 
  CreateRecordArgs, 
  ListRecordsArgs, 
  UpdateRecordArgs, 
  DeleteRecordArgs 
} from "../../types/index.js";
import { handlePocketBaseError } from "../../utils/errors.js";
import { createJsonResponse } from "../../utils/response.js";

/**
 * Create a new record in a collection
 */
export function createCreateRecordHandler(pb: PocketBase): ToolHandler {
  return async (args: CreateRecordArgs) => {
    try {
      const options: any = {};
      
      // Add optional parameters
      if (args.expand) options.expand = args.expand;
      if (args.fields) options.fields = args.fields;
      
      const result = await pb
        .collection(args.collection)
        .create(args.data, options);
      
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("create record", error);
    }
  };
}

/**
 * List records from a collection with optional filters
 */
export function createListRecordsHandler(pb: PocketBase): ToolHandler {
  return async (args: ListRecordsArgs) => {
    try {
      const options: any = {};
      
      // Add optional parameters
      if (args.filter) options.filter = args.filter;
      if (args.sort) options.sort = args.sort;
      if (args.expand) options.expand = args.expand;
      if (args.fields) options.fields = args.fields;
      if (args.skipTotal !== undefined) options.skipTotal = args.skipTotal;
      
      // Set pagination
      const page = args.page || 1;
      const perPage = args.perPage || 50;
      
      const result = await pb
        .collection(args.collection)
        .getList(page, perPage, options);
      
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("list records", error);
    }
  };
}

/**
 * Update an existing record
 */
export function createUpdateRecordHandler(pb: PocketBase): ToolHandler {
  return async (args: UpdateRecordArgs) => {
    try {
      const options: any = {};
      
      // Add optional parameters
      if (args.expand) options.expand = args.expand;
      if (args.fields) options.fields = args.fields;
      
      const result = await pb
        .collection(args.collection)
        .update(args.id, args.data, options);
      
      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("update record", error);
    }
  };
}

/**
 * Delete a record
 */
export function createDeleteRecordHandler(pb: PocketBase): ToolHandler {
  return async (args: DeleteRecordArgs) => {
    try {
      await pb.collection(args.collection).delete(args.id);
      return createJsonResponse({
        success: true,
        message: `Record '${args.id}' deleted successfully from collection '${args.collection}'`
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("delete record", error);
    }
  };
}