/**
 * Tool input schemas for collection-related operations
 */

export const createCollectionSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Collection name",
    },
    type: {
      type: "string",
      description: "Collection type (base, auth, view)",
      enum: ["base", "auth", "view"],
      default: "base",
    },
    fields: {
      type: "array",
      description: "Collection fields configuration",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Field name" },
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
          system: {
            type: "boolean",
            description: "Whether this is a system field",
          },
          unique: {
            type: "boolean",
            description: "Whether the field should have unique values",
          },
          min: {
            type: "number",
            description: "Minimum text length or numeric value",
          },
          max: {
            type: "number",
            description: "Maximum text length or numeric value",
          },
          pattern: {
            type: "string",
            description: "Validation regex pattern for text fields",
          },
          autogeneratePattern: {
            type: "string",
            description: "Pattern for autogenerating field values (for text fields)",
          },
          options: {
            type: "object",
            description: "Field-specific options",
            properties: {
              values: {
                type: "array",
                description: "Predefined values for select fields",
                items: { type: "string" },
              },
              maxSelect: {
                type: "number",
                description: "Maximum number of selectable options",
              },
            },
          },
          collectionId: {
            type: "string",
            description: "Target collection ID for relation fields",
          },
          cascadeDelete: {
            type: "boolean",
            description: "Whether to delete related records when the parent is deleted",
          },
          maxSelect: {
            type: "number",
            description: "Maximum number of relations (1 for single relation, > 1 for multiple)",
          },
          onCreate: {
            type: "boolean",
            description: "Whether to set date on record creation (for autodate fields)",
          },
          onUpdate: {
            type: "boolean",
            description: "Whether to update date on record update (for autodate fields)",
          },
          presentable: {
            type: "boolean",
            description: "Whether the field can be used as a presentable field in the UI",
          },
          hidden: {
            type: "boolean",
            description: "Whether the field is hidden in the UI",
          },
        },
        required: ["name", "type"],
      },
    },
    listRule: {
      type: "string",
      description: "Rule for listing records",
    },
    viewRule: {
      type: "string",
      description: "Rule for viewing records",
    },
    createRule: {
      type: "string",
      description: "Rule for creating records",
    },
    updateRule: {
      type: "string",
      description: "Rule for updating records",
    },
    deleteRule: {
      type: "string",
      description: "Rule for deleting records",
    },
    indexes: {
      type: "array",
      items: { type: "string" },
      description: "Collection indexes",
    },
    viewQuery: {
      type: "string",
      description: "SQL query for view collections",
    },
    passwordAuth: {
      type: "object",
      description: "Password authentication settings for auth collections",
      properties: {
        enabled: { type: "boolean" },
        identityFields: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  required: ["name", "fields"],
};

export const deleteCollectionSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name or ID to delete",
    },
  },
  required: ["collection"],
};

export const getCollectionSchemaSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
  },
  required: ["collection"],
};