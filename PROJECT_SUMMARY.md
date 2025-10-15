# Ask Maia MCP Server - Project Summary

## ✅ Mission Accomplished

Successfully created a custom MCP server called **"Ask Maia"** optimized for querying Maia's meeting automation database with specialized tools for understanding meetings, AI categorizations, email generation, and participant tracking.

---

## 📦 What Was Delivered

### 1. Complete MCP Server Package

- **Location**: `C:\Users\woute\OneDrive\Documenten\GitHub\MCP\ask-maia-mcp\`
- **Based on**: Official Supabase MCP Server (v0.4.5)
- **Customized**: 10 specialized "Ask Maia" tools
- **Status**: ✅ Built and ready to use

### 2. Custom Query Tools (10 tools)

| Tool                          | Purpose               | Key Use Case                         |
| ----------------------------- | --------------------- | ------------------------------------ |
| `get_meetings_by_category`    | Filter by AI category | "Show sales calls from last week"    |
| `search_meeting_transcripts`  | Full-text search      | "Find meetings about 'AI strategy'"  |
| `get_ai_generated_emails`     | View AI emails        | "Show unsent follow-up emails"       |
| `get_meetings_by_participant` | Find by person        | "All meetings with john@example.com" |
| `get_meeting_categories`      | View categories       | "What categories are configured?"    |
| `get_meeting_stats`           | Analytics             | "Stats by category and user"         |
| `get_meeting_by_fireflies_id` | Lookup by ID          | "Get meeting ABC123"                 |
| `get_recent_meetings`         | Recent activity       | "What happened this week?"           |
| `get_external_contacts`       | Contact analysis      | "Most frequent external contacts"    |
| `get_user_list`               | User management       | "All users and their meeting counts" |

### 3. Configuration Files

- ✅ `README.md` - Complete user guide
- ✅ `PROJECT_SUMMARY.md` - This file
- ✅ Custom tools: `ask-maia-tools.ts`

### 4. Cursor Integration

- ✅ Added to `C:\Users\woute\.cursor\mcp.json`
- ✅ Configured with read-only mode
- ✅ Scoped to Maia's project (wgiqrcygrggbnlpovgzk)
- ✅ Ready to activate on restart

---

## 🎯 Key Features

### Security First

- **Read-only mode**: Prevents accidental data modifications
- **Project scoping**: Only accesses Maia's database
- **Token authentication**: Secure Supabase access
- **SQL injection protection**: Parameterized queries

### Optimized for Maia's Workflow

- **Fireflies Integration**: Query meetings by Fireflies ID
- **AI Categorization**: Filter by AI-assigned categories
- **Email Generation**: View AI-created follow-ups
- **Contact Management**: Track internal/external participants
- **Analytics**: Meeting statistics and trends

### Default Feature Set

- ✅ Ask Maia Tools (10 custom tools)
- ✅ Database Tools (execute SQL, list tables)
- ✅ Debug Tools (logs, advisors)
- ❌ Account Management (disabled for security)
- ❌ Branching (not needed)
- ❌ Storage (not needed)

---

## 📊 Maia Database Structure

### Core Tables

1. **meetings** - Transcripts, summaries, participant data
2. **meeting_categorizations** - AI category assignments (Internal/External)
3. **emails_created_by_ai** - Generated follow-up emails
4. **contacts** - Internal and external participants
5. **meeting_categories** - User-defined categories with prompts
6. **users** - Maia users with company associations
7. **companies** - Organization profiles and settings

### Workflow Integration

```
Fireflies Webhook → Meeting Data
                    ↓
            AI Categorization (o3-mini)
                    ↓
            Email Generation (Claude Sonnet 4)
                    ↓
            Supabase Database
                    ↓
        Ask Maia MCP Server (Query Interface)
