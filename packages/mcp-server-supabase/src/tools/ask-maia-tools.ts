import { type Tool } from '@supabase/mcp-utils';
import { z } from 'zod';
import type { SupabasePlatform } from '../platform/types.js';
import { injectableTool } from './util.js';

export type AskMaiaToolsOptions = {
  platform: SupabasePlatform;
  projectId?: string;
};

/**
 * Creates tools for querying Maia's meeting automation database
 * Based on Fireflies integration, AI categorization, and email generation workflows
 */
export function getAskMaiaTools(options: AskMaiaToolsOptions): Record<string, Tool> {
  const { platform, projectId } = options;
  const project_id = projectId;

  return {
    get_meetings_by_category: injectableTool({
      description: 'Get all meetings filtered by AI-assigned category (sales, demo, internal, etc.)',
      parameters: z.object({
        project_id: z.string(),
        category_name: z.string().optional().describe('Name of the meeting category (e.g., "Sales Call", "Product Demo", "Internal Meeting")'),
        assessment_type: z.enum(['Internal', 'External']).optional().describe('Filter by internal or external meetings'),
        limit: z.number().default(50).describe('Maximum number of results (default: 50)'),
      }),
      inject: { project_id },
      async execute({ project_id, category_name, assessment_type, limit = 50 }) {
        let query = `
          SELECT 
            m.id,
            m.fireflies_id,
            m.fireflies_title,
            m.fireflies_timestamp,
            m.fireflies_meeting_summary,
            m.contacts_name_and_email,
            mc.name as category_name,
            mc.assessment_type,
            mc.meeting_category_rationale,
            m.created_at
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE 1=1
        `;

        if (category_name) {
          query += ` AND mc.name ILIKE '%${category_name}%'`;
        }
        if (assessment_type) {
          query += ` AND mc.assessment_type = '${assessment_type}'`;
        }

        query += ` ORDER BY m.fireflies_timestamp DESC LIMIT ${limit};`;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    search_meeting_transcripts: injectableTool({
      description: 'Full-text search across meeting transcripts, summaries, and titles',
      parameters: z.object({
        project_id: z.string(),
        search_term: z.string().describe('Text to search for in transcripts, titles, or summaries'),
        limit: z.number().default(30).describe('Maximum number of results (default: 30)'),
      }),
      inject: { project_id },
      async execute({ project_id, search_term, limit = 30 }) {
        const query = `
          SELECT 
            m.id,
            m.fireflies_id,
            m.fireflies_title,
            m.fireflies_timestamp,
            m.fireflies_meeting_summary,
            m.fireflies_transcript,
            m.contacts_name_and_email,
            mc.name as category_name,
            m.created_at
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE 
            m.fireflies_transcript ILIKE '%${search_term}%'
            OR m.fireflies_meeting_summary ILIKE '%${search_term}%'
            OR m.fireflies_title ILIKE '%${search_term}%'
          ORDER BY m.fireflies_timestamp DESC
          LIMIT ${limit};
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_ai_generated_emails: injectableTool({
      description: 'Get AI-generated follow-up emails for meetings, with status and content',
      parameters: z.object({
        project_id: z.string(),
        fireflies_id: z.string().optional().describe('Filter by specific Fireflies meeting ID'),
        limit: z.number().default(50).describe('Maximum number of results (default: 50)'),
      }),
      inject: { project_id },
      async execute({ project_id, fireflies_id, limit = 50 }) {
        let query = `
          SELECT 
            e.id,
            e.fireflies_id,
            e.generated_email_subject,
            e.generated_email_body,
            e.recipients,
            e.senders,
            e.language,
            e.created_at,
            m.fireflies_title,
            m.fireflies_timestamp
          FROM emails e
          LEFT JOIN meetings m ON e.fireflies_id = m.fireflies_id
          WHERE 1=1
        `;

        if (fireflies_id) {
          query += ` AND e.fireflies_id = '${fireflies_id}'`;
        }

        query += ` ORDER BY e.created_at DESC LIMIT ${limit};`;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_meetings_by_participant: injectableTool({
      description: 'Get all meetings where a specific participant (by name or email) was present',
      parameters: z.object({
        project_id: z.string(),
        participant: z.string().describe('Participant name or email to search for'),
        limit: z.number().default(50).describe('Maximum number of results (default: 50)'),
      }),
      inject: { project_id },
      async execute({ project_id, participant, limit = 50 }) {
        const query = `
          SELECT 
            m.id,
            m.fireflies_id,
            m.fireflies_title,
            m.fireflies_timestamp,
            m.fireflies_meeting_summary,
            m.contacts_name_and_email,
            mc.name as category_name,
            m.created_at
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE m.contacts_name_and_email::text ILIKE '%${participant}%'
          ORDER BY m.fireflies_timestamp DESC
          LIMIT ${limit};
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_meeting_categories: injectableTool({
      description: 'Get all distinct meeting categories defined by the AI categorization system',
      parameters: z.object({
        project_id: z.string(),
        assessment_type: z.enum(['Internal', 'External']).optional().describe('Filter by internal or external meetings'),
      }),
      inject: { project_id },
      async execute({ project_id, assessment_type }) {
        let query = `
          SELECT DISTINCT
            mc.name as category_name,
            mc.assessment_type,
            COUNT(*) as usage_count
          FROM meeting_categorizations mc
          WHERE 1=1
        `;

        if (assessment_type) {
          query += ` AND mc.assessment_type = '${assessment_type}'`;
        }

        query += `
          GROUP BY mc.name, mc.assessment_type
          ORDER BY usage_count DESC;
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_meeting_stats: injectableTool({
      description: 'Get aggregated statistics about meetings (total count, by category, by month, etc.)',
      parameters: z.object({
        project_id: z.string(),
        group_by: z.enum(['category', 'month', 'assessment_type', 'all']).default('all').describe('How to group the statistics'),
      }),
      inject: { project_id },
      async execute({ project_id, group_by = 'all' }) {
        let query = '';

        if (group_by === 'category' || group_by === 'all') {
          query += `
            -- Stats by category
            SELECT 
              mc.name as category_name,
              mc.assessment_type,
              COUNT(*) as meeting_count
            FROM meetings m
            LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
            GROUP BY mc.name, mc.assessment_type
            ORDER BY meeting_count DESC;
          `;
        }

        if (group_by === 'month' || group_by === 'all') {
          if (query) query += '\n\n';
          query += `
            -- Stats by month
            SELECT 
              DATE_TRUNC('month', m.fireflies_timestamp) as month,
              COUNT(*) as meeting_count,
              COUNT(DISTINCT m.fireflies_id) as unique_meetings
            FROM meetings m
            GROUP BY month
            ORDER BY month DESC;
          `;
        }

        if (group_by === 'assessment_type' || group_by === 'all') {
          if (query) query += '\n\n';
          query += `
            -- Stats by assessment type
            SELECT 
              mc.assessment_type,
              COUNT(*) as meeting_count
            FROM meetings m
            LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
            GROUP BY mc.assessment_type
            ORDER BY meeting_count DESC;
          `;
        }

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_meeting_by_fireflies_id: injectableTool({
      description: 'Get complete details of a specific meeting by its Fireflies ID',
      parameters: z.object({
        project_id: z.string(),
        fireflies_id: z.string().describe('The Fireflies meeting ID to retrieve'),
      }),
      inject: { project_id },
      async execute({ project_id, fireflies_id }) {
        const query = `
          SELECT 
            m.id,
            m.fireflies_id,
            m.fireflies_title,
            m.fireflies_timestamp,
            m.fireflies_meeting_summary,
            m.fireflies_transcript,
            m.contacts_name_and_email,
            m.meeting_categorization_by_ai_id,
            mc.name as category_name,
            mc.assessment_type,
            mc.meeting_category_rationale,
            m.created_at,
            m.updated_at
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE m.fireflies_id = '${fireflies_id}';
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_recent_meetings: injectableTool({
      description: 'Get the most recent meetings, optionally filtered by days back',
      parameters: z.object({
        project_id: z.string(),
        days_back: z.number().default(7).describe('Number of days to look back (default: 7)'),
        limit: z.number().default(50).describe('Maximum number of results (default: 50)'),
      }),
      inject: { project_id },
      async execute({ project_id, days_back = 7, limit = 50 }) {
        const query = `
          SELECT 
            m.id,
            m.fireflies_id,
            m.fireflies_title,
            m.fireflies_timestamp,
            m.fireflies_meeting_summary,
            m.contacts_name_and_email,
            mc.name as category_name,
            mc.assessment_type,
            m.created_at
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE m.fireflies_timestamp >= NOW() - INTERVAL '${days_back} days'
          ORDER BY m.fireflies_timestamp DESC
          LIMIT ${limit};
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_external_contacts: injectableTool({
      description: 'Get list of external contacts from meeting participants, with meeting count',
      parameters: z.object({
        project_id: z.string(),
        limit: z.number().default(100).describe('Maximum number of contacts to return (default: 100)'),
      }),
      inject: { project_id },
      async execute({ project_id, limit = 100 }) {
        const query = `
          SELECT 
            contacts_name_and_email,
            COUNT(*) as meeting_count,
            MAX(fireflies_timestamp) as last_meeting_date,
            ARRAY_AGG(DISTINCT mc.name) FILTER (WHERE mc.name IS NOT NULL) as categories
          FROM meetings m
          LEFT JOIN meeting_categorizations mc ON m.meeting_categorization_by_ai_id = mc.id
          WHERE mc.assessment_type = 'External'
          AND contacts_name_and_email IS NOT NULL
          GROUP BY contacts_name_and_email
          ORDER BY meeting_count DESC
          LIMIT ${limit};
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),

    get_user_list: injectableTool({
      description: 'Get list of all users in the Maia system',
      parameters: z.object({
        project_id: z.string(),
      }),
      inject: { project_id },
      async execute({ project_id }) {
        const query = `
          SELECT 
            id,
            email,
            created_at
          FROM users
          ORDER BY created_at DESC;
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: true,
        });
        return result;
      },
    }),
  };
}
