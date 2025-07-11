import type PocketBase from "pocketbase";
import type {
  ToolHandler,
  AnalyzeCollectionDataArgs,
  QueryCollectionArgs
} from "../../types/index.ts";
import { handlePocketBaseError } from "../../utils/errors.ts";
import { createJsonResponse } from "../../utils/response.ts";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Analyze data patterns and provide insights about a collection
 */
export function createAnalyzeCollectionDataHandler(pb: PocketBase): ToolHandler {
  return async (args: AnalyzeCollectionDataArgs) => {
    try {
      const { collection, options = {} } = args;
      const sampleSize = options.sampleSize || 100;

      // Get collection info and records
      const collectionInfo = await pb.collections.getOne(collection);
      const records = await pb
        .collection(collection)
        .getList(1, sampleSize);

      // Initialize analysis structure
      const analysis = {
        collectionName: collection,
        recordCount: records.totalItems,
        fields: [] as any[],
        insights: [] as string[],
      };

      if (records.items.length === 0) {
        analysis.insights.push("No records available for analysis");
        return createJsonResponse(analysis);
      }

      // Analyze each field
      const fields = collectionInfo.fields || [];

      for (const field of fields) {
        if (options.fields && !options.fields.includes(field.name)) {
          continue;
        }

        const fieldAnalysis = {
          name: field.name,
          type: field.type,
          nonNullValues: 0,
          uniqueValues: new Set(),
          min: null as any,
          max: null as any,
        };

        // Analyze field values
        for (const record of records.items) {
          const value = record[field.name];

          if (value !== null && value !== undefined) {
            fieldAnalysis.nonNullValues++;
            fieldAnalysis.uniqueValues.add(JSON.stringify(value));

            // For numeric fields, track min/max
            if (field.type === "number") {
              if (fieldAnalysis.min === null || value < fieldAnalysis.min) {
                fieldAnalysis.min = value;
              }
              if (fieldAnalysis.max === null || value > fieldAnalysis.max) {
                fieldAnalysis.max = value;
              }
            }
          }
        }

        // Process analysis results
        const processedAnalysis = {
          ...fieldAnalysis,
          uniqueValueCount: fieldAnalysis.uniqueValues.size,
          fillRate: `${(
            (fieldAnalysis.nonNullValues / records.items.length) * 100
          ).toFixed(2)}%`,
          uniqueValues: undefined, // Remove the Set before serializing
        };

        analysis.fields.push(processedAnalysis);

        // Generate insights
        if (
          processedAnalysis.uniqueValueCount === records.items.length &&
          records.items.length > 5
        ) {
          analysis.insights.push(
            `Field '${field.name}' contains all unique values, consider using it as an identifier.`
          );
        }

        if (processedAnalysis.nonNullValues === 0) {
          analysis.insights.push(
            `Field '${field.name}' has no values. Consider removing it or ensuring it's populated.`
          );
        }
      }

      return createJsonResponse(analysis);
    } catch (error: unknown) {
      throw handlePocketBaseError("analyze collection data", error);
    }
  };
}

/**
 * Advanced query with filtering, sorting, and aggregation
 */
export function createQueryCollectionHandler(pb: PocketBase): ToolHandler {
  return async (args: QueryCollectionArgs) => {
    try {
      const collection = pb.collection(args.collection);
      const options: any = {};

      if (args.filter) options.filter = args.filter;
      if (args.sort) options.sort = args.sort;
      if (args.expand) options.expand = args.expand;

      const records = await collection.getList(1, 100, options);

      const result: any = { items: records.items };

      if (args.aggregate) {
        const aggregations: any = {};
        for (const [name, expr] of Object.entries(args.aggregate)) {
          const [func, field] = (expr as string).split("(");
          const cleanField = field.replace(")", "");

          switch (func) {
            case "sum":
              aggregations[name] = records.items.reduce(
                (sum: number, record: any) => sum + (record[cleanField] || 0),
                0
              );
              break;
            case "avg":
              aggregations[name] =
                records.items.reduce(
                  (sum: number, record: any) => sum + (record[cleanField] || 0),
                  0
                ) / records.items.length;
              break;
            case "count":
              aggregations[name] = records.items.length;
              break;
            default:
              throw new McpError(
                ErrorCode.InvalidParams,
                `Unsupported aggregation function: ${func}`
              );
          }
        }
        result.aggregations = aggregations;
      }

      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("query collection", error);
    }
  };
}
