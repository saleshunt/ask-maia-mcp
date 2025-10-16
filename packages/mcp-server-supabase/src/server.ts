import { createMcpServer, type Tool } from '@supabase/mcp-utils';
import { z } from 'zod';
import packageJson from '../package.json' with { type: 'json' };
import type { SupabasePlatform } from './platform/types.js';
import { getAskMaiaTools } from './tools/ask-maia-tools.js';
import { getAskMaiaWriteTools } from './tools/ask-maia-write-tools.js';
import { getDatabaseOperationTools } from './tools/database-operation-tools.js';
import { getDebuggingTools } from './tools/debugging-tools.js';

const { version } = packageJson;

export type SupabasePlatformOptions = {
  /**
   * The access token for the Supabase Management API.
   */
  accessToken: string;

  /**
   * The API URL for the Supabase Management API.
   */
  apiUrl?: string;
};

export type SupabaseMcpServerOptions = {
  /**
   * Platform implementation for Supabase.
   */
  platform: SupabasePlatform;

  /**
   * The project ID to scope the server to.
   *
   * If undefined, the server will have access
   * to all organizations and projects for the user.
   */
  projectId?: string;

  /**
   * Features to enable.
   * Options: 'ask-maia', 'database', 'debug'
   * Write operations require explicit confirmation via confirm=true parameter.
   */
  features?: string[];
};

// Feature groups with confirmation-based safety
const featureGroupSchema = z.enum([
  'ask-maia',  // Custom Maia query tools (read + write with confirmation)
  'database',  // Database operations (read + write with confirmation)
  'debug',     // Debugging tools (read-only)
]);

export type FeatureGroup = z.infer<typeof featureGroupSchema>;

// All features enabled by default (write operations require confirmation)
const DEFAULT_FEATURES: FeatureGroup[] = [
  'ask-maia',
  'database',
  'debug',
];

/**
 * Creates an MCP server for interacting with Supabase.
 */
export function createSupabaseMcpServer(options: SupabaseMcpServerOptions) {
  const {
    platform,
    projectId,
    features,
  } = options;

  const enabledFeatures = z
    .set(featureGroupSchema)
    .parse(new Set(features ?? DEFAULT_FEATURES));

  const server = createMcpServer({
    name: 'ask-maia',
    version,
    async onInitialize(info) {
      // Note: in stateless HTTP mode, `onInitialize` will not always be called
      // so we cannot rely on it for initialization. It's still useful for telemetry.
      await platform.init?.(info);
    },
    tools: async () => {
      const tools: Record<string, Tool> = {};

      // Write operations are enabled with EXPLICIT CONFIRMATION REQUIREMENTS
      // All INSERT/UPDATE/DELETE operations require confirm=true parameter
      // Account, branching, functions, development, storage tools remain disabled

      if (enabledFeatures.has('ask-maia')) {
        Object.assign(tools, getAskMaiaTools({ platform, projectId }));
        Object.assign(tools, getAskMaiaWriteTools({ platform, projectId }));
      }

      if (enabledFeatures.has('database')) {
        // Enable write operations with confirmation requirements
        Object.assign(
          tools,
          getDatabaseOperationTools({ platform, projectId, readOnly: false })
        );
      }

      if (enabledFeatures.has('debug')) {
        Object.assign(tools, getDebuggingTools({ platform, projectId }));
      }

      return tools;
    },
  });

  return server;
}
