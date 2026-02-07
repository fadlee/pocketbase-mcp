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
  UpdateRecordArgs,
  UpdateRulesArgs,
  ViewRecordArgs,
} from './types.js';

const RULE_KEYS = ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule'] as const;
type RuleKey = (typeof RULE_KEYS)[number];

export class PocketBaseMCPServer {
  private http: HttpClient;
  private email?: string;
  private password?: string;

  constructor(baseUrl: string, token?: string, email?: string, password?: string) {
    this.http = new HttpClient(baseUrl, token);
    this.email = email;
    this.password = password;
  }

  async initialize(): Promise<void> {
    if (!this.http.getToken() && this.email && this.password) {
      await this.http.authenticate(this.email, this.password);
    }
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private requireString(value: unknown, parameter: string): string {
    if (value === undefined || value === null) {
      throw new Error(`Missing required parameter: ${parameter}`);
    }

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Invalid parameter: ${parameter} must be a non-empty string`);
    }

    return value;
  }

  private optionalString(value: unknown, parameter: string): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new Error(`Invalid parameter: ${parameter} must be a string`);
    }

    return value;
  }

  private optionalNullableString(
    value: unknown,
    parameter: string
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new Error(`Invalid parameter: ${parameter} must be a string or null`);
    }

    return value;
  }

  private assertObject(value: unknown, parameter: string): asserts value is Record<string, unknown> {
    if (!this.isPlainObject(value)) {
      throw new Error(`Invalid parameter: ${parameter} must be an object`);
    }
  }

  private requireObject(value: unknown, parameter: string): Record<string, unknown> {
    if (value === undefined || value === null) {
      throw new Error(`Missing required parameter: ${parameter}`);
    }

    this.assertObject(value, parameter);
    return value;
  }

  private assertObjectArray(value: unknown, parameter: string): asserts value is Record<string, unknown>[] {
    if (!Array.isArray(value) || value.some((item) => !this.isPlainObject(item))) {
      throw new Error(`Invalid parameter: ${parameter} must be an array of objects`);
    }
  }

  private assertStringArray(value: unknown, parameter: string): asserts value is string[] {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new Error(`Invalid parameter: ${parameter} must be an array of strings`);
    }
  }

  private optionalInteger(value: unknown, parameter: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`Invalid parameter: ${parameter} must be an integer`);
    }

    return value;
  }

  private readRuleValues(
    source: Record<string, unknown>
  ): Partial<Record<RuleKey, string | null>> {
    const rules: Partial<Record<RuleKey, string | null>> = {};

    for (const rule of RULE_KEYS) {
      const value = this.optionalNullableString(source[rule], rule);
      if (value !== undefined) {
        rules[rule] = value;
      }
    }

    return rules;
  }

  private parseCreateCollectionArgs(args: Record<string, unknown>): CreateCollectionArgs {
    const name = this.requireString(args.name, 'name');
    const fields = args.fields;
    this.assertObjectArray(fields, 'fields');

    const parsed: CreateCollectionArgs = {
      name,
      fields: fields as CreateCollectionArgs['fields'],
      ...this.readRuleValues(args),
    };

    if (args.type !== undefined) {
      if (args.type !== 'base' && args.type !== 'auth' && args.type !== 'view') {
        throw new Error('Invalid parameter: type must be one of base, auth, or view');
      }

      parsed.type = args.type;
    }

    if (args.indexes !== undefined) {
      this.assertStringArray(args.indexes, 'indexes');
      parsed.indexes = args.indexes;
    }

    return parsed;
  }

  private parseUpdateCollectionArgs(args: Record<string, unknown>): {
    collection: string;
    data: Record<string, unknown>;
  } {
    const collection = this.requireString(args.collection, 'collection');
    let data: Record<string, unknown>;

    if (args.data === undefined) {
      data = { ...args };
      delete data.collection;
    } else {
      const nestedData = this.requireObject(args.data, 'data');
      data = { ...nestedData };

      for (const key of ['fields', 'indexes', ...RULE_KEYS] as const) {
        if (key in args && !(key in data)) {
          data[key] = args[key];
        }
      }
    }

    if (Object.keys(data).length === 0) {
      throw new Error(
        'Missing update payload. Provide update properties under data or at top-level (besides collection). For schema changes, send fields as the full fields array (existing fields + your changes).'
      );
    }

    if ('fields' in data && data.fields !== undefined) {
      this.assertObjectArray(data.fields, 'fields');
    }

    if ('indexes' in data && data.indexes !== undefined) {
      this.assertStringArray(data.indexes, 'indexes');
    }

    for (const rule of RULE_KEYS) {
      if (rule in data) {
        this.optionalNullableString(data[rule], rule);
      }
    }

    return { collection, data };
  }

  private parseUpdateRulesArgs(args: Record<string, unknown>): UpdateRulesArgs {
    return {
      collection: this.requireString(args.collection, 'collection'),
      ...this.readRuleValues(args),
    };
  }

  private parseListRecordsArgs(args: Record<string, unknown>): ListRecordsArgs {
    const parsed: ListRecordsArgs = {
      collection: this.requireString(args.collection, 'collection'),
    };

    const page = this.optionalInteger(args.page, 'page');
    if (page !== undefined) {
      parsed.page = page;
    }

    const perPage = this.optionalInteger(args.perPage, 'perPage');
    if (perPage !== undefined) {
      parsed.perPage = perPage;
    }

    for (const key of ['sort', 'filter', 'expand', 'fields'] as const) {
      const value = this.optionalString(args[key], key);
      if (value !== undefined) {
        parsed[key] = value;
      }
    }

    return parsed;
  }

  private parseViewRecordArgs(args: Record<string, unknown>): ViewRecordArgs {
    const parsed: ViewRecordArgs = {
      collection: this.requireString(args.collection, 'collection'),
      id: this.requireString(args.id, 'id'),
    };

    for (const key of ['expand', 'fields'] as const) {
      const value = this.optionalString(args[key], key);
      if (value !== undefined) {
        parsed[key] = value;
      }
    }

    return parsed;
  }

  private parseCreateRecordArgs(args: Record<string, unknown>): CreateRecordArgs {
    return {
      collection: this.requireString(args.collection, 'collection'),
      data: this.requireObject(args.data, 'data'),
      expand: this.optionalString(args.expand, 'expand'),
    };
  }

  private parseUpdateRecordArgs(args: Record<string, unknown>): UpdateRecordArgs {
    return {
      collection: this.requireString(args.collection, 'collection'),
      id: this.requireString(args.id, 'id'),
      data: this.requireObject(args.data, 'data'),
      expand: this.optionalString(args.expand, 'expand'),
    };
  }

  private parseDeleteRecordArgs(args: Record<string, unknown>): DeleteRecordArgs {
    return {
      collection: this.requireString(args.collection, 'collection'),
      id: this.requireString(args.id, 'id'),
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
        return this.viewCollection(this.requireString(args.collection, 'collection'));

      case 'create_collection':
        return this.createCollection(this.parseCreateCollectionArgs(args));

      case 'update_collection': {
        const parsed = this.parseUpdateCollectionArgs(args);
        return this.updateCollection(parsed.collection, parsed.data);
      }

      case 'delete_collection':
        return this.deleteCollection(this.requireString(args.collection, 'collection'));

      case 'get_rules_reference':
        return getRulesReference();

      case 'update_collection_rules':
        return this.updateCollectionRules(this.parseUpdateRulesArgs(args));

      case 'list_records':
        return this.listRecords(this.parseListRecordsArgs(args));

      case 'view_record':
        return this.viewRecord(this.parseViewRecordArgs(args));

      case 'create_record':
        return this.createRecord(this.parseCreateRecordArgs(args));

      case 'update_record':
        return this.updateRecord(this.parseUpdateRecordArgs(args));

      case 'delete_record':
        return this.deleteRecord(this.parseDeleteRecordArgs(args));

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
