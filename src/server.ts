import { HttpClient } from './http-client.js';
import { getFieldSchemaReference } from './references/field-schema.js';
import { getRulesReference } from './references/rules.js';
import type {
  Collection,
  CreateCollectionArgs,
  CreateRecordArgs,
  DeleteRecordArgs,
  HealthResponse,
  ListRecordsArgs,
  ListResult,
  PBRecord,
  UpdateCollectionArgs,
  UpdateRecordArgs,
  UpdateRulesArgs,
  ViewRecordArgs,
} from './types.js';

export class PocketBaseMCPServer {
  private http: HttpClient;

  constructor(baseUrl: string, token?: string, email?: string, password?: string) {
    this.http = new HttpClient(baseUrl, token);

    if (!token && email && password) {
      this.http.authenticate(email, password).catch((err) => {
        console.error('Authentication failed:', err.message);
      });
    }
  }

  async initialize(): Promise<void> {
    const config = this.getConfig();
    if (!config.token && config.email && config.password) {
      await this.http.authenticate(config.email, config.password);
    }
  }

  private getConfig() {
    return {
      token: process.env.POCKETBASE_TOKEN,
      email: process.env.POCKETBASE_EMAIL,
      password: process.env.POCKETBASE_PASSWORD,
    };
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'health':
        return this.health();

      case 'get_field_schema_reference':
        return getFieldSchemaReference();

      case 'list_collections':
        return this.listCollections();

      case 'view_collection':
        return this.viewCollection(args.collection as string);

      case 'create_collection':
        return this.createCollection(args as unknown as CreateCollectionArgs);

      case 'update_collection': {
        const collection = args.collection as string;
        if (!collection) {
          throw new Error('Missing required parameter: collection');
        }

        let data = (args.data as Record<string, unknown>) || {};

        if (!args.data) {
          data = { ...args };
          delete data.collection;
        } else {
          for (const k of [
            'fields',
            'indexes',
            'listRule',
            'viewRule',
            'createRule',
            'updateRule',
            'deleteRule',
          ]) {
            if (k in args && !(k in data)) {
              data[k] = args[k];
            }
          }
        }

        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid parameter: data must be an object');
        }

        if (Object.keys(data).length === 0) {
          throw new Error(
            'Missing update payload. Provide update properties under data or at top-level (besides collection). For schema changes, send fields as the full fields array (existing fields + your changes).'
          );
        }

        if ('fields' in data && !Array.isArray(data.fields)) {
          throw new Error(
            'Invalid payload: fields must be an array. For schema changes, send the full fields array (existing fields + your changes), not just a single new field.'
          );
        }

        return this.updateCollection(collection, data);
      }

      case 'delete_collection':
        return this.deleteCollection(args.collection as string);

      case 'get_rules_reference':
        return getRulesReference();

      case 'update_collection_rules':
        return this.updateCollectionRules(args as unknown as UpdateRulesArgs);

      case 'list_records':
        return this.listRecords(args as unknown as ListRecordsArgs);

      case 'view_record':
        return this.viewRecord(args as unknown as ViewRecordArgs);

      case 'create_record':
        return this.createRecord(args as unknown as CreateRecordArgs);

      case 'update_record':
        return this.updateRecord(args as unknown as UpdateRecordArgs);

      case 'delete_record':
        return this.deleteRecord(args as unknown as DeleteRecordArgs);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async health(): Promise<HealthResponse> {
    return this.http.request<HealthResponse>('GET', '/api/health');
  }

  async listCollections() {
    const result = await this.http.request<ListResult<Collection>>('GET', '/api/collections');
    
    return {
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      items: result.items.map((col) => ({
        id: col.id,
        name: col.name,
        type: col.type,
        fields: col.fields?.length || 0,
        system: col.system || false,
      })),
    };
  }

  async viewCollection(collection: string): Promise<Collection> {
    return this.http.request<Collection>('GET', `/api/collections/${encodeURIComponent(collection)}`);
  }

  async createCollection(data: CreateCollectionArgs): Promise<Collection> {
    const payload: Record<string, unknown> = {
      name: data.name,
      type: data.type || 'base',
      fields: data.fields || [],
    };

    for (const rule of ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule'] as const) {
      if (data[rule] !== undefined) {
        payload[rule] = data[rule];
      }
    }

    if (data.indexes && data.indexes.length > 0) {
      payload.indexes = data.indexes;
    }

    return this.http.request<Collection>('POST', '/api/collections', payload);
  }

