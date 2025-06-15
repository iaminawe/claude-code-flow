# Publishing Your Fork as an NPM Package

## Steps to Publish Your Fork

### 1. Update package.json
First, update the package name to avoid conflicts with the original:

```json
{
  "name": "@your-username/claude-flow-taskmaster",
  "version": "1.0.0",
  "description": "Claude-Flow with enhanced TaskMaster integration",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/claude-code-flow.git"
  }
}
```

### 2. Create NPM Account
If you don't have one:
```bash
npm adduser
```

### 3. Build the Package
```bash
# Install dependencies
npm install

# Build binaries (optional)
npm run build:all

# Test locally
npm link
claude-flow taskmaster init
```

### 4. Publish to NPM
```bash
# For first publish
npm publish --access public

# For updates
npm version patch  # or minor/major
npm publish
```

### 5. Using Your Published Package
Others can install it with:
```bash
# Install globally
npm install -g @your-username/claude-flow-taskmaster

# Or use npx
npx @your-username/claude-flow-taskmaster taskmaster init --with-ai --enterprise --autonomous
```

## Alternative: GitHub Package Registry

You can also publish to GitHub Packages:

### 1. Update package.json
```json
{
  "name": "@your-username/claude-flow-taskmaster",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 2. Create .npmrc
```
@your-username:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 3. Publish
```bash
npm publish
```

## Testing Before Publishing

### Local Testing
```bash
# Pack the package
npm pack

# Install from the tarball
npm install -g ./your-username-claude-flow-taskmaster-1.0.0.tgz

# Test it
claude-flow taskmaster init
```

### Link Testing
```bash
# In your fork directory
npm link

# Test commands
claude-flow taskmaster init --with-ai --enterprise --autonomous
```

## Recommended Package Names
- `@your-username/claude-flow-taskmaster`
- `claude-flow-enhanced`
- `claude-flow-taskmaster`
- `taskmaster-cli`

## Publishing Checklist
- [ ] Update package.json with your info
- [ ] Update repository URL
- [ ] Choose unique package name
- [ ] Test all commands locally
- [ ] Update README with your package name
- [ ] Add any additional documentation
- [ ] Run tests if available
- [ ] Build binaries if needed
- [ ] Publish with proper access level

## Maintaining Your Fork
After publishing:
1. Keep your fork synced with upstream
2. Version bump for each release
3. Update changelog
4. Test before each publish
5. Respond to issues/PRs

Good luck with your package! 🚀