# Security Configuration - Ask Maia MCP

## 🔒 Read-Only Mode Enforced

The Ask Maia MCP server has been **permanently configured for read-only access**. Write operations are completely disabled at the code level for maximum security.

---

## What Was Changed

### 1. Server Configuration (`server.ts`)

#### Removed Write-Capable Tool Groups:

- ❌ **Account Tools** - Create/pause/restore projects (REMOVED)
- ❌ **Branching Tools** - Create/merge/delete branches (REMOVED)
- ❌ **Development Tools** - Generate TypeScript, manage keys (REMOVED)
- ❌ **Edge Function Tools** - Deploy edge functions (REMOVED)
- ❌ **Storage Tools** - Manage storage buckets (REMOVED)

#### Kept Read-Only Tool Groups:

- ✅ **Ask Maia Tools** - Custom query tools (READ-ONLY)
- ✅ **Database Tools** - SQL queries with `readOnly: true` forced (READ-ONLY)
- ✅ **Debug Tools** - Logs and advisors (READ-ONLY)

### 2. Database Operations Hardcoded

```typescript
if (enabledFeatures.has("database")) {
  // Force read-only mode for all database operations
  Object.assign(
    tools,
    getDatabaseOperationTools({ platform, projectId, readOnly: true })
  );
}
```

**Effect**: `execute_sql` and `apply_migration` are restricted:

- `execute_sql`: Can only run SELECT queries
- `apply_migration`: Not available when readOnly is true

### 3. CLI Flag Removed

The `--read-only` flag has been **removed from the CLI** because:

- Read-only mode is now **permanently enforced**
- No way to override it
- Simplified configuration

### 4. Type System Updated

```typescript
export type SupabaseMcpServerOptions = {
  platform: SupabasePlatform;
  projectId?: string;
  features?: string[]; // Only: 'ask-maia', 'database', 'debug'
  // readOnly removed - always true
};

const featureGroupSchema = z.enum([
  "ask-maia", // Custom Maia query tools (read-only)
  "database", // Database operations (read-only)
  "debug", // Debugging tools (read-only)
  // All write-capable features removed
]);
```

---

## What This Means

### ✅ You CAN:

- Query meetings and transcripts
- Search meeting content
- View AI-generated emails
- Analyze contacts and participants
- Get meeting statistics
- Run SELECT queries
- View database schema
- Check logs and advisors

### ❌ You CANNOT:

- Create, update, or delete database records
- Apply migrations (DDL operations)
- Create or delete projects/branches
- Deploy edge functions
- Manage storage buckets
- Modify user accounts
- Change any data in the database

---

## Technical Details

### Files Modified:

1. **`src/server.ts`**

   - Removed write tool imports
   - Removed readOnly parameter
   - Limited featureGroupSchema to read-only features
   - Hardcoded `readOnly: true` for database tools
   - Added security comments

2. **`src/transports/stdio.ts`**

   - Removed `--read-only` CLI flag
   - Removed readOnly parameter from server initialization
   - Added comment about permanent enforcement

3. **`mcp.json`**
   - Removed `--read-only` flag (no longer needed)

---

## Benefits

### Security

- **No accidental writes**: Impossible to modify data even by mistake
- **No privilege escalation**: Write capabilities removed at code level
- **Defense in depth**: Multiple layers of protection

### Simplicity

- **No configuration needed**: Always read-only by default
- **No flag to remember**: Can't forget to set `--read-only`
- **Clear intent**: Code explicitly states read-only purpose

### Maintainability

- **Less code**: Removed unused write tools
- **Smaller bundle**: Fewer dependencies
- **Clear purpose**: Server designed for querying only

---

## Verification

To verify read-only mode is enforced:

1. **Check available tools**: Only query tools should be listed
2. **Try a write operation**: Will fail with error
3. **Check code**: `readOnly: true` is hardcoded

### Example Verification:

```javascript
// This will work:
await mcp.execute_sql({ query: "SELECT * FROM meetings LIMIT 5" });

// This will fail:
await mcp.execute_sql({ query: "DELETE FROM meetings WHERE id = '...'" });
// Error: "Read-only mode enabled"

// This won't exist:
await mcp.apply_migration({ ... });
// Error: "apply_migration is not a function"
```

---

## Comparison: Before vs After

| Feature                 | Before                 | After                        |
| ----------------------- | ---------------------- | ---------------------------- |
| **Write Operations**    | Available with flag    | ❌ Completely removed        |
| **Read Operations**     | Available              | ✅ Available                 |
| **apply_migration**     | Available without flag | ❌ Not available             |
| **execute_sql (write)** | Available without flag | ❌ Blocked                   |
| **execute_sql (read)**  | Available              | ✅ Available                 |
| **Edge Functions**      | Available              | ❌ Removed                   |
| **Storage**             | Available              | ❌ Removed                   |
| **Branching**           | Available              | ❌ Removed                   |
| **CLI Flag**            | Optional `--read-only` | ❌ Removed (always enforced) |

---

## Migration Guide

If you were using write operations before:

### Before:

```json
{
  "command": "node",
  "args": [
    "path/to/stdio.js",
    "--project-ref=wgiqrcygrggbnlpovgzk"
    // No --read-only flag
  ]
}
```

### After:

```json
{
  "command": "node",
  "args": [
    "path/to/stdio.js",
    "--project-ref=wgiqrcygrggbnlpovgzk"
    // Read-only enforced internally
  ]
}
```

**Note**: Write operations will no longer work. Use the standard Supabase MCP server if you need write access.

---

## When to Use Which Server

### Use Ask Maia (Read-Only):

- ✅ Querying meeting data
- ✅ Analyzing transcripts
- ✅ Viewing AI-generated content
- ✅ Getting statistics
- ✅ Safe exploration of database

### Use Standard Supabase MCP:

- Need to create/update/delete records
- Need to apply migrations
- Need to deploy edge functions
- Need full database access
- Building/modifying the application

---

## Support

If you need write access:

1. Use the standard Supabase MCP server instead
2. Point it to the same project: `wgiqrcygrggbnlpovgzk`
3. Configure with appropriate permissions

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0 (Read-Only Enforced)  
**Status**: ✅ Production Ready
