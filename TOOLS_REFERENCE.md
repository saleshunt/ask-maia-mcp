# Ask Emile Tools - Complete Reference

## Overview

The Ask Emile MCP server provides specialized tools for querying and understanding Emile's reminder database. All tools are optimized for natural language queries and return structured JSON data.

---

## 🔍 Tool Catalog

### 1. `get_all_reminders`

**Purpose**: Retrieve reminders with flexible filtering options

**Parameters**:

- `status` (optional): Filter by status
  - Values: `scheduled`, `pending`, `sent`, `cancelled`, `skipped`, `rescheduled`, `failed`
- `sender_email` (optional): Filter by sender email address
- `from_date` (optional): Start date (YYYY-MM-DD)
- `to_date` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Max results (default: 100)

**Example Queries**:

- "Get all scheduled reminders"
- "Show me sent reminders from Wouter"
- "Find reminders scheduled between 2025-10-01 and 2025-10-31"

**Returns**: Array of reminder objects with full details

---

### 2. `get_reminders_by_recipient`

**Purpose**: Find all reminders sent to a specific email address

**Parameters**:

- `email` (required): Recipient email to search for
- `status` (optional): Filter by status

**Example Queries**:

- "Show reminders for hdevries@blomelektrotechniek.nl"
- "Get all scheduled reminders to emile@generativeaistrategy.com"
- "Find sent reminders for tessa.hollingsworth@northridgelaw.com"

**Returns**: Array of reminders for the specified recipient

---

### 3. `get_reminder_stats`

**Purpose**: Get statistical analysis of reminders

**Parameters**:

- `group_by` (optional): How to group statistics
  - Values: `status`, `sender`, `date`, `all`
  - Default: `all`

**Example Queries**:

- "Give me reminder statistics by status"
- "Show me stats grouped by sender"
- "What's the distribution of reminders by date?"
- "Get all reminder statistics"

**Returns**:

- By status: Count, earliest date, latest date per status
- By sender: Total, scheduled, sent, failed counts per sender
- By date: Upcoming scheduled reminders grouped by date

---

### 4. `search_reminders_by_subject`

**Purpose**: Full-text search in reminder subjects and reasons

**Parameters**:

- `search_term` (required): Text to search for
- `status` (optional): Filter by status
- `limit` (optional): Max results (default: 50)

**Example Queries**:

- "Search for reminders about 'AI Champions'"
- "Find reminders mentioning 'workshop'"
- "Search scheduled reminders for 'follow up'"

**Returns**: Array of matching reminders with subject and reason

---

### 5. `get_upcoming_reminders`

**Purpose**: View reminders scheduled in the near future

**Parameters**:

- `days_ahead` (optional): Days to look ahead (default: 7)
- `sender_email` (optional): Filter by sender

**Example Queries**:

- "What reminders are coming up this week?"
- "Show me reminders in the next 14 days"
- "Get Wouter's upcoming reminders for the next 30 days"

**Returns**: Array of upcoming scheduled/pending reminders

---

### 6. `get_failed_reminders`

**Purpose**: Analyze failed reminders with failure reasons

**Parameters**:

- `limit` (optional): Max results (default: 50)

**Example Queries**:

- "Show me all failed reminders"
- "What reminders failed and why?"
- "Get the last 10 failed reminders"

**Returns**: Array of failed reminders with failure reasons and attempt counts

---

### 7. `get_reminder_by_id`

**Purpose**: Get complete details for a specific reminder

**Parameters**:

- `reminder_id` (required): UUID of the reminder

**Example Queries**:

- "Get details for reminder fae8efc4-2bcd-4698-8ede-d28d8312049d"
- "Show me full info for reminder ID 13a16236-36ba-43a0-898f-0526bab7ec5b"

**Returns**: Complete reminder object with all fields including metadata

---

### 8. `get_conversation_reminders`

**Purpose**: Get all reminders for a specific email conversation

**Parameters**:

- `conversation_id` (required): The conversation/thread ID

**Example Queries**:

- "Show all reminders for conversation ID <MessageID>"
- "Get reminders in this email thread"

**Returns**: Array of reminders for the conversation, ordered by creation date

---

## 📊 Data Structure

