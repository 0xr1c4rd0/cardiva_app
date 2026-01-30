# Cardiva Claude Code Configuration

This directory contains project-specific Claude Code configuration for the Cardiva RFP matching application.

## Structure

```
.claude/
├── README.md           # This file
├── settings.json       # Project settings and hooks
├── rules/              # Always-follow guidelines
│   ├── coding-style.md # Code organization, immutability
│   ├── testing.md      # TDD workflow, coverage requirements
│   ├── security.md     # Security requirements
│   └── git-workflow.md # Commit format, branch strategy
├── agents/             # Specialized subagents
│   ├── code-reviewer.md
│   ├── planner.md
│   ├── tdd-guide.md
│   └── build-error-resolver.md
├── commands/           # Slash commands
│   ├── tdd.md          # /tdd - Test-driven development
│   ├── code-review.md  # /code-review - Quality review
│   ├── build-fix.md    # /build-fix - Fix build errors
│   └── plan.md         # /plan - Implementation planning
└── skills/             # Domain knowledge
    ├── cardiva-patterns.md    # Project-specific patterns
    ├── continuous-learning.md # Learning extraction
    └── session-handoff.md     # Session continuity
```

## Quick Reference

### Commands

| Command | Description |
|---------|-------------|
| `/tdd [feature]` | Start TDD workflow |
| `/code-review [path]` | Review code quality |
| `/build-fix` | Fix build errors |
| `/plan [feature]` | Create implementation plan |

### Key Rules

1. **Immutability**: Never mutate objects/arrays
2. **File Size**: 200-400 lines typical, 800 max
3. **Testing**: TDD mandatory, 80% coverage
4. **Security**: No hardcoded secrets, validate inputs
5. **Git**: Conventional commits, ask before push

### Hooks

- **Pre-Write**: Warns when creating .md files
- **Pre-Git**: Reminds to get user approval
- **Post-Edit**: Checks for console.log and `any` types
- **Stop**: Reminds to create handoff if mid-task

## Integration with GSD

This configuration works alongside the GSD framework:

1. **Planning**: Use `/plan` command, save to `.planning/phases/`
2. **Execution**: Use GSD commands with project rules
3. **Verification**: Use `/code-review` and build checks
4. **Continuity**: Use session handoff for context persistence

## Configuration Source

This configuration is based on:
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Battle-tested Claude Code configs
- [ralphy](https://github.com/michaelshimeles/ralphy) - PRD-driven task execution
- Project-specific patterns from Cardiva development

## Customization

To add new rules, agents, or commands:

1. Create the file in the appropriate directory
2. Update `settings.json` to include the new file
3. Test the new configuration
