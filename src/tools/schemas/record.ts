/**
 * Tool input schemas for record-related operations
 */

export const createRecordSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    data: {
      type: "object",
      description: "Record data with field values matching the collection schema",
    },
    expand: {
      type: "string",
      description: "Comma-separated list of relation fields to expand in the response (e.g. 'author,comments.user')",
    },
    fields: {
      type: "string",
      description: "Comma-separated fields to return in the response (e.g. 'id,title,author')",
    },
  },
  required: ["collection", "data"],
};

export const listRecordsSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    filter: {
      type: "string",
      description: "Filter query using PocketBase filter syntax (e.g. 'status = true && created > \"2022-08-01 10:00:00\"')",
    },
    sort: {
      type: "string",
      description: "Sort field and direction (e.g. '-created,title' for descending created date followed by ascending title)",
    },
    page: {
      type: "number",
      description: "Page number for pagination (default: 1)",
    },
    perPage: {
      type: "number",
      description: "Items per page (default: 50, max: 500)",
    },
    expand: {
      type: "string",
      description: "Comma-separated list of relation fields to expand (e.g. 'author,comments.user')",
    },
    fields: {
      type: "string",
      description: "Comma-separated fields to return in the response (e.g. 'id,title,author')",
    },
    skipTotal: {
      type: "boolean",
      description: "If set to true, the total count query will be skipped to improve performance",
    },
  },
  required: ["collection"],
};

export const updateRecordSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    id: {
      type: "string",
      description: "Record ID",
    },
    data: {
      type: "object",
      description: "Updated record data with field values matching the collection schema. Can use field modifiers like fieldName+, +fieldName, fieldName-.",
    },
    expand: {
      type: "string",
      description: "Comma-separated list of relation fields to expand in the response (e.g. 'author,comments.user')",
    },
    fields: {
      type: "string",
      description: "Comma-separated fields to return in the response (e.g. 'id,title,author')",
    },
  },
  required: ["collection", "id", "data"],
};

export const deleteRecordSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Collection name",
    },
    id: {
      type: "string",
      description: "Record ID",
    },
  },
  required: ["collection", "id"],
};