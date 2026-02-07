# PocketBase MCP Server

Model Context Protocol (MCP) server for PocketBase, enabling AI assistants to interact with your PocketBase backend.

## Features

- 🔧 **18 Tools** for complete PocketBase management
- 📚 **Collections**: Create, update, delete, and view collections
- 📝 **Records**: Full CRUD operations with filtering, sorting, and pagination
- 🔐 **Authentication**: Login/logout and check auth state via tools
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
      "args": ["@fadlee/pocketbase-mcp"]
    }
  }
}
```

If `POCKETBASE_URL` is not set, server defaults to `http://localhost:8090`.

### Direct Usage

```bash
# Use default URL (http://localhost:8090)
npx @fadlee/pocketbase-mcp

# Or use custom PocketBase URL
POCKETBASE_URL=https://pb.example.com \
bunx @fadlee/pocketbase-mcp
```

### Authentication Flow (via tools)

Use tools to authenticate after server starts:

1. `auth_admin` or `auth_user`
2. `get_auth_status`
3. `logout`

## Available Tools

### Health & Reference
- `health` - Check PocketBase server health status
- `get_field_schema_reference` - Get field types documentation
- `get_rules_reference` - Get API rules syntax reference

### Authentication
- `auth_admin` - Authenticate as admin/superuser
- `auth_user` - Authenticate as auth collection user (email/username)
- `get_auth_status` - Check current authentication status
- `logout` - Clear authentication session

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

# Interactive release helper (bump, check, publish, push tag)
bun run release

# Build for production
bun run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POCKETBASE_URL` | No | PocketBase server URL (default: `http://localhost:8090`) |

## License

MIT
