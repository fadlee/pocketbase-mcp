import type { AuthAdminArgs, AuthUserArgs } from '../types.js';
import { requireString, type UnknownObject } from './common.js';

export function parseAuthAdminArgs(args: UnknownObject): AuthAdminArgs {
  return {
    identity: requireString(args.identity, 'identity'),
    password: requireString(args.password, 'password'),
  };
}

export function parseAuthUserArgs(args: UnknownObject): AuthUserArgs {
  return {
    collection: requireString(args.collection, 'collection'),
    identity: requireString(args.identity, 'identity'),
    password: requireString(args.password, 'password'),
  };
}
