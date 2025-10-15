import { Tool } from '@supabase/mcp-utils';
import { z } from 'zod';
import type { SupabasePlatform } from '../platform/types.js';

export type AskEmileToolsOptions = {
  platform: SupabasePlatform;
  projectId?: string;
};

/**
 * Creates tools for querying Emile's database (reminders, conversations, etc.)
 */
export function getAskEmileTools(options: AskEmileToolsOptions): Record<string, Tool> {
  const { platform, projectId } = options;

  return {
    get_all_reminders: {
      description: 'Get all reminders with optional filtering by status, sender, or date range',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['scheduled', 'pending', 'sent', 'cancelled', 'skipped', 'rescheduled', 'failed'],
            description: 'Filter by reminder status',
          },
          sender_email: {
            type: 'string',
            description: 'Filter by sender email address',
          },
          from_date: {
            type: 'string',
            description: 'Filter reminders scheduled from this date (YYYY-MM-DD)',
          },
          to_date: {
            type: 'string',
            description: 'Filter reminders scheduled to this date (YYYY-MM-DD)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 100)',
            default: 100,
          },
        },
      },
      async handler({ status, sender_email, from_date, to_date, limit = 100 }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        let query = `
          SELECT 
            id,
            conversation_id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            attempts,
            created_at,
            updated_at,
            last_checked_at,
            next_check_at,
            fail_reason,
            meta,
            internet_message_id
          FROM reminders
          WHERE 1=1
        `;

        if (status) {
          query += ` AND status = '${status}'`;
        }
        if (sender_email) {
          query += ` AND sender_email = '${sender_email}'`;
        }
        if (from_date) {
          query += ` AND scheduled_for >= '${from_date}'`;
        }
        if (to_date) {
          query += ` AND scheduled_for <= '${to_date}'`;
        }

        query += ` ORDER BY scheduled_for ASC LIMIT ${limit};`;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} reminders:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    get_reminders_by_recipient: {
      description: 'Get all reminders for a specific recipient email',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'The recipient email address to search for',
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'pending', 'sent', 'cancelled', 'skipped', 'rescheduled', 'failed'],
            description: 'Optional: Filter by status',
          },
        },
        required: ['email'],
      },
      async handler({ email, status }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        let query = `
          SELECT 
            id,
            conversation_id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            attempts,
            created_at,
            updated_at,
            fail_reason
          FROM reminders
          WHERE recipient_email::text ILIKE '%${email}%'
        `;

        if (status) {
          query += ` AND status = '${status}'`;
        }

        query += ` ORDER BY scheduled_for DESC;`;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} reminders for ${email}:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    get_reminder_stats: {
      description: 'Get statistics about reminders (count by status, by sender, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          group_by: {
            type: 'string',
            enum: ['status', 'sender', 'date', 'all'],
            description: 'How to group the statistics',
            default: 'all',
          },
        },
      },
      async handler({ group_by = 'all' }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        let query = '';

        if (group_by === 'status' || group_by === 'all') {
          query += `
            -- Stats by status
            SELECT 
              status,
              COUNT(*) as count,
              MIN(scheduled_for) as earliest_date,
              MAX(scheduled_for) as latest_date
            FROM reminders
            GROUP BY status
            ORDER BY count DESC;
          `;
        }

        if (group_by === 'sender' || group_by === 'all') {
          if (query) query += '\n\n';
          query += `
            -- Stats by sender
            SELECT 
              sender_email,
              COUNT(*) as total_count,
              COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
              COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
              COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
            FROM reminders
            GROUP BY sender_email
            ORDER BY total_count DESC;
          `;
        }

        if (group_by === 'date' || group_by === 'all') {
          if (query) query += '\n\n';
          query += `
            -- Stats by date (upcoming scheduled)
            SELECT 
              scheduled_for,
              COUNT(*) as reminder_count,
              array_agg(DISTINCT sender_email) as senders
            FROM reminders
            WHERE status IN ('scheduled', 'pending')
            GROUP BY scheduled_for
            ORDER BY scheduled_for ASC
            LIMIT 30;
          `;
        }

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Reminder Statistics:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    search_reminders_by_subject: {
      description: 'Search reminders by subject or reminder reason text',
      inputSchema: {
        type: 'object',
        properties: {
          search_term: {
            type: 'string',
            description: 'The text to search for in subject or reminder_reason',
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'pending', 'sent', 'cancelled', 'skipped', 'rescheduled', 'failed'],
            description: 'Optional: Filter by status',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 50)',
            default: 50,
          },
        },
        required: ['search_term'],
      },
      async handler({ search_term, status, limit = 50 }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        let query = `
          SELECT 
            id,
            conversation_id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            created_at
          FROM reminders
          WHERE (
            subject ILIKE '%${search_term}%' 
            OR reminder_reason ILIKE '%${search_term}%'
          )
        `;

        if (status) {
          query += ` AND status = '${status}'`;
        }

        query += ` ORDER BY scheduled_for DESC LIMIT ${limit};`;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} reminders matching "${search_term}":\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    get_upcoming_reminders: {
      description: 'Get upcoming scheduled reminders within a date range',
      inputSchema: {
        type: 'object',
        properties: {
          days_ahead: {
            type: 'number',
            description: 'Number of days ahead to look (default: 7)',
            default: 7,
          },
          sender_email: {
            type: 'string',
            description: 'Optional: Filter by sender email',
          },
        },
      },
      async handler({ days_ahead = 7, sender_email }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        let query = `
          SELECT 
            id,
            conversation_id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            attempts,
            next_check_at
          FROM reminders
          WHERE status IN ('scheduled', 'pending')
            AND scheduled_for >= CURRENT_DATE
            AND scheduled_for <= CURRENT_DATE + INTERVAL '${days_ahead} days'
        `;

        if (sender_email) {
          query += ` AND sender_email = '${sender_email}'`;
        }

        query += ` ORDER BY scheduled_for ASC;`;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} upcoming reminders in the next ${days_ahead} days:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    get_failed_reminders: {
      description: 'Get all failed reminders with failure reasons',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 50)',
            default: 50,
          },
        },
      },
      async handler({ limit = 50 }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        const query = `
          SELECT 
            id,
            conversation_id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            attempts,
            fail_reason,
            created_at,
            updated_at
          FROM reminders
          WHERE status = 'failed'
          ORDER BY updated_at DESC
          LIMIT ${limit};
        `;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} failed reminders:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },

    get_reminder_by_id: {
      description: 'Get detailed information about a specific reminder by ID',
      inputSchema: {
        type: 'object',
        properties: {
          reminder_id: {
            type: 'string',
            description: 'The UUID of the reminder',
          },
        },
        required: ['reminder_id'],
      },
      async handler({ reminder_id }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        const query = `
          SELECT * FROM reminders
          WHERE id = '${reminder_id}';
        `;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: result.length > 0 
                ? `Reminder details:\n\n${JSON.stringify(result[0], null, 2)}`
                : `No reminder found with ID: ${reminder_id}`,
            },
          ],
        };
      },
    },

    get_conversation_reminders: {
      description: 'Get all reminders for a specific conversation ID',
      inputSchema: {
        type: 'object',
        properties: {
          conversation_id: {
            type: 'string',
            description: 'The conversation ID (internet message ID)',
          },
        },
        required: ['conversation_id'],
      },
      async handler({ conversation_id }) {
        const ref = projectId ?? (await platform.promptForProjectSelection());

        const query = `
          SELECT 
            id,
            subject,
            recipient_email,
            sender_email,
            reminder_reason,
            scheduled_for,
            status,
            attempts,
            created_at,
            updated_at,
            fail_reason
          FROM reminders
          WHERE conversation_id = '${conversation_id}'
          ORDER BY created_at DESC;
        `;

        const result = await platform.executeQuery({ projectRef: ref, query });
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.length} reminders for conversation ${conversation_id}:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
    },
  };
}

