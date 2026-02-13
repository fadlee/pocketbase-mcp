import { requireString } from '../validators/common.js';
import { getFieldSchemaReference } from '../references/field-schema.js';
import { getRulesReference } from '../references/rules.js';
import type { ToolHandlerContext, ToolHandlerMap } from './types.js';

export function createMetaToolHandlers(context: ToolHandlerContext): ToolHandlerMap {
  const { api } = context;

  return {
    health: async () => api.health(),
    set_base_url: async (args) => api.setBaseUrl(requireString(args.url, 'url')),
    get_field_schema_reference: async () => getFieldSchemaReference(),
    get_rules_reference: async () => getRulesReference(),
  };
}
