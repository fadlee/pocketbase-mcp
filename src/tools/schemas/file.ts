export const uploadFileSchema = {
  type: "object" as const,
  properties: {
    collection: {
      type: "string" as const,
      description: "The name or ID of the collection"
    },
    recordId: {
      type: "string" as const,
      description: "The ID of the record to attach the file to"
    },
    fileField: {
      type: "string" as const,
      description: "The name of the file field in the collection schema"
    },
    fileContent: {
      type: "string" as const,
      description: "The raw content of the file as a string"
    },
    fileName: {
      type: "string" as const,
      description: "The desired name for the uploaded file (e.g., 'report.txt')"
    }
  },
  required: ["collection" as const, "recordId" as const, "fileField" as const, "fileContent" as const, "fileName" as const]
};

export const downloadFileSchema = {
  type: "object" as const,
  properties: {
    collection: {
      type: "string" as const,
      description: "The name or ID of the collection"
    },
    recordId: {
      type: "string" as const,
      description: "The ID of the record containing the file"
    },
    fileField: {
      type: "string" as const,
      description: "The name of the file field"
    }
  },
  required: ["collection" as const, "recordId" as const, "fileField" as const]
};

export const uploadFileFromUrlSchema = {
  type: 'object',
  properties: {
    collection: {
      type: 'string',
      description: 'The name or ID of the collection'
    },
    recordId: {
      type: 'string',
      description: 'The ID of the record to attach the file to'
    },
    fileField: {
      type: 'string',
      description: 'The name of the file field in the collection schema'
    },
    url: {
      type: 'string',
      description: 'The URL to download the file from'
    },
    fileName: {
      type: 'string',
      description: 'Optional custom name for the uploaded file. If not provided, will extract from URL'
    }
  },
  required: ['collection', 'recordId', 'fileField', 'url']
} as const;