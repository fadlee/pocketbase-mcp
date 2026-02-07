import type { CreateCollectionArgs, UpdateRulesArgs } from '../types.js';
import { ValidationError } from '../errors.js';
import {
  assertObjectArray,
  assertStringArray,
  optionalNullableString,
  requireObject,
  requireString,
  type UnknownObject,
} from './common.js';

const RULE_KEYS = ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule'] as const;
type RuleKey = (typeof RULE_KEYS)[number];

function readRuleValues(source: UnknownObject): Partial<Record<RuleKey, string | null>> {
  const rules: Partial<Record<RuleKey, string | null>> = {};

  for (const rule of RULE_KEYS) {
    const value = optionalNullableString(source[rule], rule);
    if (value !== undefined) {
      rules[rule] = value;
    }
  }

  return rules;
}

export function parseCollectionName(args: UnknownObject): string {
  return requireString(args.collection, 'collection');
}

export function parseCreateCollectionArgs(args: UnknownObject): CreateCollectionArgs {
  const name = requireString(args.name, 'name');
  const fields = args.fields;
  assertObjectArray(fields, 'fields');

  const parsed: CreateCollectionArgs = {
    name,
    fields: fields as CreateCollectionArgs['fields'],
    ...readRuleValues(args),
  };

  if (args.type !== undefined) {
    if (args.type !== 'base' && args.type !== 'auth' && args.type !== 'view') {
      throw new ValidationError('Invalid parameter: type must be one of base, auth, or view');
    }

    parsed.type = args.type;
  }

  if (args.indexes !== undefined) {
    assertStringArray(args.indexes, 'indexes');
    parsed.indexes = args.indexes;
  }

  return parsed;
}

export function parseUpdateCollectionArgs(args: UnknownObject): {
  collection: string;
  data: UnknownObject;
} {
  const collection = parseCollectionName(args);
  let data: UnknownObject;

  if (args.data === undefined) {
    data = { ...args };
    delete data.collection;
  } else {
    const nestedData = requireObject(args.data, 'data');
    data = { ...nestedData };

    for (const key of ['fields', 'indexes', ...RULE_KEYS] as const) {
      if (key in args && !(key in data)) {
        data[key] = args[key];
      }
    }
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError(
      'Missing update payload. Provide update properties under data or at top-level (besides collection). For schema changes, send fields as the full fields array (existing fields + your changes).'
    );
  }

  if ('fields' in data && data.fields !== undefined) {
    assertObjectArray(data.fields, 'fields');
  }

  if ('indexes' in data && data.indexes !== undefined) {
    assertStringArray(data.indexes, 'indexes');
  }

  for (const rule of RULE_KEYS) {
    if (rule in data) {
      optionalNullableString(data[rule], rule);
    }
  }

  return { collection, data };
}

export function parseUpdateRulesArgs(args: UnknownObject): UpdateRulesArgs {
  return {
    collection: parseCollectionName(args),
    ...readRuleValues(args),
  };
}
