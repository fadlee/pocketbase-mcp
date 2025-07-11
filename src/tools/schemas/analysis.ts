/**
 * Tool input schemas for analysis-related operations
 */

export const analyzeCollectionDataSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name to analyze",
    },
    options: {
      type: "object",
      description: "Analysis options",
      properties: {
        sampleSize: {
          type: "number",
          description: "Number of records to sample for analysis (default: 100)",
        },
        fields: {
          type: "array",
          items: { type: "string" },
          description: "Specific fields to analyze (if not provided, all fields will be analyzed)",
        },
      },
    },
  },
  required: ["collection"],
};

export const queryCollectionSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    filter: {
      type: "string",
      description: "Filter expression",
    },
    sort: {
      type: "string",
      description: "Sort expression",
    },
    aggregate: {
      type: "object",
      description: "Aggregation settings",
    },
    expand: {
      type: "string",
      description: "Relations to expand",
    },
  },
  required: ["collection"],
};