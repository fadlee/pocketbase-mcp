# Contributing Guide

Thank you for your interest in contributing to the PocketBase MCP Server! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- TypeScript knowledge
- Familiarity with PocketBase
- Understanding of the Model Context Protocol (MCP)

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/pocketbase-cursor-mcp.git
   cd pocketbase-cursor-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up your development environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your PocketBase configuration
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Test the server**:
   ```bash
   node build/src/index.js --help
   ```

## Development Workflow

### Code Style

We use Biome for code formatting and linting. The configuration is in `biome.json`.

**Run formatting and linting**:
```bash
npm run format
npm run lint
```

**Auto-fix issues**:
```bash
npm run lint:fix
```

### TypeScript Guidelines

- **Strict Mode**: All code must pass TypeScript strict mode
- **Type Annotations**: Prefer explicit type annotations for public APIs
- **Interface over Type**: Use interfaces for object shapes
- **Const Assertions**: Use `as const` for literal types

**Example**:
```typescript
// Good
interface ToolArgs {
  collection: string;
  options?: {
    limit?: number;
  };
}

export const schema = {
  type: "object" as const,
  properties: {
    collection: { type: "string" as const }
  },
  required: ["collection" as const]
};

// Avoid
type ToolArgs = {
  collection: string;
  options?: any;
};
```

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples**:
```
feat: add list_collections tool
fix: handle empty collection names in validation
docs: update API reference for new tools
refactor: extract common error handling logic
```

## Contributing Types

### 1. Adding New Tools

See the [Developer Guide](./developer-guide.md) for detailed instructions on adding new tools.

**Quick checklist**:
- [ ] Create schema in `src/tools/schemas/`
- [ ] Implement handler in `src/tools/handlers/`
- [ ] Export from index files
- [ ] Register in `src/server.ts`
- [ ] Add tests
- [ ] Update documentation

### 2. Bug Fixes

1. **Identify the issue**: Understand the problem and its scope
2. **Write a test**: Create a test that reproduces the bug
3. **Fix the issue**: Implement the minimal fix
4. **Verify the fix**: Ensure the test passes and no regressions
5. **Update documentation**: If the fix changes behavior

### 3. Documentation Improvements

- **API Reference**: Update tool documentation in `docs/api-reference.md`
- **Developer Guide**: Improve development instructions
- **Examples**: Add practical usage examples
- **Architecture**: Document design decisions

### 4. Performance Improvements

- **Benchmarking**: Measure performance before and after changes
- **Profiling**: Use appropriate profiling tools
- **Testing**: Ensure improvements don't break functionality
- **Documentation**: Document performance characteristics

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

#### Unit Tests

Test individual functions and components in isolation:

```typescript
// tests/unit/handlers/collection.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createListCollectionsHandler } from '../../../src/tools/handlers/collection.js';

describe('createListCollectionsHandler', () => {
  it('should list collections with default sort', async () => {
    const mockPb = {
      collections: {
        getFullList: vi.fn().mockResolvedValue([
          { id: '1', name: 'users', created: '2023-01-01' },
          { id: '2', name: 'posts', created: '2023-01-02' }
        ])
      }
    };

    const handler = createListCollectionsHandler(mockPb as any);
    const result = await handler({ sort: '-created' });

    expect(mockPb.collections.getFullList).toHaveBeenCalledWith({
      sort: '-created'
    });
    expect(result.content[0].text).toContain('users');
  });
});
```

#### Integration Tests

Test complete workflows with real PocketBase instances:

```typescript
// tests/integration/tools/collection.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import PocketBase from 'pocketbase';
import { createServer } from '../../../src/server.js';

describe('Collection Tools Integration', () => {
  let pb: PocketBase;
  let server: any;

  beforeAll(async () => {
    pb = new PocketBase('http://localhost:8090');
    server = createServer(pb);
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should create and list collections', async () => {
    // Test implementation
  });
});
```

### Test Guidelines

- **Descriptive Names**: Test names should clearly describe what is being tested
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Isolation**: Tests should not depend on each other
- **Mocking**: Mock external dependencies appropriately
- **Coverage**: Aim for high test coverage, especially for critical paths

## Code Review Process

### Submitting Pull Requests

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**:
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

### PR Requirements

- [ ] **Clear Description**: Explain what the PR does and why
- [ ] **Tests**: Include appropriate tests for changes
- [ ] **Documentation**: Update relevant documentation
- [ ] **No Breaking Changes**: Or clearly document breaking changes
- [ ] **Clean History**: Squash commits if necessary
- [ ] **Passing CI**: All checks must pass

### Review Criteria

**Code Quality**:
- Follows established patterns and conventions
- Proper error handling and edge case coverage
- Appropriate abstractions and modularity
- Clear and maintainable code

**Testing**:
- Adequate test coverage
- Tests are meaningful and well-structured
- Integration tests for new features

**Documentation**:
- API changes are documented
- Examples are provided for new features
- Architecture decisions are explained

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run full test suite
- [ ] Build and test distribution
- [ ] Create release tag
- [ ] Publish to npm
- [ ] Update documentation

## Community Guidelines

### Code of Conduct

- **Be Respectful**: Treat all contributors with respect
- **Be Inclusive**: Welcome contributors from all backgrounds
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is learning

### Communication

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Pull Requests**: Use PR comments for code-specific discussions

### Getting Help

- **Documentation**: Check the docs first
- **Search Issues**: Look for existing issues and discussions
- **Ask Questions**: Don't hesitate to ask for help
- **Provide Context**: Include relevant details when asking for help

## Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

Thank you for contributing to the PocketBase MCP Server! 🚀