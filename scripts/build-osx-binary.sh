#!/bin/bash

echo "🔨 Building Claude-Flow binary for OSX..."

# Get architecture
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
  ARCH="x64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  ARCH="arm64"
fi

BINARY_NAME="claude-flow-darwin-$ARCH"
OUTPUT_PATH="./bin/$BINARY_NAME"

echo "Platform: darwin-$ARCH"

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
  echo "❌ Deno is not installed. Please install Deno first."
  echo "Run: curl -fsSL https://deno.land/x/install/install.sh | sh"
  exit 1
fi

echo "Compiling binary..."

# Compile the binary
deno compile \
  --allow-all \
  --no-check \
  --output="$OUTPUT_PATH" \
  ./src/cli/simple-cli.js

if [ $? -eq 0 ]; then
  echo "✅ Binary compiled successfully: $OUTPUT_PATH"
  
  # Make it executable
  chmod +x "$OUTPUT_PATH"
  
  # Create a copy without platform suffix for local use
  cp "$OUTPUT_PATH" ./bin/claude-flow-binary
  chmod +x ./bin/claude-flow-binary
  
  echo "✅ Created local binary: ./bin/claude-flow-binary"
  echo ""
  echo "To test locally:"
  echo "  ./bin/$BINARY_NAME --version"
  echo ""
  echo "To publish binary with release:"
  echo "  1. Create a GitHub release"
  echo "  2. Upload $OUTPUT_PATH as a release asset"
else
  echo "❌ Failed to compile binary"
  exit 1
fi