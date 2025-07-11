import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Create a standardized MCP error with proper error message formatting
 */
export function createMcpError(
  code: ErrorCode,
  message: string,
  error?: unknown
): McpError {
  const errorMessage = error
    ? `${message}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    : message;

  return new McpError(code, errorMessage);
}

/**
 * Handle and format errors from PocketBase operations
 */
export function handlePocketBaseError(operation: string, error: unknown): McpError {
  const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
  return new McpError(
    ErrorCode.InternalError,
    `Failed to ${operation}: ${errorMessage}`
  );
}

/**
 * Validate required parameters and throw appropriate errors
 */
export function validateRequiredParams(
  params: Record<string, any>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Required parameter '${field}' is missing`
      );
    }
  }
}

/**
 * Validate enum values
 */
export function validateEnumValue(
  value: any,
  allowedValues: string[],
  fieldName: string
): void {
  if (value && !allowedValues.includes(value)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid value for ${fieldName}. Allowed values: ${allowedValues.join(", ")}`
    );
  }
}
