/**
 * Tool schema registry - exports all tool input schemas
 */

// Collection schemas
export {
  createCollectionSchema,
  deleteCollectionSchema,
  getCollectionSchemaSchema,
  listCollectionsSchema,
  truncateCollectionSchema,
} from "./collection.ts";

// Record schemas
export {
  createRecordSchema,
  listRecordsSchema,
  updateRecordSchema,
  deleteRecordSchema,
} from "./record.ts";

// Auth schemas
export {
  authenticateUserSchema,
  createUserSchema,
} from "./auth.ts";

// Analysis schemas
export {
  analyzeCollectionDataSchema,
  queryCollectionSchema,
} from "./analysis.ts";

// Migration schemas
export {
  migrateCollectionSchema,
  backupDatabaseSchema,
  importDataSchema,
  manageIndexesSchema,
} from "./migration.ts";

// Generation schemas
export {
  generatePbSchemaSchema,
  generateTypescriptInterfacesSchema,
} from "./generation.ts";

// File schemas
export {
  uploadFileSchema,
  downloadFileSchema,
  uploadFileFromUrlSchema,
} from "./file.ts";
