# Ask Maia MCP Server

> Query and modify Maia's meeting automation database - meetings, AI categorizations, generated emails, and more.

An MCP (Model Context Protocol) server optimized for interacting with Maia's Supabase database. This server provides specialized tools for understanding meetings, AI-generated content, participant tracking, workflow analytics, and safe data modification with built-in confirmation safeguards.

## 🎯 What is Maia?

Maia is an intelligent meeting automation workflow that:

- Captures meeting transcripts from Fireflies.ai
- Uses AI to categorize meetings (internal/external, sales, demo, etc.)
- Generates personalized follow-up emails via AI (Claude Sonnet 4)
- Manages contacts and syncs with CRM (Pipedrive)
- Stores everything in Supabase for easy access

## Features

### Ask Maia Tools (10 Custom Tools)

#### Meeting Analysis

- `get_meetings_by_category` - Filter meetings by AI category (sales, demo, internal, etc.)
- `search_meeting_transcripts` - Full-text search across transcripts and summaries
- `get_meetings_by_participant` - Find all meetings with specific person
- `get_recent_meetings` - View recently processed meetings
- `get_meeting_by_fireflies_id` - Lookup by Fireflies ID

#### AI Content Analysis

- `get_ai_generated_emails` - View AI-created follow-up emails (draft/sent)
- `get_meeting_categories` - See configured categories with AI prompts
- `get_meeting_stats` - Analytics by category, user, type, date

#### Contact & CRM

- `get_external_contacts` - All external participants with meeting frequency
- `get_user_list` - All users in Maia with company info

### Data Modification Tools (🔒 Require Confirmation)

- `update_meeting_category` - Change AI categorization for a meeting
- `delete_meeting` - Permanently remove a meeting from database
- `insert_meeting_note` - Add custom notes/annotations to meetings
- `update_email_status` - Modify AI-generated email content

**🛡️ Safety:** All write operations require explicit user confirmation via `confirm: true` parameter.

### Standard Database Tools

- `execute_sql`: Run SQL queries (supports INSERT/UPDATE/DELETE with confirmation)
- `apply_migration`: Apply schema changes (DDL operations)
- `list_tables`: See all tables in database
- `list_extensions`: List PostgreSQL extensions

### Debugging Tools

- `get_logs`: View logs by service type
- `get_advisors`: Check for security/performance issues

---

## 📚 Documentation

- **[WRITE_OPERATIONS_GUIDE.md](./WRITE_OPERATIONS_GUIDE.md)** - Complete guide to data modification tools, safety mechanisms, and usage examples
- **[TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md)** - Full reference of all available MCP tools
- **[SETUP.md](./SETUP.md)** - Installation and configuration instructions

## Prerequisites

- Node.js (check with `node -v`)
- Supabase access token
- Project reference for Maia's database: `wgiqrcygrggbnlpovgzk`

## Setup

### 1. Get Your Credentials

