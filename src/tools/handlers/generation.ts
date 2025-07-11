import type PocketBase from "pocketbase";
import type {
  ToolHandler,
  GeneratePbSchemaArgs,
  GenerateTypescriptInterfacesArgs
} from "../../types/index.ts";
import { handlePocketBaseError } from "../../utils/errors.ts";
import { createTextResponse, createJsonResponse } from "../../utils/response.ts";
import { analyzeTypeScriptForSchema, toPascalCase, mapPocketBaseTypeToTypeScript } from "../../utils/typescript.ts";

/**
 * Generate a PocketBase schema based on TypeScript interfaces or database diagram
 */
export function createGeneratePbSchemaHandler(pb: PocketBase): ToolHandler {
  return async (args: GeneratePbSchemaArgs) => {
    try {
      const { sourceCode, options = {} } = args;
      const includeAuth = options.includeAuthentication ?? true;
      const includeTimestamps = options.includeTimestamps ?? true;

      // Analyze TypeScript source code
      const interfaces = analyzeTypeScriptForSchema(sourceCode, options);

      if (interfaces.length === 0) {
        return createTextResponse("No TypeScript interfaces found in the provided source code.");
      }

      const collections = [];

      // Generate collections from interfaces
      for (const iface of interfaces) {
        const fields = [];

        // Add standard fields if requested
        if (includeTimestamps) {
          fields.push(
            {
              name: "created",
              type: "autodate",
              required: false,
              system: true,
              onCreate: true,
              onUpdate: false,
            },
            {
              name: "updated",
              type: "autodate",
              required: false,
              system: true,
              onCreate: true,
              onUpdate: true,
            }
          );
        }

        // Convert interface properties to PocketBase fields
        for (const prop of iface.properties) {
          const field: any = {
            name: prop.name,
            type: mapTypeScriptToPocketBase(prop.type),
            required: !prop.optional,
          };

          // Add type-specific options
          if (field.type === "text" && prop.type.includes("email")) {
            field.type = "email";
          } else if (field.type === "text" && prop.type.includes("url")) {
            field.type = "url";
          } else if (field.type === "text" && prop.type.includes("Date")) {
            field.type = "date";
          }

          fields.push(field);
        }

        const collection = {
          name: iface.name.toLowerCase(),
          type: "base" as const,
          fields,
          listRule: "",
          viewRule: "",
          createRule: "",
          updateRule: "",
          deleteRule: "",
        };

        collections.push(collection);
      }

      // Add authentication collection if requested
      if (includeAuth) {
        const authCollection = {
          name: "users",
          type: "auth" as const,
          fields: [
            {
              name: "name",
              type: "text",
              required: false,
            },
            {
              name: "avatar",
              type: "file",
              required: false,
              options: {
                maxSelect: 1,
                maxSize: 5242880,
                mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif"],
              },
            },
          ],
          listRule: "id = @request.auth.id",
          viewRule: "id = @request.auth.id",
          createRule: "",
          updateRule: "id = @request.auth.id",
          deleteRule: "id = @request.auth.id",
        };

        collections.unshift(authCollection);
      }

      const schema = {
        collections,
        generatedAt: new Date().toISOString(),
        source: "TypeScript interfaces",
      };

      return createJsonResponse(schema);
    } catch (error: unknown) {
      throw handlePocketBaseError("generate PocketBase schema", error);
    }
  };
}

/**
 * Generate TypeScript interfaces from PocketBase collections
 */
export function createGenerateTypescriptInterfacesHandler(pb: PocketBase): ToolHandler {
  return async (args: GenerateTypescriptInterfacesArgs = {}) => {
    try {
      const { collections: targetCollections = [], options = {} } = args;
      const includeRelations = options.includeRelations ?? true;

      // Get all collections or specific ones
      const allCollections = await pb.collections.getFullList();
      const collectionsToProcess = targetCollections.length > 0
        ? allCollections.filter(c => targetCollections.includes(c.name))
        : allCollections;

      const interfaces: string[] = [];

      // Generate base record interface
      interfaces.push("// Base record interface");
      interfaces.push("export interface BaseRecord {");
      interfaces.push("  id: string;");
      interfaces.push("  created: string;");
      interfaces.push("  updated: string;");
      interfaces.push("}");
      interfaces.push("");

      // Generate interfaces for each collection
      for (const collection of collectionsToProcess) {
        const interfaceName = toPascalCase(collection.name);
        const fields = collection.fields || [];

        interfaces.push(`// ${collection.name} collection`);
        interfaces.push(`export interface ${interfaceName} extends BaseRecord {`);

        for (const field of fields) {
          if (field.system) continue; // Skip system fields

          const fieldType = mapPocketBaseTypeToTypeScript(field.type, field);
          const optional = !field.required ? "?" : "";

          if (includeRelations && field.type === "relation") {
            const relatedCollection = field.options?.collectionId;
            if (relatedCollection) {
              const relatedCollectionName = allCollections.find(
                c => c.id === relatedCollection
              )?.name;

              if (relatedCollectionName) {
                const relatedInterface = toPascalCase(relatedCollectionName);
                const isMultiple = field.options?.maxSelect !== 1;

                interfaces.push(
                  `  ${field.name}${optional}: ${isMultiple ? `${relatedInterface}[]` : relatedInterface};`
                );
                continue;
              }
            }
          }

          interfaces.push(`  ${field.name}${optional}: ${fieldType};`);
        }

        interfaces.push("}");
        interfaces.push("");
      }

      // Add utility types
      interfaces.push("// Utility types");
      interfaces.push("export type RecordId = string;");
      interfaces.push("export type RecordTimestamp = string;");
      interfaces.push("");

      // Add collection names type
      const collectionNames = collectionsToProcess.map(c => `"${c.name}"`).join(" | ");
      interfaces.push(`export type CollectionName = ${collectionNames};`);

      const result = interfaces.join("\n");
      return createTextResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("generate TypeScript interfaces", error);
    }
  };
}

/**
 * Helper function to map TypeScript types to PocketBase field types
 */
function mapTypeScriptToPocketBase(tsType: string): string {
  const type = tsType.toLowerCase();

  if (type.includes("string")) return "text";
  if (type.includes("number")) return "number";
  if (type.includes("boolean")) return "bool";
  if (type.includes("date")) return "date";
  if (type.includes("email")) return "email";
  if (type.includes("url")) return "url";
  if (type.includes("[]")) return "json";
  if (type.includes("object") || type.includes("{")) return "json";

  return "text"; // Default fallback
}
