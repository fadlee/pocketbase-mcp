import assert from 'node:assert/strict';
import test from 'node:test';

import { PocketBaseMCPServer } from '../dist/server.js';

function createServerWithMockRequest(mockRequest) {
  const server = new PocketBaseMCPServer('http://localhost:8090', 'test-token');
  server.http.request = mockRequest;
  return server;
}

test('rejects unknown tool names', async () => {
  const server = new PocketBaseMCPServer('http://localhost:8090', 'test-token');

  await assert.rejects(
    () => server.callTool('not_a_tool', {}),
    /Unknown tool: not_a_tool/
  );
});

test('validates required parameters before making HTTP calls', async () => {
  const server = new PocketBaseMCPServer('http://localhost:8090', 'test-token');

  await assert.rejects(
    () => server.callTool('view_collection', {}),
    /Missing required parameter: collection/
  );
});

test('validates numeric record query options', async () => {
  const server = new PocketBaseMCPServer('http://localhost:8090', 'test-token');

  await assert.rejects(
    () => server.callTool('list_records', { collection: 'posts', page: '1' }),
    /Invalid parameter: page must be an integer/
  );
});

test('validates record payload shape', async () => {
  const server = new PocketBaseMCPServer('http://localhost:8090', 'test-token');

  await assert.rejects(
    () => server.callTool('create_record', { collection: 'posts', data: 'invalid' }),
    /Invalid parameter: data must be an object/
  );
});

test('create_collection accepts nullable rule values and forwards payload', async () => {
  let capturedCall = null;
  const server = createServerWithMockRequest(async (method, endpoint, data) => {
    capturedCall = { method, endpoint, data };
    return {
      id: 'collection_id',
      name: data.name,
      type: data.type,
      fields: data.fields,
      listRule: data.listRule ?? null,
      viewRule: data.viewRule ?? null,
      createRule: data.createRule ?? null,
      updateRule: data.updateRule ?? null,
      deleteRule: data.deleteRule ?? null,
    };
  });

  const result = await server.callTool('create_collection', {
    name: 'posts',
    fields: [{ name: 'title', type: 'text' }],
    listRule: null,
  });

  assert.equal(capturedCall?.method, 'POST');
  assert.equal(capturedCall?.endpoint, '/api/collections');
  assert.equal(capturedCall?.data?.listRule, null);
  assert.equal(result.name, 'posts');
});
