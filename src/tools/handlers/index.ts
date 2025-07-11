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
} from "./collection.js";

// Record handlers
export {
  createCreateRecordHandler,
  createListRecordsHandler,
  createUpdateRecordHandler,
  createDeleteRecordHandler,
} from "./record.js";

// Auth handlers
export {
  createAuthenticateUserHandler,
  createCreateUserHandler,
} from "./auth.js";

// Analysis handlers
export {
  createAnalyzeCollectionDataHandler,
  createQueryCollectionHandler,
} from "./analysis.js";

// Migration handlers
export {
  createMigrateCollectionHandler,
  createBackupDatabaseHandler,
  createImportDataHandler,
  createManageIndexesHandler,
} from "./migration.js";

// Generation handlers
export {
  createGeneratePbSchemaHandler,
  createGenerateTypescriptInterfacesHandler,
} from "./generation.js";

// File handlers
export {
  createUploadFileHandler,
  createDownloadFileHandler,
  createUploadFileFromUrlHandler
} from './file.js';