### Reminder Object Fields

```typescript
{
  id: string;                    // UUID
  conversation_id: string;       // Email thread ID
  subject: string;               // Email subject
  recipient_email: string;       // JSON array of recipients
  sender_email: string;          // Who sent the original email
  reminder_reason: string;       // Why this reminder was created
  scheduled_for: date;           // When to send reminder
  status: string;                // Current status
  attempts: number;              // Send attempt count
  created_at: timestamp;         // When created
  updated_at: timestamp;         // Last updated
  last_checked_at?: timestamp;   // Last check time
  next_check_at?: timestamp;     // Next scheduled check
  fail_reason?: string;          // Why it failed
  meta?: object;                 // Additional metadata
  internet_message_id?: string;  // Original email ID
}
```

### Status Values

- `scheduled`: Not yet processed
- `pending`: Being processed
- `sent`: Successfully sent
- `cancelled`: Manually cancelled
- `skipped`: Skipped for a reason
- `rescheduled`: Moved to different date
- `failed`: Failed to send

---

## 🎯 Common Use Cases

### Daily Reminder Check

```
"What reminders are scheduled for today?"
"Show me upcoming reminders in the next 3 days"
```

### Performance Monitoring

```
"How many reminders have failed this week?"
"Get statistics on reminder statuses"
"Show me Guido's reminder success rate"
```

### Client Follow-up

```
"Find all reminders for [client email]"
"Search reminders about [company name]"
"Show scheduled reminders for [specific topic]"
```

### Data Quality

```
"Show me reminders with invalid dates"
"Find reminders scheduled in the past"
"Get all failed reminders and their reasons"
```

### Team Analytics

```
"Compare reminder counts by sender"
"Who has the most scheduled reminders?"
"Show me stats grouped by sender"
```

---

## 🔒 Security Features

All tools in Ask Emile are designed with security in mind:

1. **Read-only by default**: Cannot modify data
2. **SQL injection protection**: Uses parameterized queries
3. **Project scoping**: Only accesses specified project
4. **Token-based auth**: Requires valid Supabase token

---

## 💡 Best Practices

### When to Use Each Tool

- **Broad search**: `get_all_reminders` with filters
- **Specific person**: `get_reminders_by_recipient`
- **Text search**: `search_reminders_by_subject`
- **Time-based**: `get_upcoming_reminders`
- **Analytics**: `get_reminder_stats`
- **Debugging**: `get_failed_reminders`, `get_reminder_by_id`
- **Thread tracking**: `get_conversation_reminders`

### Combining Tools

The AI can chain multiple tool calls:

```
"Show me stats for all reminders, then give me details
on the top 5 upcoming ones"
```

This will:

1. Call `get_reminder_stats`
2. Call `get_upcoming_reminders` with limit=5
3. Present combined analysis

---

## 🚀 Advanced Queries

### Complex Filtering

```
"Show me all scheduled reminders from Wouter
sent in October that mention 'AI' in the subject"
```

### Comparative Analysis

```
"Compare Wouter's and Guido's reminder patterns -
how many does each have scheduled, sent, and failed?"
```

### Trend Analysis

```
"What's the trend in failed reminders over the last month?
Group by week and show failure reasons."
```

---

## 📈 Performance Notes

- **Fast queries**: `get_reminder_by_id`, `get_reminder_stats`
- **Medium queries**: `get_reminders_by_recipient`, `get_upcoming_reminders`
- **Slower queries**: `search_reminders_by_subject` (full-text search)

**Tip**: Use specific filters to improve performance

---

## 🔄 Updates & Maintenance

### Adding New Tools

1. Edit `src/tools/ask-emile-tools.ts`
2. Follow the existing pattern
3. Add input schema validation
4. Implement handler with SQL query
5. Rebuild: `npm run build`
6. Restart Cursor

### Modifying Existing Tools

1. Update the tool in `ask-emile-tools.ts`
2. Test SQL query separately first
3. Rebuild and restart Cursor
4. Update this documentation

---

## 📞 Support

For issues or questions:

1. Check `SETUP.md` for configuration
2. Review logs in Cursor's MCP panel
3. Verify database connection
4. Check SQL syntax in tool definitions

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025