  async updateCollection(
    collection: string,
    data: Record<string, unknown>
  ): Promise<Collection> {
    return this.http.request<Collection>(
      'PATCH',
      `/api/collections/${encodeURIComponent(collection)}`,
      data
    );
  }

  async deleteCollection(collection: string): Promise<{ message: string }> {
    await this.http.request('DELETE', `/api/collections/${encodeURIComponent(collection)}`);
    return { message: 'Collection deleted successfully' };
  }

  async updateCollectionRules(args: UpdateRulesArgs): Promise<{
    message: string;
    collection: string;
    updatedRules: string[];
    currentRules: Record<string, string | null>;
  }> {
    const { collection, ...rules } = args;
    const payload: Record<string, unknown> = {};

    for (const rule of ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule'] as const) {
      if (rule in rules) {
        payload[rule] = rules[rule];
      }
    }

    if (Object.keys(payload).length === 0) {
      return {
        message: 'No rules specified to update',
        collection,
        updatedRules: [],
        currentRules: {},
      };
    }

    const result = await this.http.request<Collection>(
      'PATCH',
      `/api/collections/${encodeURIComponent(collection)}`,
      payload
    );

    return {
      message: 'Collection rules updated successfully',
      collection,
      updatedRules: Object.keys(payload),
      currentRules: {
        listRule: result.listRule ?? null,
        viewRule: result.viewRule ?? null,
        createRule: result.createRule ?? null,
        updateRule: result.updateRule ?? null,
        deleteRule: result.deleteRule ?? null,
      },
    };
  }

  async listRecords(args: ListRecordsArgs): Promise<ListResult<PBRecord>> {
    const { collection, ...options } = args;
    const query: Record<string, string | number> = {};

    for (const key of ['page', 'perPage', 'sort', 'filter', 'expand', 'fields'] as const) {
      if (options[key] !== undefined && options[key] !== null && options[key] !== '') {
        query[key] = options[key]!;
      }
    }

    return this.http.request<ListResult<PBRecord>>(
      'GET',
      `/api/collections/${encodeURIComponent(collection)}/records`,
      null,
      query
    );
  }

  async viewRecord(args: ViewRecordArgs): Promise<PBRecord> {
    const { collection, id, ...options } = args;
    const query: Record<string, string | number> = {};

    for (const key of ['expand', 'fields'] as const) {
      if (options[key] !== undefined && options[key] !== null && options[key] !== '') {
        query[key] = options[key]!;
      }
    }

    return this.http.request<PBRecord>(
      'GET',
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`,
      null,
      query
    );
  }

  async createRecord(args: CreateRecordArgs): Promise<PBRecord> {
    const { collection, data, expand } = args;
    const query: Record<string, string | number> = {};

    if (expand) {
      query.expand = expand;
    }

    return this.http.request<PBRecord>(
      'POST',
      `/api/collections/${encodeURIComponent(collection)}/records`,
      data,
      query
    );
  }

  async updateRecord(args: UpdateRecordArgs): Promise<PBRecord> {
    const { collection, id, data, expand } = args;
    const query: Record<string, string | number> = {};

    if (expand) {
      query.expand = expand;
    }

    return this.http.request<PBRecord>(
      'PATCH',
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`,
      data,
      query
    );
  }

  async deleteRecord(args: DeleteRecordArgs): Promise<{ message: string }> {
    const { collection, id } = args;
    await this.http.request(
      'DELETE',
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`
    );
    return { message: 'Record deleted successfully' };
  }

  async listResources(): Promise<
    Array<{ uri: string; name: string; description: string; mimeType: string }>
  > {
    const collections = await this.listCollections();
    const items = collections.items || [];

    return items.map((col) => ({
      uri: `pocketbase://collection/${col.name}`,
      name: col.name,
      description: `Collection: ${col.name} (type: ${col.type})`,
      mimeType: 'application/json',
    }));
  }

  async readResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
    const match = uri.match(/^pocketbase:\/\/collection\/(.+)$/);
    if (!match) {
      throw new Error('Invalid resource URI');
    }

    const collection = match[1];
    const data = await this.viewCollection(collection);

    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    };
  }
}
