/**
 * Tool input schemas for code generation operations
 */

export const generatePbSchemaSchema = {
  type: "object",
  properties: {
    sourceCode: {
      type: "string",
      description: "TypeScript interface or database diagram to convert to PocketBase schema",
    },
    options: {
      type: "object",
      description: "Generation options",
      properties: {
        includeAuthentication: {
          type: "boolean",
          description: "Whether to include authentication related collections",
        },
        includeTimestamps: {
          type: "boolean",
          description: "Whether to include created/updated timestamps",
        },
      },
    },
  },
  required: ["sourceCode"],
};

export const generateTypescriptInterfacesSchema = {
  type: "object",
  properties: {
    collections: {
      type: "array",
      description: "Collection names to generate interfaces for (empty for all)",
      items: {
        type: "string",
      },
    },
    options: {
      type: "object",
      description: "Generation options",
      properties: {
        includeRelations: {
          type: "boolean",
          description: "Whether to include relation types",
        },
      },
    },
  },
};