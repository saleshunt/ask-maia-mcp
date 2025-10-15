# Ask Emile MCP - Setup Complete! ✅

## What Was Created

A custom MCP server **"Ask Emile"** that's optimized for querying Emile's Supabase database. This server provides 8 specialized tools for understanding reminders, conversations, and follow-up patterns.

## 🎯 Custom Tools Available

1. **`get_all_reminders`** - Filter by status, sender, or date range
2. **`get_reminders_by_recipient`** - Find all reminders for a specific email
3. **`get_reminder_stats`** - Get statistics grouped by status, sender, or date
4. **`search_reminders_by_subject`** - Full-text search in subjects and reasons
5. **`get_upcoming_reminders`** - See what's coming up in N days
6. **`get_failed_reminders`** - Analyze failures with reasons
7. **`get_reminder_by_id`** - Get detailed info about a specific reminder
8. **`get_conversation_reminders`** - All reminders for a conversation thread

## 📍 Installation Location

```
C:\Users\woute\OneDrive\Documenten\GitHub\MCP\ask-emile-mcp\
```

## ✅ Configuration Added

The server has been configured in your Cursor MCP settings:

**Location**: `C:\Users\woute\.cursor\mcp.json`

**Configuration**:

```json
"ask-emile": {
  "command": "node",
  "args": [
    "C:\\Users\\woute\\OneDrive\\Documenten\\GitHub\\MCP\\ask-emile-mcp\\packages\\mcp-server-supabase\\dist\\transports\\stdio.js",
    "--project-ref=acmuvwlzqszfgfjcbyyy",
    "--read-only"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_6d5e1ca27f508fb543803a43a9b69d505205cef3"
  }
}
```

## 🔄 How to Activate

1. **Restart Cursor** to load the new MCP server
2. Look for "ask-emile" in your available MCP tools
3. Start querying! Try asking:
   - "Show me all scheduled reminders"
   - "What reminders are coming up this week?"
   - "How many reminders has Wouter scheduled?"

## 🛠️ Features Enabled by Default

- ✅ **Ask Emile Tools** - Custom database queries
- ✅ **Database Tools** - General SQL execution
- ✅ **Debug Tools** - Logging and advisors
- ❌ Account Management (disabled for security)
- ❌ Branching (disabled, not needed)
- ❌ Storage (disabled, not needed)

## 🔒 Security Settings

- **Read-only mode**: Enabled (prevents accidental data modifications)
- **Project scoped**: Yes (only accesses Emile's project)
- **Token**: Using same token as main Supabase server

## 📊 Example Queries You Can Run

### Get reminder statistics

```
"Give me stats on all reminders grouped by status and sender"
```

### Find specific reminders

```
"Show me all scheduled reminders from wouter@generativeaistrategy.com"
```

### Search functionality

```
"Search for reminders about 'AI Champions'"
```

### Upcoming reminders

```
"What reminders are scheduled in the next 14 days?"
```

### Failed reminders analysis

```
"Show me all failed reminders and explain why they failed"
```

### Recipient-specific queries

```
"Get all reminders for hdevries@blomelektrotechniek.nl"
```

## 🔧 Rebuilding After Changes

If you modify the tools, rebuild with:

```bash
cd C:\Users\woute\OneDrive\Documenten\GitHub\MCP\ask-emile-mcp
npm run build
```

Then restart Cursor.

## 📁 Key Files

- **Tools**: `packages/mcp-server-supabase/src/tools/ask-emile-tools.ts`
- **Server Config**: `packages/mcp-server-supabase/src/server.ts`
- **Package**: `packages/mcp-server-supabase/package.json`
- **Built Server**: `packages/mcp-server-supabase/dist/transports/stdio.js`

## 🎨 Customization

To add more custom tools:

1. Edit `ask-emile-tools.ts`
2. Add new tool functions following the existing pattern
3. Run `npm run build`
4. Restart Cursor

## 💡 Tips

- The server is **read-only** by default for safety
- All queries return data in JSON format
- Use natural language - the AI will pick the right tool
- You can combine multiple queries in one conversation

## 🐛 Troubleshooting

**Server not showing up?**

- Restart Cursor completely
- Check the path in mcp.json is correct
- Verify the build succeeded (`npm run build`)

**Permission errors?**

- Check your SUPABASE_ACCESS_TOKEN is valid
- Verify project-ref is correct

**Tools not working?**

- Check the server logs in Cursor's MCP panel
- Verify the database connection is active

## 🚀 Next Steps

1. Restart Cursor
2. Try a simple query: "Show me all scheduled reminders"
3. Explore the different tools available
4. Customize the tools for your specific needs

---

**Created**: October 15, 2025  
**Based on**: Supabase MCP Server v0.4.5  
**Version**: 1.0.0
