# Skills Documentation

> **Read this when**: Building UI components, designing pages, optimizing performance, or writing user-facing text.

---

## Installed Skills

| Skill | Purpose | Auto-Activates When |
|-------|---------|---------------------|
| **vercel-react-best-practices** | React/Next.js performance (57 rules) | Writing React components |
| **tailwind-design-system** | CVA components, design tokens | Creating UI components |
| **ui-ux-pro-max** | Design intelligence (50+ styles, 97 palettes) | Designing pages |
| **writing-clearly-and-concisely** | Clear prose, avoid AI-speak | Writing docs, UI text |

---

## UI/UX Enhanced Workflow

**⚠️ ALWAYS generate design system FIRST before building any UI.**

### Step 1: Generate Design System (Mandatory First Step)

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard analytics" --design-system -p "Cardiva"
```

This provides:
- 50+ UI styles
- 97 color palettes (industry-specific)
- 57 font pairings
- 99 UX guidelines by priority

### Step 2: Build Components

Architecture layers:
1. Base styles (foundation)
2. Variants (visual variations)
3. Sizes (scale options)
4. States (hover, focus, disabled)
5. Overrides (component-specific)

### Step 3: Apply UX Rules

- No emojis as icons (use Lucide SVG)
- Touch targets ≥44x44px
- Hover states without layout shift
- ARIA attributes for accessibility
- Light/dark mode contrast (4.5:1 minimum)

### Step 4: Optimize Performance

- Parallel data fetching
- Dynamic imports for heavy components (>50KB)
- Proper Suspense boundaries
- Memoization where beneficial

---

## Tailwind Design System Patterns

### Design Token Hierarchy

```
Brand Token → Semantic Token → Component Token
blue-500    → primary        → button-bg
```

### CVA Pattern (Type-Safe Variants)

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md", // base
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
  }
)
```

### Essential Utilities

| Utility | Purpose |
|---------|---------|
| `cn()` | Merge Tailwind classes (clsx + tailwind-merge) |
| `focusRing` | Reusable focus-visible styling |
| `disabled` | Disabled state utility |

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| CSS variables for runtime theming | Arbitrary values (extend theme) |
| CVA for type safety | Nest @apply directives |
| Semantic colors (`primary`) | Hardcode colors (`blue-500`) |
| Forward refs for composition | Skip keyboard focus states |
| Include ARIA attributes | Test only light mode |

---

## Writing Guidelines

### AI-Speak Patterns to AVOID

**Puffery:**
- ❌ pivotal, crucial, vital, testament, groundbreaking

**Empty phrases:**
- ❌ ensuring reliability, showcasing features, leveraging

**Promotional adjectives:**
- ❌ seamless, robust, revolutionary, cutting-edge

**Overused vocabulary:**
- ❌ delve, multifaceted, tapestry, unlock, harness

### Examples

| ❌ Bad | ✅ Good |
|--------|---------|
| "Leveraging robust authentication to ensure seamless user experience" | "Users log in with email and password" |
| "This pivotal feature showcases our groundbreaking approach" | "This feature processes payments in real-time" |

### Writing Principles

- Use active voice ("Save changes" not "Changes will be saved")
- Omit needless words
- Keep related words together
- Place emphatic words at sentence end
- Be specific and concrete

---

## React Performance Rules

### P0 (Critical)

- **No request waterfalls**: Fetch data in parallel
- **Use Server Components by default**: Only add `"use client"` when needed
- **Proper Suspense boundaries**: Wrap async components

### P1 (Important)

- **Dynamic imports for heavy components**: `next/dynamic` for >50KB
- **Memoization where beneficial**: `useMemo`, `useCallback` for expensive ops
- **Avoid re-renders**: Check component tree, use `React.memo` if needed

### P2 (Nice to Have)

- **Image optimization**: Use `next/image` with proper sizing
- **Bundle analysis**: Check bundle size periodically
- **Prefetching**: Use `<Link prefetch>` for likely navigations

---

## Pre-Delivery Checklist

### UX Rules (ui-ux-pro-max)

- [ ] No emojis as icons (use Lucide SVG)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states don't cause layout shift
- [ ] Light/dark mode contrast verified (4.5:1)
- [ ] Touch targets ≥44x44px
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Loading states shown for async operations
- [ ] Error states are clear and actionable
- [ ] Empty states guide users to action

### Performance (vercel-react-best-practices)

- [ ] No request waterfalls
- [ ] Dynamic imports for heavy components
- [ ] Proper Suspense boundaries
- [ ] Memoization where beneficial
- [ ] Images optimized

### Architecture (tailwind-design-system)

- [ ] Using semantic colors
- [ ] CVA pattern for variants
- [ ] Proper focus states
- [ ] forwardRef used for composition
- [ ] cn() utility for class merging

### Prose (writing-clearly-and-concisely)

- [ ] Active voice in UI text
- [ ] No AI-speak
- [ ] Specific, concrete language
- [ ] Positive framing

---

## Skill CLI Tools

### ui-ux-pro-max

```bash
# Generate design system
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system -p "Cardiva"

# Search specific domain
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "accessibility" --domain ux

# Search with stack
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "button variants" --stack html-tailwind
```

**Available Domains:**
- `ux` - UX guidelines (99 rules)
- `styles` - UI styles (50+ options)
- `palettes` - Color palettes (97 options)
- `fonts` - Font pairings (57 options)
- `charts` - Chart types (25 options)

---

## Skill Reference Files

| Skill | Key Files | When to Read |
|-------|-----------|--------------|
| vercel-react-best-practices | `rules/async-*.md`, `rules/bundle-*.md` | Performance issues |
| tailwind-design-system | `SKILL.md` | Creating components |
| ui-ux-pro-max | Run CLI with `--domain ux` | UX best practices |
| writing-clearly-and-concisely | `elements-of-style/03-*.md` | Active voice, concision |
