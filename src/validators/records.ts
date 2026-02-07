import type {
  CreateRecordArgs,
  DeleteRecordArgs,
  ListRecordsArgs,
  UpdateRecordArgs,
  ViewRecordArgs,
} from '../types.js';
import {
  optionalInteger,
  optionalString,
  requireObject,
  requireString,
  type UnknownObject,
} from './common.js';

export function parseListRecordsArgs(args: UnknownObject): ListRecordsArgs {
  const parsed: ListRecordsArgs = {
    collection: requireString(args.collection, 'collection'),
  };

  const page = optionalInteger(args.page, 'page');
  if (page !== undefined) {
    parsed.page = page;
  }

  const perPage = optionalInteger(args.perPage, 'perPage');
  if (perPage !== undefined) {
    parsed.perPage = perPage;
  }

  for (const key of ['sort', 'filter', 'expand', 'fields'] as const) {
    const value = optionalString(args[key], key);
    if (value !== undefined) {
      parsed[key] = value;
    }
  }

  return parsed;
}

export function parseViewRecordArgs(args: UnknownObject): ViewRecordArgs {
  const parsed: ViewRecordArgs = {
    collection: requireString(args.collection, 'collection'),
    id: requireString(args.id, 'id'),
  };

  for (const key of ['expand', 'fields'] as const) {
    const value = optionalString(args[key], key);
    if (value !== undefined) {
      parsed[key] = value;
    }
  }

  return parsed;
}

export function parseCreateRecordArgs(args: UnknownObject): CreateRecordArgs {
  return {
    collection: requireString(args.collection, 'collection'),
    data: requireObject(args.data, 'data'),
    expand: optionalString(args.expand, 'expand'),
  };
}

export function parseUpdateRecordArgs(args: UnknownObject): UpdateRecordArgs {
  return {
    collection: requireString(args.collection, 'collection'),
    id: requireString(args.id, 'id'),
    data: requireObject(args.data, 'data'),
    expand: optionalString(args.expand, 'expand'),
  };
}

export function parseDeleteRecordArgs(args: UnknownObject): DeleteRecordArgs {
  return {
    collection: requireString(args.collection, 'collection'),
    id: requireString(args.id, 'id'),
  };
}
