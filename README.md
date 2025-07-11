# PocketBase MCP Server

Seamless integration between PocketBase and MCP clients through the Model Context Protocol (MCP). This server enables MCP-compatible applications to directly interact with PocketBase databases for collection management, record operations, schema generation, and data analysis.

## ✨ Key Features

- **🗄️ Collection Management**: Create, migrate, and manage collections with custom schemas
- **📝 Record Operations**: Full CRUD operations with advanced querying and filtering
- **🔄 Schema Generation**: Bidirectional conversion between TypeScript interfaces and PocketBase schemas
- **📊 Data Analysis**: Intelligent insights and analytics for your collections
- **🔐 Authentication**: User management and authentication workflows
- **⚡ Performance**: Optimized for speed with built-in caching and connection pooling

## 🚀 Quick Start

### Installation

```bash
npm install -g pocketbase-cursor-mcp
```

### MCP Client Setup

#### For Cursor AI
1. Open Cursor AI Settings (`Cmd+,` / `Ctrl+,`)
2. Navigate to **AI** → **Model Context Protocol Servers**
3. Add new server:
   - **Name**: `pocketbase`
   - **Command**: `npx`
   - **Args**: `pocketbase-cursor-mcp --url=http://127.0.0.1:8090`

#### For Other MCP Clients
Refer to your MCP client's documentation for server configuration. Use:
- **Server Command**: `npx pocketbase-cursor-mcp`
- **Arguments**: `--url=http://127.0.0.1:8090`

### Basic Configuration

```bash
# Using command line
pocketbase-cursor-mcp --url=http://127.0.0.1:8090

# Using environment variables
export POCKETBASE_URL=http://127.0.0.1:8090
pocketbase-cursor-mcp
```

## 💡 Usage Examples

### Create Collections from TypeScript
```typescript
// Describe your interface to your MCP client
interface User {
  username: string;
  email: string;
  isActive: boolean;
  profile: UserProfile;
}
```

### Generate TypeScript from PocketBase
```
Generate TypeScript interfaces from my PocketBase collections
```

### Data Analysis
```
Analyze the "products" collection and provide insights
```

## 🛠️ Available Tools

**Collection Management**: `create_collection`, `list_collections`, `delete_collection`, `get_collection_schema`, `migrate_collection`

**Record Operations**: `create_record`, `list_records`, `update_record`, `delete_record`, `query_collection`

**Authentication**: `authenticate_user`, `create_user`

**Code Generation**: `generate_pb_schema`, `generate_typescript_interfaces`

**Analysis**: `analyze_collection_data`, `backup_database`, `import_data`

**Advanced**: `manage_indexes`

> 📖 **[Complete API Reference →](./docs/api-reference.md)**

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and configuration guide
- **[Developer Guide](./docs/developer-guide.md)** - How to extend the server with new tools
- **[API Reference](./docs/api-reference.md)** - Complete tool reference and examples
- **[Architecture](./docs/architecture.md)** - System design and architectural decisions
- **[Contributing](./docs/contributing.md)** - Guidelines for contributors

## 🏗️ Architecture

Built with a modular, extensible architecture:

```
src/
├── tools/          # Modular tool system
│   ├── schemas/    # Input validation
│   └── handlers/   # Business logic
├── utils/          # Shared utilities
├── types/          # TypeScript definitions
└── config/         # Configuration management
```

**Key Benefits**:
- 🔧 **Extensible**: Easy to add new tools
- 🛡️ **Type-Safe**: Full TypeScript coverage
- ⚡ **Performance**: Optimized for speed
- 🧪 **Testable**: Comprehensive test coverage

## Contributing

Contributions are always welcome! Please create an issue or pull request.

## License

MIT
