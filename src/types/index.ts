import type { CollectionModel, CollectionField } from "pocketbase";

// Extend PocketBase type definitions
declare module "pocketbase" {
  interface PocketBase {
    admins: {
      authWithPassword(email: string, password: string): Promise<any>;
    };
  }
}

// Tool handler interfaces
export type ToolHandler = (args: any) => Promise<ToolResponse>

export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Collection related types
export interface CollectionFieldConfig {
  name: string;
  type: string;
  required?: boolean;
  system?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  autogeneratePattern?: string;
  collectionId?: string;
  cascadeDelete?: boolean;
  maxSelect?: number;
  onCreate?: boolean;
  onUpdate?: boolean;
  presentable?: boolean;
  hidden?: boolean;
  values?: string[];
  id?: string;
}

export interface CreateCollectionArgs {
  name: string;
  type?: "base" | "auth" | "view";
  fields: CollectionFieldConfig[];
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  indexes?: string[];
  viewQuery?: string;
  passwordAuth?: {
    enabled: boolean;
    identityFields: string[];
  };
}

export interface UpdateCollectionArgs {
  collection: string;
  name?: string;
  type?: "base" | "auth" | "view";
  fields?: CollectionFieldConfig[];
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  indexes?: string[];
  viewQuery?: string;
  passwordAuth?: {
    enabled: boolean;
    identityFields: string[];
  };
}

export interface TruncateCollectionArgs {
  collection: string;
}

// Record related types
export interface CreateRecordArgs {
  collection: string;
  data: Record<string, any>;
  expand?: string;
  fields?: string;
}

export interface ListRecordsArgs {
  collection: string;
  filter?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  expand?: string;
  fields?: string;
  skipTotal?: boolean;
}

export interface UpdateRecordArgs {
  collection: string;
  id: string;
  data: Record<string, any>;
  expand?: string;
  fields?: string;
}

export interface DeleteRecordArgs {
  collection: string;
  id: string;
}

// Auth related types
export interface AuthenticateUserArgs {
  collection?: string;
  email: string;
  password: string;
  autoRefreshThreshold?: number;
}

export interface CreateUserArgs {
  collection?: string;
  email: string;
  password: string;
  passwordConfirm: string;
  verified?: boolean;
  emailVisibility?: boolean;
  additionalData?: Record<string, any>;
}

// Analysis related types
export interface AnalyzeCollectionDataArgs {
  collection: string;
  options?: {
    sampleSize?: number;
    fields?: string[];
  };
}

export interface QueryCollectionArgs {
  collection: string;
  filter?: string;
  sort?: string;
  aggregate?: Record<string, string>;
  expand?: string;
}

// Migration related types
export interface MigrateCollectionArgs {
  collection: string;
  fields: CollectionFieldConfig[];
  dataTransforms?: Record<string, any>;
  name?: string;
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
}

export interface BackupDatabaseArgs {
  format?: "json" | "csv";
}

export interface ImportDataArgs {
  collection: string;
  data: Record<string, any>[];
  mode?: "create" | "update" | "upsert";
}

export interface ManageIndexesArgs {
  collection: string;
  action: "create" | "delete" | "list";
  index?: {
    name: string;
    fields: string[];
    unique?: boolean;
  };
}

// Generation related types
export interface GeneratePbSchemaArgs {
  sourceCode: string;
  options?: {
    includeAuthentication?: boolean;
    includeTimestamps?: boolean;
  };
}

export interface GenerateTypescriptInterfacesArgs {
  collections?: string[];
  options?: {
    includeRelations?: boolean;
  };
}

// File related types
export interface UploadFileArgs {
  collection: string;
  recordId: string;
  fileField: string;
  fileContent: string;
  fileName: string;
}

export interface DownloadFileArgs {
  collection: string;
  recordId: string;
  fileField: string;
}

export interface UploadFileFromUrlArgs {
  collection: string;
  recordId: string;
  fileField: string;
  url: string;
  fileName?: string;
}

// Re-export PocketBase types
export type { CollectionModel, CollectionField };
