# Changelog - TaskMaster v2 Integration

## [1.1.3] - 2024-12-16

### Fixed
- Fixed `claude-flow` wrapper script to properly execute `claude-flow-deno` binary
- Updated all documentation to use `./claude-flow` prefix for commands
- Resolved "Cannot find module './bin/claude-flow'" error

### Changed
- The main wrapper now spawns the Deno wrapper script instead of requiring a compiled binary
- This avoids stack overflow issues during Deno compilation of large codebases

### Documentation
- Updated README.md with correct command syntax
- Updated TaskMaster integration guide with `./claude-flow` prefix
- Updated todo app example documentation

## [1.1.2] - Previous Release

### Added
- Complete TaskMaster-Swarm v2 integration
- Real-time monitoring dashboard
- Task optimization and parallel execution
- Configuration management system
- VS Code extension support