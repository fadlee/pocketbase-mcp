import type PocketBase from "pocketbase";
import type { 
  ToolHandler, 
  MigrateCollectionArgs, 
  BackupDatabaseArgs, 
  ImportDataArgs, 
  ManageIndexesArgs 
} from "../../types/index.js";
import { handlePocketBaseError } from "../../utils/errors.js";
import { createJsonResponse, createTextResponse, formatCsvData } from "../../utils/response.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Migrate collection schema with data preservation
 */
export function createMigrateCollectionHandler(pb: PocketBase): ToolHandler {
  return async (args: MigrateCollectionArgs) => {
    try {
      const { collection, fields, dataTransforms = {}, name, ...rules } = args;
      
      // Get current collection
      const currentCollection = await pb.collections.getOne(collection);
      
      // Prepare update data
      const updateData: any = {
        fields,
        ...rules,
      };
      
      if (name) updateData.name = name;
      
      // Update collection schema
      const updatedCollection = await pb.collections.update(collection, updateData);
      
      // If there are data transforms, apply them
      if (Object.keys(dataTransforms).length > 0) {
        const records = await pb.collection(collection).getFullList();
        
        for (const record of records) {
          const updates: any = {};
          let hasUpdates = false;
          
          for (const [oldField, newField] of Object.entries(dataTransforms)) {
            if (record[oldField] !== undefined) {
              updates[newField] = record[oldField];
              hasUpdates = true;
            }
          }
          
          if (hasUpdates) {
            await pb.collection(collection).update(record.id, updates);
          }
        }
      }
      
      return createJsonResponse({
        success: true,
        collection: updatedCollection,
        message: `Collection '${collection}' migrated successfully`,
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("migrate collection", error);
    }
  };
}

/**
 * Create a backup of the PocketBase database
 */
export function createBackupDatabaseHandler(pb: PocketBase): ToolHandler {
  return async (args: BackupDatabaseArgs = {}) => {
    try {
      const format = args.format || "json";
      
      // Get all collections
      const collections = await pb.collections.getFullList();
      const backup: any = {
        timestamp: new Date().toISOString(),
        collections: {},
      };
      
      // Export each collection
      for (const collection of collections) {
        const records = await pb.collection(collection.name).getFullList();
        
        backup.collections[collection.name] = {
          schema: collection,
          records,
        };
      }
      
      if (format === "csv") {
        // For CSV, we'll export each collection separately
        const csvData: string[] = [];
        
        for (const [collectionName, data] of Object.entries(backup.collections)) {
          const collectionData = data as any;
          if (collectionData.records.length > 0) {
            csvData.push(`\n--- Collection: ${collectionName} ---`);
            
            // Format records as CSV
            const records = collectionData.records;
            if (records.length > 0) {
              const headers = Object.keys(records[0]);
              csvData.push(headers.join(","));
              
              records.forEach((record: any) => {
                const values = headers.map((header) => {
                  const value = record[header];
                  return typeof value === "string" && value.includes(",")
                    ? `"${value.replace(/"/g, '""')}"`
                    : String(value || "");
                });
                csvData.push(values.join(","));
              });
            }
          }
        }
        
        return createTextResponse(csvData.join("\n"));
      }
      
      return createJsonResponse(backup);
    } catch (error: unknown) {
      throw handlePocketBaseError("backup database", error);
    }
  };
}

/**
 * Import data into a collection
 */
export function createImportDataHandler(pb: PocketBase): ToolHandler {
  return async (args: ImportDataArgs) => {
    try {
      const { collection, data, mode = "create" } = args;
      const results = {
        created: 0,
        updated: 0,
        errors: [] as string[],
      };
      
      for (const item of data) {
        try {
          switch (mode) {
            case "create":
              await pb.collection(collection).create(item);
              results.created++;
              break;
              
            case "update":
              if (!item.id) {
                results.errors.push("Update mode requires 'id' field in each record");
                continue;
              }
              await pb.collection(collection).update(item.id, item);
              results.updated++;
              break;
              
            case "upsert":
              if (item.id) {
                try {
                  await pb.collection(collection).update(item.id, item);
                  results.updated++;
                } catch {
                  await pb.collection(collection).create(item);
                  results.created++;
                }
              } else {
                await pb.collection(collection).create(item);
                results.created++;
              }
              break;
              
            default:
              throw new McpError(
                ErrorCode.InvalidParams,
                `Unsupported import mode: ${mode}`
              );
          }
        } catch (error: any) {
          results.errors.push(`Failed to import record: ${error.message}`);
        }
      }
      
      return createJsonResponse({
        success: true,
        results,
        message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`,
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("import data", error);
    }
  };
}

/**
 * Manage collection indexes
 */
export function createManageIndexesHandler(pb: PocketBase): ToolHandler {
  return async (args: ManageIndexesArgs) => {
    try {
      const { collection, action, index } = args;
      
      switch (action) {
        case "list": {
          const collectionInfo = await pb.collections.getOne(collection);
          return createJsonResponse({
            collection,
            indexes: collectionInfo.indexes || [],
          });
        }
          
        case "create": {
          if (!index) {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Index configuration required for create action"
            );
          }
          
          const currentCollection = await pb.collections.getOne(collection);
          const currentIndexes = currentCollection.indexes || [];
          
          // Add new index
          const newIndexes = [...currentIndexes, index];
          
          await pb.collections.update(collection, {
            indexes: newIndexes,
          });
          
          return createJsonResponse({
            success: true,
            message: `Index '${index.name}' created successfully`,
            indexes: newIndexes,
          });
        }
          
        case "delete": {
          if (!index?.name) {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Index name required for delete action"
            );
          }
          
          const collectionToUpdate = await pb.collections.getOne(collection);
          const filteredIndexes = (collectionToUpdate.indexes || []).filter(
            (idx: any) => idx.name !== index.name
          );
          
          await pb.collections.update(collection, {
            indexes: filteredIndexes,
          });
          
          return createJsonResponse({
            success: true,
            message: `Index '${index.name}' deleted successfully`,
            indexes: filteredIndexes,
          });
        }
          
        default:
          throw new McpError(
            ErrorCode.InvalidParams,
            `Unsupported index action: ${action}`
          );
      }
    } catch (error: unknown) {
      throw handlePocketBaseError("manage indexes", error);
    }
  };
}