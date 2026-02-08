# Agent Browser Skill

## Description

Headless browser automation CLI for AI agents. Fast Rust CLI with Node.js fallback for browser automation testing, web scraping, and AI-driven workflows.

## Installation

```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
```

Or via Homebrew (macOS):

```bash
brew install agent-browser
agent-browser install  # Download Chromium
```

## Core Workflow

### Basic Interaction Pattern

```bash
# 1. Navigate to URL
agent-browser open <url>

# 2. Get snapshot with refs
agent-browser snapshot -i

# 3. Interact using refs (recommended for AI)
agent-browser click @e2
agent-browser fill @e3 "test@example.com"

# 4. Re-snapshot after page changes to get new refs
agent-browser snapshot -i
```

### Example: Login Flow

```bash
agent-browser open example.com/login
agent-browser snapshot -i
# Identify: @e1=email field, @e2=password field, @e3=submit button
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser snapshot -i
```

## Essential Commands

### Navigation

- `agent-browser open <url>` - Navigate to URL
- `agent-browser back` - Go back
- `agent-browser forward` - Go forward
- `agent-browser reload` - Reload page
- `agent-browser close` - Close browser

### Element Interaction

- `agent-browser click <sel>` - Click element
- `agent-browser dblclick <sel>` - Double-click element
- `agent-browser type <sel> <text>` - Type into element
- `agent-browser fill <sel> <text>` - Clear and fill input
- `agent-browser select <sel> <val>` - Select dropdown option
- `agent-browser check <sel>` - Check checkbox
- `agent-browser uncheck <sel>` - Uncheck checkbox
- `agent-browser hover <sel>` - Hover over element
- `agent-browser press <key>` - Press key (Enter, Tab, Escape)

### Page Information

- `agent-browser snapshot -i` - Get accessibility tree with refs
- `agent-browser get text <sel>` - Get text content
- `agent-browser get html <sel>` - Get innerHTML
- `agent-browser get value <sel>` - Get input value
- `agent-browser get title` - Get page title
- `agent-browser get url` - Get current URL
- `agent-browser screenshot [path]` - Take screenshot

### Selectors

- **Refs (Recommended for AI)**: `@e1`, `@e2` - From snapshot output
- **CSS**: `#id`, `.class`, `div > button`
- **Text**: `text=Submit`
- **XPath**: `xpath=//button`

### Snapshot Options

- `-i, --interactive` - Only interactive elements
- `-c, --compact` - Remove empty structural elements
- `-d, --depth <n>` - Limit tree depth
- `-s, --selector <sel>` - Scope to CSS selector

## Session Management

### Multiple Sessions

```bash
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com
agent-browser session list
```

### Persistent Profiles

```bash
agent-browser --profile ~/.myapp-profile open myapp.com
# Login once, reuse authenticated session
agent-browser --profile ~/.myapp-profile open myapp.com/dashboard
```

## Agent Mode (JSON Output)

For programmatic/AI use, add `--json` flag:

```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
agent-browser click @e2 --json
```

## Useful Options

- `--headed` - Show browser window (not headless)
- `--full, -f` - Full page screenshot
- `--headers <json>` - Set HTTP headers
- `--proxy <url>` - Proxy server URL
- `--user-agent <ua>` - Custom User-Agent
- `--ignore-https-errors` - Ignore HTTPS certificate errors

## Best Practices

1. **Always use snapshot first** to understand the page structure
2. **Use refs (@e1, @e2)** instead of CSS selectors for reliability
3. **Re-snapshot after interactions** that change page state
4. **Use `--json` flag** when writing automation scripts
5. **Use `--headed` for debugging** to see what's happening

## Common Patterns

### Wait for page load

```bash
agent-browser wait --load networkidle
agent-browser wait --url "**/dashboard"
```

### Wait for element

```bash
agent-browser wait "#submit-button"
agent-browser wait --text "Success!"
```

### Form submission

```bash
agent-browser fill "#email" "user@example.com"
agent-browser fill "#password" "secret"
agent-browser click "#submit"
agent-browser wait --url "**/success"
```

### Authenticated requests

```bash
agent-browser open api.example.com --headers '{"Authorization": "Bearer <token>"}'
```

## Integration with Cloud Providers

### Browserbase

```bash
export BROWSERBASE_API_KEY="your-key"
export BROWSERBASE_PROJECT_ID="your-project-id"
agent-browser -p browserbase open https://example.com
```

### Browser Use

```bash
export BROWSER_USE_API_KEY="your-key"
agent-browser -p browseruse open https://example.com
```

### Kernel

```bash
export KERNEL_API_KEY="your-key"
agent-browser -p kernel open https://example.com
```

## Troubleshooting

- **Commands fail**: Ensure browser is installed: `agent-browser install`
- **Linux issues**: Run `agent-browser install --with-deps`
- **Can't see browser**: Add `--headed` flag
- **Page not loading**: Use `agent-browser wait --load networkidle`
- **Wrong element clicked**: Re-run `snapshot` after page changes
