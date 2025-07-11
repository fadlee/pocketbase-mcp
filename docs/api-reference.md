# API Reference

This document provides a comprehensive reference for all available tools in the PocketBase MCP Server.

## Available Tools

### Collection Management

#### `create_collection`
Create a new collection in PocketBase.

**Parameters:**
- `name` (string, required): Collection name
- `type` (string, optional): Collection type (base, auth, view) - default: "base"
- `fields` (array, required): Collection fields configuration
- `listRule` (string, optional): Rule for listing records
- `viewRule` (string, optional): Rule for viewing records
- `createRule` (string, optional): Rule for creating records
- `updateRule` (string, optional): Rule for updating records
- `deleteRule` (string, optional): Rule for deleting records

**Example:**
```typescript
{
  "name": "products",
  "fields": [
    {
      "name": "title",
      "type": "text",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    },
    {
       "hidden": false,
       "id": "select4139270797",
       "maxSelect": 1,
       "name": "status_select",
       "presentable": false,
       "required": false,
       "type": "select",
       "values": [
         "active",
         "inactive",
         "maintenance",
         "retired",
         "disposed"
       ]
     }
  ]
}
```

**Select Field Format:**
 When creating select fields, use this exact structure:
 ```typescript
 {
   "hidden": false,
   "id": "select4139270797",
   "maxSelect": 1,
   "name": "status_select",
   "presentable": false,
   "required": false,
   "type": "select",
   "values": [
     "active",
     "inactive",
     "maintenance",
     "retired",
     "disposed"
   ]
 }
 ```

#### `list_collections`
Retrieve a list of all collections.

**Parameters:**
- `sort` (string, optional): Sort order (default: "-created")

**Example:**
```typescript
{
  "sort": "name"
}
```

#### `delete_collection`
Delete a collection from PocketBase.

**Parameters:**
- `collection` (string, required): Collection name or ID to delete

#### `get_collection_schema`
Get schema details for a collection.

**Parameters:**
- `collection` (string, required): Collection name

#### `truncate_collection`
Delete all records associated with the specified collection.

**Parameters:**
- `collection` (string, required): Collection name or ID to truncate

**Example:**
```typescript
{
  "collection": "products"
}
```

### Record Operations

#### `create_record`
Create a new record in a collection.

**Parameters:**
- `collection` (string, required): Collection name
- `data` (object, required): Record data
- `expand` (string, optional): Relation fields to expand
- `fields` (string, optional): Fields to return

**Example:**
```typescript
{
  "collection": "products",
  "data": {
    "title": "New Product",
    "price": 29.99,
    "description": "A great product"
  }
}
```

#### `list_records`
List records from a collection with optional filters.

**Parameters:**
- `collection` (string, required): Collection name
- `filter` (string, optional): Filter query
- `sort` (string, optional): Sort field and direction
- `page` (number, optional): Page number (default: 1)
- `perPage` (number, optional): Items per page (default: 50)
- `expand` (string, optional): Relation fields to expand
- `fields` (string, optional): Fields to return

**Example:**
```typescript
{
  "collection": "products",
  "filter": "price > 20",
  "sort": "-created",
  "perPage": 10
}
```

#### `update_record`
Update an existing record.

**Parameters:**
- `collection` (string, required): Collection name
- `id` (string, required): Record ID
- `data` (object, required): Updated record data
- `expand` (string, optional): Relation fields to expand
- `fields` (string, optional): Fields to return

#### `delete_record`
Delete a record.

**Parameters:**
- `collection` (string, required): Collection name
- `id` (string, required): Record ID

### Authentication

#### `authenticate_user`
Authenticate a user and get auth token.

**Parameters:**
- `collection` (string, optional): Auth collection name (default: "users")
- `email` (string, required): User email
- `password` (string, required): User password
- `autoRefreshThreshold` (number, optional): Token refresh threshold

#### `create_user`
Create a new user account.

**Parameters:**
- `collection` (string, optional): Auth collection name (default: "users")
- `email` (string, required): User email
- `password` (string, required): User password
- `passwordConfirm` (string, required): Password confirmation
- `verified` (boolean, optional): Whether user is verified
- `emailVisibility` (boolean, optional): Email visibility
- `additionalData` (object, optional): Additional user data

### Analysis & Insights

#### `analyze_collection_data`
Analyze data patterns and provide insights about a collection.

**Parameters:**
- `collection` (string, required): Collection name
- `options` (object, optional): Analysis options
  - `sampleSize` (number, optional): Number of records to sample (default: 100)
  - `fields` (array, optional): Specific fields to analyze

**Example:**
```typescript
{
  "collection": "products",
  "options": {
    "sampleSize": 500,
    "fields": ["price", "category"]
  }
}
```

