# Binary Distribution Approach

This fork of Claude-Flow uses a smart binary distribution approach that minimizes dependencies while maximizing compatibility.

## How It Works

1. **Pre-compiled Binary First**: Checks for a pre-compiled binary for your platform
2. **Download Binary**: Attempts to download from GitHub releases if not found locally
3. **Compile on Demand**: If Deno is available, compiles a binary on the spot
4. **JavaScript Fallback**: Falls back to running the JavaScript code directly

## Binary Naming Convention

- macOS ARM64: `claude-flow-darwin-arm64`
- macOS x64: `claude-flow-darwin-x64`
- Linux x64: `claude-flow-linux-x64`
- Windows x64: `claude-flow-win-x64.exe`

## Building Binaries

### For macOS (your current platform):
```bash
./scripts/build-osx-binary.sh
```

This creates:
- Platform-specific binary: `bin/claude-flow-darwin-arm64`
- Generic fallback binary: `bin/claude-flow-binary`

### For all platforms:
```bash
npm run build:all
```

## Publishing with Binaries

1. Build the binary for your platform
2. Create a GitHub release
3. Upload the binary as a release asset
4. Users will automatically download it on first use

## Benefits

- **No Deno Required**: Users don't need Deno installed
- **Fast Startup**: Native binaries start instantly
- **Self-contained**: All dependencies bundled
- **Automatic Updates**: Downloads latest binary when available
- **Graceful Degradation**: Falls back to JavaScript if needed

## For Package Users

When users install your package:
```bash
npm install -g @iaminawe/claude-flow-taskmaster
```

The first run will:
1. Check for local binary
2. Download appropriate binary for their platform
3. Cache it for future use
4. Fall back to JavaScript if needed

This approach ensures the best possible experience without requiring Deno!