---
name: generate_skill
description: Generate reusable skill with code examples for Claude Code
argument-hint: skill description or category
---

# Generate Skill

## Goal

Create executable skill files with instructions and code examples.

## Outcome

Structured skill file in `aidd/skills/<category>/skill-name.md` following template.

## Resources

### Template

```markdown
@aidd/prompts/templates/skill.md
```

### Arguments

```text
$ARGUMENTS
```

## Constraints

- One skill per file
- Include working code examples
- Concise, action-oriented instructions
- Max 8 instruction bullets
- Define 3-8 trigger keywords/phrases
- Add 2-5 tags for categorization
- Set priority: low, medium, or high
- Specify scope: global, module, file, or selection
- Specify output type: code, markdown, json, files, or analysis

## Directory Structure

Output skills in `aidd/skills/<category>/` based on skill type:

| Category      | Purpose                    | Examples                          |
| ------------- | -------------------------- | --------------------------------- |
| `code`        | Code generation/transform  | Component generator, refactoring  |
| `analysis`    | Code analysis/review       | Security audit, complexity check  |
| `docs`        | Documentation generation   | API docs, README, diagrams        |
| `testing`     | Test generation/execution  | Unit test creator, E2E runner     |
| `data`        | Data processing/transform  | CSV parser, JSON validator        |
| `automation`  | Task automation            | Git workflows, deployment scripts |
| `other`       | Miscellaneous              | Edge cases                        |

Example structure:

```text
aidd/skills/code/
├── component-generator.md
└── refactor-helper.md
```

## Steps

1. Identify skill category and name
2. Check if skill exists in `aidd/skills/<category>/`
   - Exists → Update existing
   - New → Create from scratch
3. Define skill structure:
   - What inputs needed?
   - What constraints apply?
   - What output format?
   - What triggers (keywords/phrases)?
   - What tags (tech stack, domain)?
   - What priority (low/medium/high)?
   - What scope (global/module/file/selection)?
   - What output type (code/markdown/json/files/analysis)?
   - Get user approval
4. Generate skill content:
   - Write clear instructions (4-8 bullets)
   - Define 3-8 trigger keywords
   - Add 2-5 relevant tags
   - Set appropriate priority
   - Specify scope and output type
   - Create realistic example with code
   - Get user approval
5. Save to `aidd/skills/<category>/skill-name.md`
