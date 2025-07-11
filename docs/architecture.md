# Architecture Documentation

This document describes the system architecture, design decisions, and implementation patterns of the PocketBase MCP Server.

## System Overview

The PocketBase MCP Server is a Model Context Protocol (MCP) server that provides seamless integration between MCP-compatible applications and PocketBase databases. It follows a modular, extensible architecture designed for maintainability and scalability.

## Architecture Principles

### 1. Modular Design
- **Separation of Concerns**: Each component has a single, well-defined responsibility
- **Loose Coupling**: Components interact through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together

### 2. Extensibility
- **Plugin Architecture**: New tools can be added without modifying core components
- **Schema-Driven**: Tool definitions are declarative and type-safe
- **Handler Pattern**: Business logic is encapsulated in reusable handlers

### 3. Type Safety
- **TypeScript First**: Full type coverage throughout the codebase
- **Schema Validation**: Input validation using JSON Schema
- **Interface Contracts**: Clear type definitions for all components

## Project Structure

```
src/
├── config/              # Configuration management
│   ├── cli.ts          # Command-line interface setup
│   ├── environment.ts  # Environment variable handling
│   └── index.ts        # Configuration exports
├── tools/              # Tool definitions and implementations
│   ├── schemas/        # Input validation schemas
│   │   ├── collection.ts
│   │   ├── record.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── handlers/       # Business logic implementations
│   │   ├── collection.ts
│   │   ├── record.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   └── index.ts        # Tool registry
├── types/              # TypeScript type definitions
│   ├── index.ts        # Common types
│   └── pocketbase.d.ts # PocketBase-specific types
├── utils/              # Shared utilities
│   ├── errors.ts       # Error handling utilities
│   ├── response.ts     # Response formatting utilities
│   └── typescript.ts   # TypeScript parsing utilities
├── index.ts            # Application entry point
└── server.ts           # MCP server configuration
```

## Core Components

### 1. Configuration Layer (`src/config/`)

**Purpose**: Centralized configuration management

**Components**:
- `cli.ts`: Command-line argument parsing using yargs
- `environment.ts`: Environment variable validation and defaults
- `index.ts`: Unified configuration interface

**Design Patterns**:
- **Factory Pattern**: Configuration objects are created based on environment
- **Validation**: All configuration is validated at startup
- **Defaults**: Sensible defaults for optional parameters

### 2. Tool System (`src/tools/`)

**Purpose**: Modular tool definition and execution system

#### Schemas (`src/tools/schemas/`)
**Responsibility**: Input validation and documentation

```typescript
// Example schema structure
export const toolSchema = {
  type: "object" as const,
  properties: {
    required_param: {
      type: "string" as const,
      description: "Parameter description"
    }
  },
  required: ["required_param" as const]
};
```

**Benefits**:
- **Type Safety**: Compile-time validation of schema definitions
- **Documentation**: Self-documenting API through schema descriptions
- **Validation**: Runtime input validation

#### Handlers (`src/tools/handlers/`)
**Responsibility**: Business logic implementation

```typescript
// Example handler structure
export function createToolHandler(pb: PocketBase) {
  return async (args: ToolArgs) => {
    try {
      // Business logic here
      const result = await pb.collection('example').getList();
      return createJsonResponse(result);
    } catch (error) {
      return handlePocketBaseError(error, 'Operation failed');
    }
  };
}
```

**Design Patterns**:
- **Factory Pattern**: Handlers are created with dependencies injected
- **Error Boundary**: Consistent error handling across all tools
- **Response Formatting**: Standardized response structure

### 3. Utility Layer (`src/utils/`)

**Purpose**: Shared functionality and cross-cutting concerns

#### Error Handling (`src/utils/errors.ts`)
- **Centralized Error Processing**: All PocketBase errors are handled consistently
- **Error Classification**: Different error types are handled appropriately
- **User-Friendly Messages**: Technical errors are translated to user-friendly messages

#### Response Formatting (`src/utils/response.ts`)
- **Consistent Structure**: All responses follow the same format
- **Type Safety**: Response types are enforced
- **Content Types**: Support for different content types (JSON, text)

#### TypeScript Utilities (`src/utils/typescript.ts`)
- **Code Generation**: TypeScript interface generation from PocketBase schemas
- **Schema Parsing**: TypeScript interface parsing for schema generation
- **Type Mapping**: Bidirectional type mapping between TypeScript and PocketBase

### 4. Type System (`src/types/`)

**Purpose**: Centralized type definitions

- **Common Types**: Shared interfaces and types
- **PocketBase Extensions**: Extended type definitions for PocketBase
- **Tool Interfaces**: Type definitions for tool system

## Design Patterns

### 1. Factory Pattern

