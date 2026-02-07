# PocketBase MCP Server

Model Context Protocol (MCP) server for PocketBase, enabling AI assistants to interact with your PocketBase backend.

## Features

- 🔧 **14 Tools** for complete PocketBase management
- 📚 **Collections**: Create, update, delete, and view collections
- 📝 **Records**: Full CRUD operations with filtering, sorting, and pagination
- 🔐 **Rules**: Manage API access control rules
- 📖 **References**: Built-in field schema and rules reference
- 🌐 **Resources**: Expose collections as MCP resources

## Installation

```bash
npm install @fadlee/pocketbase-mcp
# or
bun install @fadlee/pocketbase-mcp
```

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "pocketbase": {
      "command": "npx",
      "args": ["@fadlee/pocketbase-mcp"],
      "env": {
        "POCKETBASE_URL": "http://localhost:8090",
        "POCKETBASE_TOKEN": "your-admin-token-here"
      }
    }
  }
}
```

### Authentication Methods

**Option 1: Using Admin Token** (recommended)
```json
{
  "env": {
    "POCKETBASE_URL": "http://localhost:8090",
    "POCKETBASE_TOKEN": "your-admin-token"
  }
}
```

**Option 2: Using Email/Password**
```json
{
  "env": {
    "POCKETBASE_URL": "http://localhost:8090",
    "POCKETBASE_EMAIL": "admin@example.com",
    "POCKETBASE_PASSWORD": "your-password"
  }
}
```

### Direct Usage

```bash
# With environment variables
POCKETBASE_URL=http://localhost:8090 \
POCKETBASE_TOKEN=your-token \
npx @fadlee/pocketbase-mcp

# Or with Bun
POCKETBASE_URL=http://localhost:8090 \
POCKETBASE_TOKEN=your-token \
bunx @fadlee/pocketbase-mcp
```

## Available Tools

### Health & Reference
- `health` - Check PocketBase server health status
- `get_field_schema_reference` - Get field types documentation
- `get_rules_reference` - Get API rules syntax reference

### Collections
- `list_collections` - List all collections
- `view_collection` - View collection by name/ID
- `create_collection` - Create new collection
- `update_collection` - Update collection schema/settings
- `delete_collection` - Delete collection
- `update_collection_rules` - Update access control rules

### Records
- `list_records` - List/search records with filtering, sorting, pagination
- `view_record` - View single record by ID
- `create_record` - Create new record
- `update_record` - Update existing record
- `delete_record` - Delete record

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Type check
bun run typecheck

# Run tests (builds dist first)
bun run test

# Run all checks (typecheck + tests)
bun run check

# Build for production
bun run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POCKETBASE_URL` | Yes | PocketBase server URL (e.g., `http://localhost:8090`) |
| `POCKETBASE_TOKEN` | No* | Admin authentication token |
| `POCKETBASE_EMAIL` | No* | Superuser email for authentication |
| `POCKETBASE_PASSWORD` | No* | Superuser password for authentication |

\* Either `POCKETBASE_TOKEN` or both `POCKETBASE_EMAIL` and `POCKETBASE_PASSWORD` must be provided.

## License

MIT
