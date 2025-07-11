# Developer Guide: Adding New Tools

This guide provides technical documentation for developers who want to extend the PocketBase MCP Server with new tools.

## Architecture Overview

The server follows a modular architecture with clear separation of concerns:

```
src/
├── tools/
│   ├── schemas/          # Tool input schemas (validation)
│   ├── handlers/         # Tool implementation logic
│   └── index.ts         # Tool registry
├── utils/               # Shared utilities
├── types/               # TypeScript type definitions
└── server.ts           # Main server configuration
```

## Step-by-Step Guide to Add a New Tool

### 1. Define the Tool Schema

Create or update a schema file in `src/tools/schemas/`:

```typescript
// src/tools/schemas/example.ts
export const myNewToolSchema = {
  type: "object" as const,
  properties: {
    collection: {
      type: "string" as const,
      description: "Collection name"
    },
    options: {
      type: "object" as const,
      properties: {
        limit: { type: "number" as const }
      }
    }
  },
  required: ["collection" as const]
};
```

### 2. Implement the Tool Handler

Create or update a handler file in `src/tools/handlers/`:

```typescript
// src/tools/handlers/example.ts
import type { PocketBase } from 'pocketbase';
import { createJsonResponse } from '../../utils/response.js';
import { handlePocketBaseError } from '../../utils/errors.js';

export function createMyNewToolHandler(pb: PocketBase) {
  return async (args: { collection: string; options?: { limit?: number } }) => {
    try {
      const { collection, options = {} } = args;
      const { limit = 50 } = options;
      
      // Your tool implementation here
      const result = await pb.collection(collection).getList(1, limit);
      
      return createJsonResponse({
        success: true,
        data: result,
        message: `Retrieved ${result.items.length} items from ${collection}`
      });
    } catch (error) {
      return handlePocketBaseError(error, 'Failed to execute my new tool');
    }
  };
}
```

### 3. Export Schema and Handler

Update the respective index files:

```typescript
// src/tools/schemas/index.ts
export { myNewToolSchema } from './example.js';

// src/tools/handlers/index.ts
export { createMyNewToolHandler } from './example.js';
```

### 4. Register the Tool

Add the tool to the main server configuration:

```typescript
// src/server.ts
import { myNewToolSchema, createMyNewToolHandler } from './tools/index.js';

// In the tools array:
{
  name: "my_new_tool",
  description: "Description of what this tool does",
  inputSchema: myNewToolSchema,
  handler: createMyNewToolHandler(pb)
}
```

## Best Practices

### Error Handling
Always use the standardized error handling utility:

```typescript
import { handlePocketBaseError } from '../../utils/errors.js';

try {
  // Your logic here
} catch (error) {
  return handlePocketBaseError(error, 'Custom error message');
}
```

### Response Formatting
Use the response utilities for consistent output:

```typescript
import { createJsonResponse, createTextResponse } from '../../utils/response.js';

// For JSON responses
return createJsonResponse({ data: result });

// For text responses
return createTextResponse('Operation completed successfully');
```

### Type Safety
Define proper TypeScript types:

```typescript
interface MyToolArgs {
  collection: string;
  options?: {
    limit?: number;
    sort?: string;
  };
}

export function createMyNewToolHandler(pb: PocketBase) {
  return async (args: MyToolArgs) => {
    // Implementation
  };
}
```

### Schema Validation
Ensure your schema properly validates input:

```typescript
export const myToolSchema = {
  type: "object" as const,
  properties: {
    required_field: {
      type: "string" as const,
      description: "This field is required"
    },
    optional_field: {
      type: "number" as const,
      description: "This field is optional",
      minimum: 1,
      maximum: 1000
    }
  },
  required: ["required_field" as const]
};
```

## Testing Your New Tool

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Test the server**:
   ```bash
   node build/src/index.js --help
   ```

3. **Verify tool registration**:
   The tool should appear in the MCP tool list when connected to your MCP client.

## Example: Complete Tool Implementation

Here's a complete example of adding a `count_records` tool:

```typescript
// src/tools/schemas/record.ts (add to existing file)
export const countRecordsSchema = {
  type: "object" as const,
  properties: {
    collection: {
      type: "string" as const,
      description: "Collection name to count records in"
    },
    filter: {
      type: "string" as const,
      description: "Optional filter expression"
    }
  },
  required: ["collection" as const]
};

// src/tools/handlers/record.ts (add to existing file)
export function createCountRecordsHandler(pb: PocketBase) {
  return async (args: { collection: string; filter?: string }) => {
    try {
      const { collection, filter } = args;
      
      const result = await pb.collection(collection).getList(1, 1, {
        filter: filter || '',
        skipTotal: false
      });
      
      return createJsonResponse({
        collection,
        totalCount: result.totalItems,
        filter: filter || 'none'
      });
    } catch (error) {
      return handlePocketBaseError(error, `Failed to count records in ${args.collection}`);
    }
  };
}

// src/server.ts (add to tools array)
{
  name: "count_records",
  description: "Count the total number of records in a collection with optional filtering",
  inputSchema: countRecordsSchema,
  handler: createCountRecordsHandler(pb)
}
```

##### Debugging Tips

- Use `console.log()` for debugging during development
- Check the MCP server logs in your MCP client's developer console
- Validate your schema using online JSON Schema validators
- Test with minimal examples before adding complex logic

## Code Quality Guidelines

### File Organization
- Keep related schemas in the same file (e.g., all record-related schemas in `record.ts`)
- Group handlers by functionality
- Use descriptive file and function names

### Documentation
- Add JSDoc comments to all exported functions
- Include usage examples in complex schemas
- Document any non-obvious business logic

### Performance
- Use appropriate PocketBase query options (limit, fields, etc.)
- Implement proper error boundaries
- Consider caching for expensive operations

### Security
- Validate all input parameters
- Use proper authentication when required
- Sanitize user-provided filter expressions