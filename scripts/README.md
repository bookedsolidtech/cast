# Automaker Scripts

## setup-protolab.sh

**Purpose**: Comprehensive setup script that initializes a project with Automaker and the Claude Code plugin.

### Usage

```bash
# Via npm script (recommended)
npm run setup-lab -- /path/to/project

# Direct execution
./scripts/setup-protolab.sh /path/to/project
```

### What It Does

1. **Validates Prerequisites**
   - Checks for git and claude CLI
   - Verifies Automaker server is running
   - Validates project path exists

2. **Initializes Automaker** (`.automaker/`)
   - Creates directory structure:
     - `features/` - Feature definitions
     - `context/` - Context files for agents
     - `memory/` - Agent memory storage
   - Generates `protolab.config`
   - Creates initial `CLAUDE.md` template
   - Adds project to Automaker settings

3. **Ensures Plugin Installation**
   - Configures plugin marketplace
   - Installs Automaker plugin for Claude Code
   - Updates to latest version if already installed

### Requirements

- **Node.js**: >= 22.0.0
- **git**: For version control
- **claude CLI**: https://claude.ai/code
- **jq**: JSON processor (for parsing API responses)
- **curl**: For API calls
- **Automaker server**: Must be running on localhost:3008

### Environment Variables

- `AUTOMAKER_API_KEY`: API key for Automaker server (optional, defaults to `dev-key`)

### Examples

**Setup a new project:**

```bash
mkdir -p ~/projects/my-app
npm run setup-lab -- ~/projects/my-app
```

**Setup with git init:**

```bash
mkdir -p ~/projects/new-project
cd ~/projects/new-project
git init
npm run setup-lab -- .
```

**Setup existing project:**

```bash
cd ~/existing-project
npm run setup-lab -- .
```

### Post-Setup

After running the script, you can:

1. **Open Claude Code** in the project directory
2. **Create features** with `/board`
3. **View board** with `/board`
4. **Start auto-mode** with `/auto-mode start`

### Troubleshooting

**Script fails with "Automaker server is not running"**

- Start the server: `npm run dev` (in automaker repo)
- Or continue without it (will skip Automaker initialization)

**Script fails with "claude: command not found"**

- Install Claude Code CLI: https://claude.ai/code

**Script fails with "jq: command not found"**

- Install jq: `brew install jq`

### Script Structure

```
setup-protolab.sh
├── Prerequisites Check
│   ├── Validate path
│   ├── Check git
│   ├── Check claude CLI
│   └── Check Automaker server
├── Automaker Initialization
│   ├── Call /api/setup/project
│   ├── Create directory structure
│   └── Add to settings
└── Plugin Installation
    ├── Configure marketplace
    ├── Install plugin
    └── Update if needed
```

### Exit Codes

- `0` - Success
- `1` - Error (prerequisites failed, setup failed, etc.)

### Interactive Prompts

The script will prompt for confirmation in these cases:

- Reinitializing Automaker if already initialized
- Continuing if Automaker server is not running

### Related

- `/setuplab` - Claude Code skill that wraps this script
- `docs/setuplab-audit.md` - Audit and improvement plan
- `packages/mcp-server/plugins/automaker/commands/setuplab.md` - Skill documentation
