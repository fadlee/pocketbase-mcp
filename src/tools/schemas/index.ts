/**
 * Tool schema registry - exports all tool input schemas
 */

// Collection schemas
export {
  createCollectionSchema,
  deleteCollectionSchema,
  getCollectionSchemaSchema,
  listCollectionsSchema,
} from "./collection.js";

// Record schemas
export {
  createRecordSchema,
  listRecordsSchema,
  updateRecordSchema,
  deleteRecordSchema,
} from "./record.js";

// Auth schemas
export {
  authenticateUserSchema,
  createUserSchema,
} from "./auth.js";

// Analysis schemas
export {
  analyzeCollectionDataSchema,
  queryCollectionSchema,
} from "./analysis.js";

// Migration schemas
export {
  migrateCollectionSchema,
  backupDatabaseSchema,
  importDataSchema,
  manageIndexesSchema,
} from "./migration.js";

// Generation schemas
export {
  generatePbSchemaSchema,
  generateTypescriptInterfacesSchema,
} from "./generation.js";