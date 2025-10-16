# Write Operations Guide - Ask-Maia MCP Server

**Date:** October 16, 2025  
**Status:** ✅ ENABLED with Safety Confirmation  
**Security Level:** HIGH - All write operations require explicit user confirmation

---

## Overview

The Ask-Maia MCP Server now supports **write operations** (INSERT/UPDATE/DELETE) with built-in safety mechanisms. All data modification operations require explicit confirmation to prevent accidental changes.

---

## 🔒 Safety Mechanism

### Confirmation Requirement

**ALL write operations require `confirm: true` parameter**

- ❌ Without confirmation → Operation blocked with error
- ✅ With `confirm: true` → Operation executes successfully
- 🛡️ AI agents must ask user for explicit permission before setting confirm=true

### Example Safety Check

```typescript
// ❌ THIS WILL FAIL
execute_sql({
  query: "UPDATE meetings SET fireflies_title = 'New Title' WHERE id = '123'",
});
// Error: SAFETY CHECK - Must set confirm=true

// ✅ THIS WILL SUCCEED
execute_sql({
  query: "UPDATE meetings SET fireflies_title = 'New Title' WHERE id = '123'",
  confirm: true, // User explicitly confirmed
});
```

---

## 📋 Available Write Tools

### 1. Generic SQL Execution

**Tool:** `execute_sql`

**Description:** Execute any SQL query (including INSERT/UPDATE/DELETE)

**Parameters:**

- `query` (string) - SQL query to execute
- `confirm` (boolean) - **REQUIRED for write operations** - Must be true for INSERT/UPDATE/DELETE

**Example:**

```typescript
// Update meeting category
await execute_sql({
  query: `
    UPDATE meetings 
    SET fireflies_meeting_summary = 'Updated summary'
    WHERE fireflies_id = 'abc123'
  `,
  confirm: true,
});
```

---

### 2. Update Meeting Category

**Tool:** `update_meeting_category`

**Description:** Change the AI categorization for a specific meeting

**Parameters:**

- `fireflies_id` (string) - Meeting ID to update
- `category_id` (string) - New category ID
- `assessment_type` ('Internal' | 'External') - Meeting type
- `rationale` (string, optional) - Reason for change
- `confirm` (boolean) - **REQUIRED** - Must be true

**Example:**

```typescript
await update_meeting_category({
  fireflies_id: "abc123",
  category_id: "cat-456",
  assessment_type: "External",
  rationale: "Reclassified as client meeting",
  confirm: true,
});
```

**Returns:**

```json
{
  "success": true,
  "updated_record": { "id": "...", "meeting_category_id": "cat-456" },
  "message": "Successfully updated meeting categorization for Fireflies ID: abc123"
}
```

---

### 3. Delete Meeting

**Tool:** `delete_meeting`

**Description:** ⚠️ **PERMANENTLY** delete a meeting from the database

**Parameters:**

- `fireflies_id` (string) - Meeting ID to delete
- `confirm` (boolean) - **REQUIRED** - Must be true

**Example:**

```typescript
await delete_meeting({
  fireflies_id: "abc123",
  confirm: true,
});
```

**⚠️ WARNING:**

- This is a **permanent deletion**
- Cannot be undone
- All associated data will be removed
- Use with extreme caution

**Returns:**

```json
{
  "success": true,
  "deleted_record": { "fireflies_id": "abc123", "fireflies_title": "..." },
  "message": "Successfully deleted meeting: Client Call - Q4 Review"
}
```

---

### 4. Insert Meeting Note

**Tool:** `insert_meeting_note`

**Description:** Add a custom note or annotation to a meeting

**Parameters:**

- `fireflies_id` (string) - Meeting ID to add note to
- `note_content` (string) - The note text to add
- `confirm` (boolean) - **REQUIRED** - Must be true

**Example:**

```typescript
await insert_meeting_note({
  fireflies_id: "abc123",
  note_content:
    "Follow-up required: Send proposal by Friday. Mentioned budget of $50k.",
  confirm: true,
});
```

**Returns:**

```json
{
  "success": true,
  "updated_record": { "fireflies_id": "abc123", "fireflies_title": "..." },
  "message": "Successfully added note to meeting: Client Call - Q4 Review"
}
```

---

### 5. Update Email Status

**Tool:** `update_email_status`

**Description:** Modify an AI-generated email's subject or body

**Parameters:**

- `email_id` (string) - Email ID to update
- `subject` (string, optional) - New email subject
- `body` (string, optional) - New email body
- `confirm` (boolean) - **REQUIRED** - Must be true

**Example:**

```typescript
await update_email_status({
  email_id: "email-789",
  subject: "Updated: Follow-up from Our Meeting",
  body: "<p>Updated email body with new content...</p>",
  confirm: true,
});
```

**Returns:**

```json
{
  "success": true,
  "updated_record": {
    "id": "email-789",
    "generated_email_subject": "Updated: Follow-up from Our Meeting"
  },
  "message": "Successfully updated email: Updated: Follow-up from Our Meeting"
}
```

---

## 🔍 Write Operation Detection

The MCP server automatically detects write operations using regex pattern matching:

**Detected Keywords:**

- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `DROP`
- `ALTER`
- `CREATE`

**Pattern:** `/^\s*(INSERT|UPDATE|DELETE|TRUNCATE|DROP|ALTER|CREATE)\s+/i`

