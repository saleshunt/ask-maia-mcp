import { type Tool } from '@supabase/mcp-utils';
import { z } from 'zod';
import type { SupabasePlatform } from '../platform/types.js';
import { injectableTool } from './util.js';

export type AskMaiaWriteToolsOptions = {
  platform: SupabasePlatform;
  projectId?: string;
};

/**
 * Creates write tools for modifying Maia's meeting automation database
 * All tools require explicit confirmation for safety
 */
export function getAskMaiaWriteTools(options: AskMaiaWriteToolsOptions): Record<string, Tool> {
  const { platform, projectId } = options;
  const project_id = projectId;

  return {
    update_meeting_category: injectableTool({
      description: 'Update the AI categorization for a specific meeting. REQUIRES explicit user confirmation.',
      parameters: z.object({
        project_id: z.string(),
        fireflies_id: z.string().describe('The Fireflies meeting ID to update'),
        category_id: z.string().describe('The new meeting category ID'),
        assessment_type: z.enum(['Internal', 'External']).describe('Internal or External meeting type'),
        rationale: z.string().optional().describe('Optional rationale for the categorization change'),
        confirm: z.boolean().describe('REQUIRED: Must be true to confirm the user explicitly wants to update this meeting'),
      }),
      inject: { project_id },
      async execute({ project_id, fireflies_id, category_id, assessment_type, rationale, confirm }) {
        if (!confirm) {
          throw new Error(
            'SAFETY CHECK: Cannot update meeting category without explicit confirmation. ' +
            'Please ask the user to confirm they want to update this meeting categorization.'
          );
        }

        const query = `
          UPDATE meeting_categorization_by_ai
          SET 
            meeting_category_id = '${category_id}',
            assessment_type = '${assessment_type}'
            ${rationale ? `, meeting_category_rationale = '${rationale.replace(/'/g, "''")}'` : ''}
          FROM meetings m
          WHERE meeting_categorization_by_ai.id = m.meeting_categorization_by_ai_id
            AND m.fireflies_id = '${fireflies_id}'
          RETURNING meeting_categorization_by_ai.*;
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: false,
        });

        return { 
          success: true, 
          updated_record: result[0],
          message: `Successfully updated meeting categorization for Fireflies ID: ${fireflies_id}` 
        };
      },
    }),

    delete_meeting: injectableTool({
      description: 'PERMANENTLY delete a meeting from the database. REQUIRES explicit user confirmation. Use with extreme caution.',
      parameters: z.object({
        project_id: z.string(),
        fireflies_id: z.string().describe('The Fireflies meeting ID to delete'),
        confirm: z.boolean().describe('REQUIRED: Must be true to confirm the user explicitly wants to DELETE this meeting permanently'),
      }),
      inject: { project_id },
      async execute({ project_id, fireflies_id, confirm }) {
        if (!confirm) {
          throw new Error(
            'SAFETY CHECK: Cannot delete meeting without explicit confirmation. ' +
            'Please ask the user to confirm they want to PERMANENTLY DELETE this meeting.'
          );
        }

        // First, get the meeting details for confirmation
        const checkQuery = `
          SELECT fireflies_id, fireflies_title, fireflies_timestamp
          FROM meetings
          WHERE fireflies_id = '${fireflies_id}';
        `;
        
        const existing = await platform.executeSql(project_id, {
          query: checkQuery,
          read_only: true,
        });

        if (existing.length === 0) {
          throw new Error(`Meeting with Fireflies ID ${fireflies_id} not found.`);
        }

        // Delete the meeting
        const deleteQuery = `
          DELETE FROM meetings
          WHERE fireflies_id = '${fireflies_id}'
          RETURNING fireflies_id, fireflies_title;
        `;

        const result = await platform.executeSql(project_id, {
          query: deleteQuery,
          read_only: false,
        });

        return { 
          success: true, 
          deleted_record: result[0],
          message: `Successfully deleted meeting: ${result[0]?.fireflies_title || fireflies_id}` 
        };
      },
    }),

    insert_meeting_note: injectableTool({
      description: 'Add a custom note or annotation to a meeting. REQUIRES explicit user confirmation.',
      parameters: z.object({
        project_id: z.string(),
        fireflies_id: z.string().describe('The Fireflies meeting ID to add a note to'),
        note_content: z.string().describe('The note/annotation content to add'),
        confirm: z.boolean().describe('REQUIRED: Must be true to confirm the user explicitly wants to add this note'),
      }),
      inject: { project_id },
      async execute({ project_id, fireflies_id, note_content, confirm }) {
        if (!confirm) {
          throw new Error(
            'SAFETY CHECK: Cannot insert meeting note without explicit confirmation. ' +
            'Please ask the user to confirm they want to add this note.'
          );
        }

        // Append to the meeting summary or add to a notes field
        const query = `
          UPDATE meetings
          SET 
            fireflies_meeting_summary = COALESCE(fireflies_meeting_summary, '') || 
              E'\n\n--- User Note (${new Date().toISOString()}) ---\n' || 
              '${note_content.replace(/'/g, "''")}'
          WHERE fireflies_id = '${fireflies_id}'
          RETURNING fireflies_id, fireflies_title;
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: false,
        });

        if (result.length === 0) {
          throw new Error(`Meeting with Fireflies ID ${fireflies_id} not found.`);
        }

        return { 
          success: true, 
          updated_record: result[0],
          message: `Successfully added note to meeting: ${result[0]?.fireflies_title || fireflies_id}` 
        };
      },
    }),

    update_email_status: injectableTool({
      description: 'Update the status or content of an AI-generated email. REQUIRES explicit user confirmation.',
      parameters: z.object({
        project_id: z.string(),
        email_id: z.string().describe('The email ID to update'),
        subject: z.string().optional().describe('New email subject'),
        body: z.string().optional().describe('New email body content'),
        confirm: z.boolean().describe('REQUIRED: Must be true to confirm the user explicitly wants to update this email'),
      }),
      inject: { project_id },
      async execute({ project_id, email_id, subject, body, confirm }) {
        if (!confirm) {
          throw new Error(
            'SAFETY CHECK: Cannot update email without explicit confirmation. ' +
            'Please ask the user to confirm they want to update this email.'
          );
        }

        const updates: string[] = [];
        if (subject) {
          updates.push(`generated_email_subject = '${subject.replace(/'/g, "''")}'`);
        }
        if (body) {
          updates.push(`generated_email_body = '${body.replace(/'/g, "''")}'`);
        }

        if (updates.length === 0) {
          throw new Error('No updates specified. Please provide subject or body to update.');
        }

        const query = `
          UPDATE emails_created_by_ai
          SET ${updates.join(', ')}
          WHERE id = '${email_id}'
          RETURNING id, fireflies_id, generated_email_subject;
        `;

        const result = await platform.executeSql(project_id, {
          query,
          read_only: false,
        });

        if (result.length === 0) {
          throw new Error(`Email with ID ${email_id} not found.`);
        }

        return { 
          success: true, 
          updated_record: result[0],
          message: `Successfully updated email: ${result[0]?.generated_email_subject || email_id}` 
        };
      },
    }),
  };
}

