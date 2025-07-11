/**
 * Tool input schemas for migration and backup operations
 */

export const migrateCollectionSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    fields: {
      type: "array",
      description: "New collection fields configuration",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Field name",
          },
          type: {
            type: "string",
            description: "Field type",
            enum: [
              "text",
              "number",
              "bool",
              "email",
              "url",
              "date",
              "select",
              "relation",
              "file",
              "json",
              "editor",
              "autodate",
            ],
          },
          required: {
            type: "boolean",
            description: "Whether the field is required",
          },
          options: {
            type: "object",
            description: "Field-specific options",
          },
        },
        required: ["name", "type"],
      },
    },
    dataTransforms: {
      type: "object",
      description: "Field transformation mappings for converting old field values to new ones",
    },
    name: {
      type: "string",
      description: "Optional new collection name if you want to rename the collection",
    },
    listRule: {
      type: "string",
      description: "Optional new rule for listing records",
    },
    viewRule: {
      type: "string",
      description: "Optional new rule for viewing records",
    },
    createRule: {
      type: "string",
      description: "Optional new rule for creating records",
    },
    updateRule: {
      type: "string",
      description: "Optional new rule for updating records",
    },
    deleteRule: {
      type: "string",
      description: "Optional new rule for deleting records",
    },
  },
  required: ["collection", "fields"],
};

export const backupDatabaseSchema = {
  type: "object",
  properties: {
    format: {
      type: "string",
      enum: ["json", "csv"],
      description: "Export format (default: json)",
    },
  },
};

export const importDataSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    data: {
      type: "array",
      description: "Array of records to import",
      items: {
        type: "object",
      },
    },
    mode: {
      type: "string",
      enum: ["create", "update", "upsert"],
      description: "Import mode (default: create)",
    },
  },
  required: ["collection", "data"],
};

export const manageIndexesSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    action: {
      type: "string",
      enum: ["create", "delete", "list"],
      description: "Action to perform",
    },
    index: {
      type: "object",
      description: "Index configuration (for create)",
      properties: {
        name: {
          type: "string",
        },
        fields: {
          type: "array",
          items: {
            type: "string",
          },
        },
        unique: {
          type: "boolean",
        },
      },
    },
  },
  required: ["collection", "action"],
};