#### `query_collection`
Advanced query with filtering, sorting, and aggregation.

**Parameters:**
- `collection` (string, required): Collection name
- `filter` (string, optional): Filter expression
- `sort` (string, optional): Sort expression
- `aggregate` (object, optional): Aggregation settings
- `expand` (string, optional): Relations to expand

### Migration & Schema

#### `migrate_collection`
Migrate collection schema with data preservation.

**Parameters:**
- `collection` (string, required): Collection name
- `fields` (array, required): New collection fields configuration
- `dataTransforms` (object, optional): Field transformation mappings
- `name` (string, optional): New collection name
- Rules (optional): `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`

#### `backup_database`
Create a backup of the PocketBase database.

**Parameters:**
- `format` (string, optional): Export format ("json" or "csv") - default: "json"

#### `import_data`
Import data into a collection.

**Parameters:**
- `collection` (string, required): Collection name
- `data` (array, required): Array of records to import
- `mode` (string, optional): Import mode ("create", "update", "upsert") - default: "create"

### Index Management

#### `manage_indexes`
Manage collection indexes.

**Parameters:**
- `collection` (string, required): Collection name
- `action` (string, required): Action to perform ("create", "delete", "list")
- `index` (object, optional): Index configuration for create action
  - `name` (string): Index name
  - `fields` (array): Index fields
  - `unique` (boolean): Whether index is unique

### Code Generation

#### `generate_pb_schema`
Generate PocketBase schema from TypeScript interfaces.

**Parameters:**
- `sourceCode` (string, required): TypeScript interface code
- `options` (object, optional): Generation options
  - `includeAuthentication` (boolean): Include auth collections
  - `includeTimestamps` (boolean): Include created/updated timestamps

**Example:**
```typescript
{
  "sourceCode": "interface User { name: string; email: string; age?: number; }",
  "options": {
    "includeTimestamps": true
  }
}
```

#### `generate_typescript_interfaces`
Generate TypeScript interfaces from PocketBase collections.

**Parameters:**
- `collections` (array, optional): Collection names (empty for all)
- `options` (object, optional): Generation options
  - `includeRelations` (boolean): Include relation types

### File Management

#### `upload_file`
Upload a file to a record in PocketBase.

**Parameters:**
- `collection` (string, required): Collection name
- `recordId` (string, required): Record ID to attach file to
- `fileField` (string, required): File field name in collection schema
- `fileContent` (string, required): Raw file content as string
- `fileName` (string, required): Desired file name

**Example:**
```typescript
{
  "collection": "documents",
  "recordId": "abc123",
  "fileField": "attachment",
  "fileContent": "This is the content of my document",
  "fileName": "my-document.txt"
}
```

#### `download_file`
Get the URL to download a file from a PocketBase record.

**Parameters:**
- `collection` (string, required): Collection name
- `recordId` (string, required): Record ID containing the file
- `fileField` (string, required): File field name

**Example:**
```typescript
{
  "collection": "documents",
  "recordId": "abc123",
  "fileField": "attachment"
}
```

#### `upload_file_from_url`
Download a file from a URL and upload it to a PocketBase record.

**Parameters:**
- `collection` (string, required): Collection name
- `recordId` (string, required): Record ID to attach file to
- `fileField` (string, required): File field name in collection schema
- `url` (string, required): URL to download the file from
- `fileName` (string, optional): Custom name for the uploaded file (if not provided, will extract from URL)

**Example:**
```typescript
{
  "collection": "documents",
  "recordId": "abc123",
  "fileField": "attachment",
  "url": "https://example.com/files/document.pdf",
  "fileName": "my-document.pdf"
}
```

## Response Formats

### Success Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON response or success message"
    }
  ]
}
```

### Error Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Description of what went wrong"
    }
  ],
  "isError": true
}
```

## Filter Syntax

PocketBase uses a SQL-like filter syntax:

- **Comparison**: `field = 'value'`, `field != 'value'`, `field > 10`
- **Logical**: `field1 = 'a' && field2 = 'b'`, `field1 = 'a' || field2 = 'b'`
- **Text**: `field ~ 'pattern'`, `field !~ 'pattern'`
- **Arrays**: `field.length > 0`, `'value' ?= field`
- **Relations**: `expand.field = 'value'`

**Examples:**
- `status = 'active' && created > '2023-01-01'`
- `title ~ 'product' || description ~ 'product'`
- `tags.length > 0 && 'featured' ?= tags`

## Sort Syntax

- **Ascending**: `field` or `+field`
- **Descending**: `-field`
- **Multiple**: `field1,-field2,+field3`

**Examples:**
- `created` (ascending by created date)
- `-created` (descending by created date)
- `name,-created` (name ascending, then created descending)