```

---

## 🚀 Activation Steps

### Immediate (Now)

1. ✅ Server created and built
2. ✅ Configuration added to Cursor
3. ⏳ **Next: Restart Cursor**

### After Restart

1. Look for "ask-maia" MCP server in tools list
2. Try first query: "Show me recent sales meetings"
3. Explore the 10 custom tools

### First Queries to Try

```
"Show me all sales calls from the last week"
"Find meetings with john@example.com"
"What AI-generated emails are waiting to be sent?"
"Give me meeting statistics by category"
"Search transcripts for 'pricing discussion'"
```

---

## 📁 Project Structure

```
ask-maia-mcp/
├── README.md                    # Main documentation
├── PROJECT_SUMMARY.md          # This file
├── package.json                # Root package config
├── packages/
│   ├── mcp-server-supabase/   # Main server
│   │   ├── src/
│   │   │   ├── tools/
│   │   │   │   ├── ask-maia-tools.ts  # 🎯 Your custom tools
│   │   │   │   ├── database-operation-tools.ts
│   │   │   │   ├── debugging-tools.ts
│   │   │   │   └── ...
│   │   │   ├── server.ts       # Server configuration
│   │   │   └── index.ts
│   │   ├── dist/               # Built files
│   │   │   └── transports/
│   │   │       └── stdio.js    # Entry point
│   │   └── package.json        # Package: @maia/ask-maia-mcp
│   └── mcp-utils/              # Shared utilities
└── node_modules/               # Dependencies
```

---

## 💡 Use Cases

### Daily Operations

- Check recent meeting activity
- Review AI-generated follow-up emails
- Track participant engagement
- Monitor meeting categorizations

### Analytics & Reporting

- Meeting statistics by category and type
- Internal vs external meeting ratios
- Contact frequency analysis
- User activity tracking

### Content Discovery

- Search transcripts for specific topics
- Find meetings with particular participants
- Review AI categorization rationale
- Access meeting summaries quickly

### Workflow Management

- View configured categories and prompts
- Check AI email generation status
- Track Fireflies integration
- Monitor user activity

---

## 🔧 Technical Details

### Technologies Used

- **TypeScript**: Type-safe tool definitions
- **Node.js**: Runtime environment
- **Zod**: Schema validation
- **MCP SDK**: @modelcontextprotocol/sdk
- **Supabase**: Database platform

### Build Process

```bash
npm install    # Install dependencies
npm run build  # Compile TypeScript to JavaScript
```

### Configuration

```json
{
  "name": "@maia/ask-maia-mcp",
  "version": "1.0.0",
  "main": "dist/index.cjs",
  "bin": "dist/transports/stdio.js"
}
```

---

## 🎨 Customization Options

### Add New Tools

Edit `packages/mcp-server-supabase/src/tools/ask-maia-tools.ts`:

```typescript
export function getAskMaiaTools(options) {
  return {
    your_new_tool: {
      description: 'What your tool does',
      inputSchema: { /* parameters */ },
      async handler({ param1, param2 }) {
        const query = `SELECT ...`;
        const result = await platform.executeQuery({...});
        return { content: [...] };
      }
    }
  }
}
```

### Modify Default Features

Edit `packages/mcp-server-supabase/src/server.ts`:

```typescript
const DEFAULT_FEATURES: FeatureGroup[] = [
  "ask-maia", // Your custom tools
  "database", // SQL execution
  "debug", // Logs and advisors
  // Add more as needed
];
```

---

## 📚 Workflow Understanding

### Based on n8n Workflows:

**Main Workflow** (`🚀 Main Workflow - Supabase.json`)

- Webhook trigger from Fireflies
- Security validation
- Meeting data retrieval
- Sub-workflow orchestration

**Meeting Categorization** (`🔀 Subflow_ Meeting categorization AI - v30.07.2025.json`)

- AI model: o3-mini
- Classifies: Internal/External
- Assigns category from user-defined list
- Provides detailed rationale

**Email Content Creator** (`Subflow_ Email content creator AI v17.07.2025.json`)

- AI model: Claude Sonnet 4
- Generates follow-up emails
- Uses user writing guidelines
- Customized by meeting category

---

## 🎉 Success Metrics

### What We Achieved

- ✅ Duplicated supabase-mcp folder efficiently
- ✅ Created 10 specialized query tools
- ✅ Configured with optimal defaults
- ✅ Built successfully (no errors)
- ✅ Integrated with Cursor
- ✅ Documented comprehensively
- ✅ Ready for immediate use

### Tool Coverage

- **Meeting Discovery**: 4 tools
- **AI Content**: 2 tools
- **Contact Management**: 2 tools
- **Analytics**: 1 tool
- **User Management**: 1 tool

---

## 🏆 Key Advantages

### Over Standard Supabase MCP

- ✅ Pre-configured for Maia's database
- ✅ Natural language optimized
- ✅ Domain-specific tools
- ✅ Workflow-aware queries
- ✅ Better defaults

### Over Manual SQL Queries

- ✅ No SQL knowledge required
- ✅ Built-in safety (read-only)
- ✅ Consistent query patterns
- ✅ Error handling included
- ✅ Results formatted nicely

### Over Database GUIs

- ✅ Natural language interface
- ✅ Integrated with AI workflow
- ✅ No context switching
- ✅ Intelligent suggestions
- ✅ Faster for common queries

---

## 📅 Project Timeline

- **Request**: "Create Ask Maia MCP based on n8n workflows"
- **Analysis**: Understood Maia's architecture from workflow files
- **Duplication**: Efficient folder copy from ask-emile
- **Customization**: 10 specialized tools for Maia
- **Configuration**: Updated mcp.json
- **Build**: Successful compilation
- **Documentation**: Comprehensive guides
- **Status**: ✅ **COMPLETE**

---

## 🎯 Final Checklist

- [x] Folder duplicated from ask-emile
- [x] Tools created (10 custom Maia tools)
- [x] Server configured (name: ask-maia)
- [x] Package.json updated
- [x] Default features optimized
- [x] Build completed successfully
- [x] MCP config added
- [x] README created
- [x] Project summary created
- [ ] **Cursor restarted** ← YOU ARE HERE
- [ ] First query tested
- [ ] All tools explored

---

## 💬 Quick Start After Restart

```
User: "Show me all sales meetings from last week"
AI: [Uses get_meetings_by_category with category='Sales']

User: "Find meetings with john@example.com"
AI: [Uses get_meetings_by_participant with participant_email]

User: "What AI emails are waiting to be sent?"
AI: [Uses get_ai_generated_emails with status='draft']

User: "Give me meeting statistics"
AI: [Uses get_meeting_stats with group_by='all']
```

---

## 🔄 Comparison with Ask Emile

| Feature         | Ask Emile          | Ask Maia              |
| --------------- | ------------------ | --------------------- |
| **Database**    | Reminders          | Meetings              |
| **Main Entity** | Email reminders    | Meeting transcripts   |
| **AI Feature**  | N/A                | AI categorization     |
| **Tools**       | 8 tools            | 10 tools              |
| **Focus**       | Follow-up tracking | Meeting automation    |
| **Integration** | Outlook            | Fireflies + Pipedrive |

---

**Project Status**: ✅ COMPLETE & READY TO USE  
**Created**: October 15, 2025  
**Version**: 1.0.0  
**Next Action**: **Restart Cursor to activate**

🎉 Congratulations! Your Ask Maia MCP server is ready to query your meeting automation database!
