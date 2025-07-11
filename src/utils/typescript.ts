/**
 * Utility functions for TypeScript code parsing and generation
 */

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Convert string to PascalCase (alias for backward compatibility)
 */
export function pascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Map PocketBase field types to TypeScript types
 */
export function mapPbTypeToTsType(pbType: string, options?: any): string {
  switch (pbType) {
    case "text":
    case "email":
    case "url":
    case "editor":
    case "select":
      return "string";
    case "number":
      return "number";
    case "bool":
      return "boolean";
    case "date":
    case "autodate":
      return "string"; // ISO date string
    case "json":
      return "any";
    case "file":
      return options?.multiple ? "string[]" : "string";
    case "relation":
      return options?.multiple ? "string[]" : "string";
    default:
      return "any";
  }
}

/**
 * Map PocketBase field types to TypeScript types (alias for backward compatibility)
 */
export function mapPocketBaseTypeToTypeScript(pbType: string, options?: any): string {
  return mapPbTypeToTsType(pbType, options);
}

/**
 * Analyze TypeScript source code to extract interface definitions
 * This is a simplified parser for basic interface extraction
 */
export function analyzeTypeScriptForSchema(sourceCode: string, options: any): any {
  const collections: any[] = [];
  
  // Simple regex-based parsing for interface definitions
  const interfaceRegex = /interface\s+(\w+)\s*{([^}]*)}/g;
  let match: RegExpExecArray | null;
  
  match = interfaceRegex.exec(sourceCode);
  while (match !== null) {
    const interfaceName: string = match[1];
    const interfaceBody: string = match[2];
    
    // Skip if not a collection-like interface
    if (!interfaceName.toLowerCase().includes("collection") && 
        !interfaceName.toLowerCase().includes("record") &&
        !interfaceName.toLowerCase().includes("model")) {
      continue;
    }
    
    const fields: any[] = [];
    
    // Parse fields from interface body
    const fieldRegex = /(\w+)\??:\s*([^;\n]+)/g;
    let fieldMatch: RegExpExecArray | null;
    
    fieldMatch = fieldRegex.exec(interfaceBody);
    while (fieldMatch !== null) {
      const fieldName: string = fieldMatch[1];
      const fieldType: string = fieldMatch[2].trim();
      
      // Skip common metadata fields
      if (["id", "created", "updated", "collectionId", "collectionName"].includes(fieldName)) {
        continue;
      }
      
      fields.push({
        name: fieldName,
        type: mapTsTypeToPbType(fieldType),
        required: !fieldMatch[0].includes("?"),
      });
      
      fieldMatch = fieldRegex.exec(interfaceBody);
    }
    
    if (fields.length > 0) {
      collections.push({
        name: interfaceName.toLowerCase().replace(/collection|record|model/gi, ""),
        type: "base",
        fields,
      });
    }
    
    match = interfaceRegex.exec(sourceCode);
  }
  
  return collections;
}

/**
 * Map TypeScript types back to PocketBase field types
 */
function mapTsTypeToPbType(tsType: string): string {
  const cleanType = tsType.replace(/\[\]$/, "").trim();
  
  switch (cleanType) {
    case "string":
      return "text";
    case "number":
      return "number";
    case "boolean":
      return "bool";
    case "Date":
      return "date";
    case "any":
    case "object":
      return "json";
    default:
      if (tsType.includes("[]")) {
        return "relation"; // Assume array types are relations
      }
      return "text";
  }
}