1. **Personal Access Token**: Go to [Supabase Settings](https://supabase.com/dashboard/account/tokens) and create a token
2. **Project Reference**: Use `wgiqrcygrggbnlpovgzk` for Maia

### 2. Configure MCP Client

Add this to your MCP configuration (e.g., in Cursor's `mcp.json`):

**Windows (cmd):**

```json
{
  "mcpServers": {
    "ask-maia": {
      "command": "cmd",
      "args": [
        "/c",
        "node",
        "C:\\Users\\woute\\OneDrive\\Documenten\\GitHub\\MCP\\ask-maia-mcp\\packages\\mcp-server-supabase\\dist\\transports\\stdio.js",
        "--project-ref=wgiqrcygrggbnlpovgzk",
        "--read-only"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### 3. Build the Server

Before using the server, build it:

```bash
cd C:\Users\woute\OneDrive\Documenten\GitHub\MCP\ask-maia-mcp
npm install
npm run build
```

## Database Schema Overview

### Core Tables

**meetings** - Main meeting records

- Fireflies integration data (ID, title, timestamp, link)
- Full transcripts and AI summaries
- Participant information
- Links to categorization and emails

**meeting_categorization_by_ai** - AI categorization assignments

- Assessment type (Internal/External)
- Category ID (links to meeting_categories)
- Detailed rationale from AI
- Confidence score

**meeting_categories** - Category definitions

- Category name and description
- System prompts for categorization
- Created by users or system

**emails_created_by_ai** - Generated follow-up emails

- Email title and HTML body
- Sent status and timestamps
- Attachment requirements

**contacts** - Meeting participants

- Internal vs external classification
- Company affiliations
- Meeting frequency tracking

**meeting_categories** - User-defined categories

- Category names and descriptions
- AI prompts for categorization
- Email generation templates

**users** - Maia users

- Company associations
- Fireflies integration credentials
- Email writing preferences

**companies** - Organization profiles

- Team descriptions
- Value propositions
- Standard email guidelines

## Example Queries

Once configured, you can ask your AI assistant:

### Meeting Discovery

- "Show me all sales calls from the last week"
- "Find meetings with john@example.com"
- "Search for meetings about 'AI strategy'"
- "What meetings happened yesterday?"

### AI Analysis

- "Show me all external meetings categorized as 'Product Demo'"
- "Get AI-generated emails that haven't been sent yet"
- "What are the active meeting categories?"

### Analytics

- "Give me meeting statistics grouped by category"
- "How many internal vs external meetings this month?"
- "Show me the most frequent external contacts"

### User Management

- "List all users and their meeting counts"
- "Show me meetings for user@company.com"

## Tool Details

### `get_meetings_by_category`

Filter meetings by AI-assigned category type

- Parameters: category_name, assessment_type (Internal/External), limit
- Returns: Meetings with full categorization details

### `search_meeting_transcripts`

Full-text search across all meeting content

- Parameters: search_term, limit
- Searches: titles, summaries, transcripts, overviews

### `get_ai_generated_emails`

View AI-created follow-up emails

- Parameters: status (draft/sent), user_id, limit
- Returns: Email content, meeting context, send status

### `get_meetings_by_participant`

Find meetings with specific participants

- Parameters: participant_email, participant_name
- Returns: All meetings with that person

### `get_meeting_categories`

View configured categories and AI prompts

- Parameters: user_id, active_only
- Returns: Category definitions with prompts

### `get_meeting_stats`

Analytics and statistics

- Parameters: group_by (category/user/type/date), date range
- Returns: Aggregated statistics

### `get_meeting_by_fireflies_id`

Lookup specific meeting by Fireflies ID

- Parameters: fireflies_id
- Returns: Complete meeting details

### `get_recent_meetings`

Recently processed meetings

- Parameters: days (default: 7), user_id, limit
- Returns: Recent meetings with categorizations

### `get_external_contacts`

External participants analysis

- Parameters: company_name, min_meetings
- Returns: Contacts with meeting frequency

### `get_user_list`

All Maia users

- Parameters: company_id
- Returns: Users with company info and meeting counts

## Configuration Options

- `--project-ref=<ref>`: Scope to Maia's project (wgiqrcygrggbnlpovgzk)
- `--read-only`: Restrict to read-only queries (**recommended**)
- `--features=<features>`: Enable specific tool groups

Available feature groups:

- `ask-maia`: Custom Maia query tools (enabled by default)
- `database`: Standard database operations (enabled by default)
- `debug`: Logging and debugging tools (enabled by default)
- `account`: Account-level operations (disabled)
- `branching`: Branch management (disabled)
- `development`: Dev tools (disabled)
- `docs`: Supabase documentation search (disabled)
- `functions`: Edge function management (disabled)
- `storage`: Storage bucket management (disabled)

## Security

- Always use `--read-only` when querying production data
- Project scoped to Maia's database only
- Keep your access token secure
- Review all SQL queries before execution

## Workflow Integration

Maia's workflow processes meetings through several stages:

1. **Fireflies Webhook** → Meeting transcript received
2. **Meeting Creation** → Saved to Supabase
3. **Contact Processing** → Internal/external participants identified
4. **AI Categorization** → Meeting classified (o3-mini model)
5. **Email Generation** → Follow-up email created (Claude Sonnet 4)
6. **Attachments** → Related files associated

This MCP server lets you query the results of this entire workflow!

## Development

### Project Structure

```
ask-maia-mcp/
├── packages/
│   ├── mcp-server-supabase/
│   │   ├── src/
│   │   │   ├── tools/
│   │   │   │   └── ask-maia-tools.ts  # 🎯 Custom Maia tools
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   ├── dist/
│   │   └── package.json
│   └── mcp-utils/
└── package.json
```

### Building

```bash
npm install
npm run build
```

## Based On

This server is based on the official [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase) and customized for Maia's meeting automation database.

## License

Apache 2.0 - See LICENSE file for details.