If any of these keywords are detected at the start of a query, `confirm=true` is required.

---

## 🎯 Usage Workflow

### For AI Agents (like Claude)

1. **User requests a data modification**

   ```
   User: "Can you update the category of the meeting with Jef to 'Sales Call'?"
   ```

2. **Agent identifies this as a write operation**

   - Needs to call `update_meeting_category` or `execute_sql`
   - Both require `confirm: true`

3. **Agent asks for explicit confirmation**

   ```
   Agent: "I can update the meeting category to 'Sales Call'. This will modify
          the database. Would you like me to proceed with this change?"
   ```

4. **User confirms**

   ```
   User: "Yes, go ahead"
   ```

5. **Agent executes with confirmation**

   ```typescript
   update_meeting_category({
     fireflies_id: "meeting-123",
     category_id: "sales-call-id",
     assessment_type: "External",
     confirm: true, // ✅ User confirmed
   });
   ```

---

## ❌ Error Handling

### Without Confirmation

```typescript
Error: SAFETY CHECK: This query contains a write operation (INSERT/UPDATE/DELETE).
You MUST set confirm=true to execute this query.
Please ask the user to explicitly confirm they want to modify the database before proceeding.
```

### Meeting Not Found

```typescript
Error: Meeting with Fireflies ID abc123 not found.
```

### No Updates Specified

```typescript
Error: No updates specified. Please provide subject or body to update.
```

---

## 🔐 Security Best Practices

1. **Always validate user intent** before setting `confirm: true`
2. **Show what will be modified** before asking for confirmation
3. **Use specific tools** (like `update_meeting_category`) instead of raw SQL when possible
4. **Log all write operations** for audit trail
5. **Never auto-confirm** - always require explicit user approval
6. **Escape user input** to prevent SQL injection (already handled in tools)

---

## 📊 Read vs Write Operations

### Read Operations (No Confirmation Needed)

- ✅ `get_meetings_by_participant`
- ✅ `get_recent_meetings`
- ✅ `search_meeting_transcripts`
- ✅ `get_meeting_by_fireflies_id`
- ✅ `get_meeting_categories`
- ✅ `get_meeting_stats`
- ✅ `get_external_contacts`
- ✅ All other SELECT queries

### Write Operations (Confirmation Required)

- ⚠️ `update_meeting_category` - requires `confirm: true`
- ⚠️ `delete_meeting` - requires `confirm: true`
- ⚠️ `insert_meeting_note` - requires `confirm: true`
- ⚠️ `update_email_status` - requires `confirm: true`
- ⚠️ `execute_sql` with INSERT/UPDATE/DELETE - requires `confirm: true`
- ⚠️ `apply_migration` - requires `confirm: true` (DDL operations)

---

## 🛠️ Migration Operations

**Tool:** `apply_migration`

Used for DDL (Data Definition Language) operations:

- Creating tables
- Adding columns
- Creating indexes
- Modifying schema

**Parameters:**

- `name` (string) - Migration name in snake_case
- `query` (string) - DDL SQL query

**Example:**

```typescript
await apply_migration({
  name: "add_meeting_priority_column",
  query: `
    ALTER TABLE meetings 
    ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
  `,
});
```

---

## 📝 Common Use Cases

### Use Case 1: Correct Meeting Categorization

**Scenario:** A meeting was incorrectly categorized as "Internal" but should be "External"

**Solution:**

```typescript
await update_meeting_category({
  fireflies_id: "meeting-123",
  category_id: "external-sales-id",
  assessment_type: "External",
  rationale: "Meeting included client representatives",
  confirm: true,
});
```

### Use Case 2: Add Follow-up Notes

**Scenario:** User wants to add action items to a meeting

**Solution:**

```typescript
await insert_meeting_note({
  fireflies_id: "meeting-456",
  note_content:
    "Action Items:\n1. Send proposal by Friday\n2. Schedule follow-up for next week\n3. Share pricing document",
  confirm: true,
});
```

### Use Case 3: Cleanup Test Data

**Scenario:** Remove test meetings from the database

**Solution:**

```typescript
await delete_meeting({
  fireflies_id: "test-meeting-789",
  confirm: true,
});
```

### Use Case 4: Bulk Update

**Scenario:** Update multiple meetings at once

**Solution:**

```typescript
await execute_sql({
  query: `
    UPDATE meetings 
    SET fireflies_meeting_summary = 'Archived - ' || fireflies_meeting_summary
    WHERE fireflies_timestamp < '2024-01-01'
  `,
  confirm: true,
});
```

---

## 🚨 Important Notes

1. **No Undo**: Write operations are immediate and permanent
2. **Backup First**: Consider backing up critical data before bulk operations
3. **Test Queries**: Test with SELECT first, then convert to UPDATE/DELETE
4. **User Confirmation**: ALWAYS get explicit user permission
5. **SQL Injection**: Built-in tools handle escaping, but be careful with raw SQL
6. **Rate Limits**: Respect API rate limits for bulk operations

---

## 📞 Support

If you encounter issues with write operations:

1. Check error messages for specific guidance
2. Verify `confirm: true` is set for write operations
3. Ensure meeting/email IDs are correct
4. Review this guide for proper usage patterns

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Component:** Ask-Maia MCP Server

