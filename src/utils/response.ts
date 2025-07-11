import type { ToolResponse } from "../types/index.js";

/**
 * Create a standardized tool response with JSON content
 */
export function createJsonResponse(data: any): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Create a standardized tool response with plain text content
 */
export function createTextResponse(text: string): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

/**
 * Create a success response with a message and optional data
 */
export function createSuccessResponse(
  message: string,
  data?: any
): ToolResponse {
  const response = { message };
  if (data !== undefined) {
    Object.assign(response, { data });
  }
  return createJsonResponse(response);
}

/**
 * Format CSV data for export responses
 */
export function formatCsvData(
  collections: Array<[
    string,
    { schema: any[]; records: Record<string, any>[] }
  ]>
): ToolResponse {
  let csv = "";
  
  for (const [collectionName, data] of collections) {
    csv += `Collection: ${collectionName}\n`;
    csv += `Schema:\n${JSON.stringify(data.schema, null, 2)}\n`;
    csv += "Records:\n";
    
    if (data.records.length > 0) {
      const headers = Object.keys(data.records[0]);
      csv += `${headers.join(",")}\n`;
      
      data.records.forEach((record) => {
        const values = headers.map((header) => {
          const value = record[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : String(value || "");
        });
        csv += `${values.join(",")}\n`;
      });
    }
    csv += "\n";
  }
  
  return createTextResponse(csv);
}