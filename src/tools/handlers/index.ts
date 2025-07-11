/**
 * Tool handlers registry - exports all handler creation functions
 */

// Collection handlers
export {
  createCreateCollectionHandler,
  createDeleteCollectionHandler,
  createGetCollectionSchemaHandler,
  createListCollectionsHandler,
  createTruncateCollectionHandler,
} from "./collection.ts";

// Record handlers
export {
  createCreateRecordHandler,
  createListRecordsHandler,
  createUpdateRecordHandler,
  createDeleteRecordHandler,
} from "./record.ts";

// Auth handlers
export {
  createAuthenticateUserHandler,
  createCreateUserHandler,
} from "./auth.ts";

// Analysis handlers
export {
  createAnalyzeCollectionDataHandler,
  createQueryCollectionHandler,
} from "./analysis.ts";

// Migration handlers
export {
  createMigrateCollectionHandler,
  createBackupDatabaseHandler,
  createImportDataHandler,
  createManageIndexesHandler,
} from "./migration.ts";

// Generation handlers
export {
  createGeneratePbSchemaHandler,
  createGenerateTypescriptInterfacesHandler,
} from "./generation.ts";

// File handlers
export {
  createUploadFileHandler,
  createDownloadFileHandler,
  createUploadFileFromUrlHandler
} from './file.js';
