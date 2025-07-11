# Getting Started

This guide will help you install, configure, and start using the PocketBase MCP Server with MCP-compatible applications.

## Installation

### 1. Install the npm package

```bash
npm install -g pocketbase-cursor-mcp
```

or

```bash
pnpm add -g pocketbase-cursor-mcp
```

### 2. Configuration

You can configure the PocketBase MCP Server using **environment variables** or **command line arguments**:

#### Using environment variables

Create a `.env` file in the root directory of your project:

```
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=your-admin@example.com  # Optional
POCKETBASE_ADMIN_PASSWORD=your-password        # Optional
```

#### Using command line arguments

```bash
pocketbase-cursor-mcp --url=http://127.0.0.1:8090 --admin-email=your-admin@example.com --admin-password=your-password
```

#### Available options

| Command line arg       | Environment variable       | Description                            |
|------------------------|-----------------------------|----------------------------------------|
| `--url, -u`            | `POCKETBASE_URL`           | PocketBase server URL (required)       |
| `--admin-email, -e`    | `POCKETBASE_ADMIN_EMAIL`   | Admin email (optional)                 |
| `--admin-password, -p` | `POCKETBASE_ADMIN_PASSWORD`| Admin password (optional)              |
| `--data-dir, -d`       | `POCKETBASE_DATA_DIR`      | Custom data directory path (optional)  |
| `--port`               | `PORT`                     | HTTP server port (optional)            |
| `--host`               | `HOST`                     | HTTP server host (optional)            |

Use `pocketbase-cursor-mcp --help` to view all options.

## MCP Client Configuration

### Cursor AI

1. Open Cursor AI
2. Open Settings (or press `Cmd+,` on macOS, `Ctrl+,` on Windows/Linux)
3. Select the "AI" tab
4. Scroll down to "Model Context Protocol Servers"
5. Add a new configuration with the following information:

**Name**: `pocketbase`  
**Command**: `npx`  
**Args**: `pocketbase-cursor-mcp --url=http://127.0.0.1:8090`

### Other MCP Clients

For other MCP-compatible applications, refer to their specific documentation for server configuration. Generally, you'll need to provide:

- **Server Command**: `npx pocketbase-cursor-mcp` (or direct path to executable)
- **Arguments**: `--url=http://127.0.0.1:8090` (plus any additional configuration)

### Alternative Configuration Methods

#### Using Direct Path
If you prefer to use the direct path to the executable:

**Command**: Path to node executable (e.g., `/usr/bin/node`)  
**Args**: Path to the executable file along with parameters (e.g., `/usr/local/bin/pocketbase-cursor-mcp --url=http://127.0.0.1:8090`)

## Basic Usage

After configuration, you can use PocketBase MCP with your MCP client by using commands like the following:

### Create a Collection from TypeScript Interface

```
Create a PocketBase collection from the following TypeScript interface:

interface User {
  username: string;
  email: string;
  isActive: boolean;
  age?: number;
  profile: UserProfile;
}

interface UserProfile {
  bio: string;
  avatar?: string;
  socialLinks: string[];
}
```

### Generate TypeScript Interfaces

```
Generate TypeScript interfaces from the collections in my PocketBase database.
```

### Analyze Collection Data

```
Analyze the data in the "products" collection and provide insights.
```

## Next Steps

- Explore the [API Reference](./api-reference.md) for all available tools
- Learn about [extending the server](./developer-guide.md) with custom tools
- Review the [architecture documentation](./architecture.md) to understand the system design