**Usage**: Tool handler creation, configuration objects

**Benefits**:
- **Dependency Injection**: Dependencies are provided at creation time
- **Testability**: Easy to mock dependencies for testing
- **Flexibility**: Different implementations can be swapped easily

### 2. Strategy Pattern

**Usage**: Error handling, response formatting

**Benefits**:
- **Extensibility**: New strategies can be added without modifying existing code
- **Separation of Concerns**: Different strategies handle different scenarios
- **Maintainability**: Each strategy is focused and easy to understand

### 3. Registry Pattern

**Usage**: Tool registration, schema management

**Benefits**:
- **Discoverability**: All tools are registered in a central location
- **Dynamic Loading**: Tools can be registered at runtime
- **Consistency**: All tools follow the same registration pattern

## Data Flow

### 1. Request Processing

```
MCP Client → MCP Protocol → Server → Tool Handler → PocketBase → Response
```

1. **Request Reception**: MCP server receives tool call request
2. **Tool Resolution**: Tool is looked up in the registry
3. **Input Validation**: Request parameters are validated against schema
4. **Handler Execution**: Tool handler is executed with validated parameters
5. **PocketBase Interaction**: Handler interacts with PocketBase API
6. **Response Formatting**: Result is formatted according to MCP protocol
7. **Response Transmission**: Formatted response is sent back to the MCP client

### 2. Error Handling Flow

```
Error → Error Handler → Error Classification → User Message → Response
```

1. **Error Capture**: Errors are caught at the handler level
2. **Error Processing**: Errors are processed by utility functions
3. **Error Classification**: Errors are classified by type and severity
4. **Message Generation**: User-friendly error messages are generated
5. **Response Creation**: Error responses are formatted consistently

## Performance Considerations

### 1. Connection Management
- **Connection Reuse**: PocketBase client is reused across requests
- **Connection Pooling**: Efficient connection management
- **Timeout Handling**: Appropriate timeouts for long-running operations

### 2. Memory Management
- **Streaming**: Large datasets are processed in streams where possible
- **Pagination**: Large result sets are paginated
- **Garbage Collection**: Minimal object creation in hot paths

### 3. Caching Strategy
- **Schema Caching**: Collection schemas are cached to reduce API calls
- **Response Caching**: Appropriate caching for read-heavy operations
- **Cache Invalidation**: Proper cache invalidation strategies

## Security Considerations

### 1. Input Validation
- **Schema Validation**: All inputs are validated against JSON schemas
- **Sanitization**: User inputs are sanitized before processing
- **Type Safety**: TypeScript provides compile-time type checking

### 2. Authentication
- **Credential Management**: Secure handling of authentication credentials
- **Token Management**: Proper token lifecycle management
- **Permission Checking**: Appropriate permission checks for operations

### 3. Error Information
- **Information Disclosure**: Error messages don't expose sensitive information
- **Logging**: Appropriate logging without exposing credentials
- **Audit Trail**: Operations are logged for security auditing

## Testing Strategy

### 1. Unit Testing
- **Handler Testing**: Individual tool handlers are unit tested
- **Utility Testing**: Utility functions have comprehensive test coverage
- **Schema Testing**: Schema validation is thoroughly tested

### 2. Integration Testing
- **PocketBase Integration**: Integration with PocketBase is tested
- **MCP Protocol**: MCP protocol compliance is verified
- **End-to-End**: Complete workflows are tested

### 3. Test Structure
```
tests/
├── unit/           # Unit tests
│   ├── handlers/
│   ├── utils/
│   └── schemas/
└── integration/    # Integration tests
    ├── tools/
    └── server/
```

## Deployment Architecture

### 1. Distribution
- **NPM Package**: Distributed as a global NPM package
- **Binary Distribution**: Compiled to standalone executable
- **Docker Support**: Container-based deployment option

### 2. Configuration
- **Environment Variables**: Production configuration via environment
- **CLI Arguments**: Development configuration via command line
- **Configuration Files**: Optional configuration file support

### 3. Monitoring
- **Health Checks**: Built-in health check endpoints
- **Metrics**: Performance and usage metrics
- **Logging**: Structured logging for operations

## Future Considerations

### 1. Scalability
- **Horizontal Scaling**: Support for multiple server instances
- **Load Balancing**: Distribution of requests across instances
- **State Management**: Stateless design for scalability

### 2. Extensibility
- **Plugin System**: More sophisticated plugin architecture
- **Custom Handlers**: User-defined custom tool handlers
- **Middleware**: Request/response middleware system

### 3. Performance
- **Caching Layer**: More sophisticated caching strategies
- **Connection Pooling**: Advanced connection management
- **Async Processing**: Background job processing capabilities