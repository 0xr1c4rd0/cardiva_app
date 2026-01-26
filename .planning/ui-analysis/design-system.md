# Gusto Design System - Comprehensive Analysis

> Synthesized from analysis of **363 screenshots** covering all major Gusto features:
> Marketing, Authentication, Onboarding, Dashboard, People Management, Hiring, Payroll,
> Benefits, Taxes, Time Off, Documents, Reports, Settings, and Mobile Experiences.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Library](#component-library)
5. [Navigation Patterns](#navigation-patterns)
6. [Form Patterns](#form-patterns)
7. [Data Display](#data-display)
8. [Feedback & Status](#feedback--status)
9. [Animation & Motion](#animation--motion)
10. [Accessibility](#accessibility)
11. [Mobile & Responsive](#mobile--responsive)

---

## Color System

### Primary Palette

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Teal (Primary)** | `#0A8080` | `rgb(10, 128, 128)` | Primary buttons, links, focus states, active nav items |
| **Teal Hover** | `#086868` | `rgb(8, 104, 104)` | Button hover states |
| **Teal Light** | `#E6F4F4` | `rgb(230, 244, 244)` | Teal backgrounds, selected rows, badges |
| **Coral (Accent)** | `#F45D48` | `rgb(244, 93, 72)` | CTAs, promotional elements, brand moments |
| **Coral Light** | `#FEF0ED` | `rgb(254, 240, 237)` | Coral background accents |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success Green** | `#0B8E4C` | Success states, completed status, positive metrics |
| **Success Light** | `#E8F5ED` | Success backgrounds |
| **Error Red** | `#D93D42` | Error states, destructive actions, validation errors |
| **Error Light** | `#FDEBEB` | Error backgrounds |
| **Warning Yellow** | `#F5A623` | Warning states, pending actions |
| **Warning Light** | `#FFF8E6` | Warning backgrounds |
| **Info Blue** | `#2563EB` | Informational states, links |
| **Info Light** | `#EFF6FF` | Info backgrounds |

### Neutral Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Gray 900** | `#1A1A1A` | Primary text, headings |
| **Gray 700** | `#4A4A4A` | Secondary text, body copy |
| **Gray 500** | `#737373` | Placeholder text, disabled states |
| **Gray 300** | `#D1D1D1` | Borders, dividers |
| **Gray 100** | `#F5F5F5` | Subtle backgrounds, table stripes |
| **Gray 50** | `#FAFAFA` | Page backgrounds |
| **White** | `#FFFFFF` | Cards, modals, inputs |

### Color Application Rules

1. **Primary Teal** for all interactive elements (buttons, links, toggles)
2. **Coral** sparingly for brand moments and high-emphasis CTAs
3. **Semantic colors** strictly for their intended meanings
4. **Never use red for non-error contexts**
5. **Maintain 4.5:1 contrast ratio** for text on all backgrounds

---

## Typography

### Font Families

```css
/* Marketing/Landing Pages */
--font-display: 'Tiempos Headline', Georgia, serif;

/* Application UI */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (code, numbers) */
--font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
```

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| **Display XL** | 48px / 3rem | 1.1 | 700 | Marketing hero headlines |
| **Display L** | 36px / 2.25rem | 1.2 | 700 | Page titles (marketing) |
| **Heading 1** | 28px / 1.75rem | 1.3 | 600 | Main page headings (app) |
| **Heading 2** | 24px / 1.5rem | 1.3 | 600 | Section headings |
| **Heading 3** | 20px / 1.25rem | 1.4 | 600 | Card titles, modal headers |
| **Heading 4** | 18px / 1.125rem | 1.4 | 600 | Subsection titles |
| **Body Large** | 18px / 1.125rem | 1.5 | 400 | Lead paragraphs |
| **Body** | 16px / 1rem | 1.5 | 400 | Primary body text |
| **Body Small** | 14px / 0.875rem | 1.5 | 400 | Secondary text, table cells |
| **Caption** | 12px / 0.75rem | 1.4 | 400 | Labels, hints, metadata |
| **Overline** | 11px / 0.6875rem | 1.3 | 600 | Category labels, uppercase |

### Font Weights

- **400 (Regular)**: Body text, descriptions
- **500 (Medium)**: Labels, table headers, emphasis
- **600 (Semibold)**: Headings, buttons, nav items
- **700 (Bold)**: Display text, marketing headlines

### Typography Rules

1. Maximum line length: **65-75 characters** for readability
2. Headings use **tighter line-height** (1.2-1.3)
3. Body text uses **relaxed line-height** (1.5)
4. **Never use light weights** (300 or below) for UI text
5. **Serif fonts** only for marketing/landing pages

---

## Spacing & Layout

### Spacing Scale (8px Base)

```css
--space-0: 0;
--space-1: 4px;    /* 0.25rem - tight spacing */
--space-2: 8px;    /* 0.5rem - base unit */
--space-3: 12px;   /* 0.75rem */
--space-4: 16px;   /* 1rem - common gap */
--space-5: 20px;   /* 1.25rem */
--space-6: 24px;   /* 1.5rem - section padding */
--space-8: 32px;   /* 2rem - card padding */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem - section margins */
--space-16: 64px;  /* 4rem - page sections */
--space-20: 80px;  /* 5rem - hero spacing */
--space-24: 96px;  /* 6rem - major sections */
```

### Layout Grid

```css
/* Desktop Application */
--sidebar-width: 240px;
--sidebar-collapsed: 64px;
--main-content-max: 1200px;
--content-padding: 32px;

/* Marketing Pages */
--container-max: 1280px;
--container-padding: 24px;

/* Forms */
--form-max-width: 480px;
--form-field-gap: 24px;
```

### Page Layout Patterns

#### 1. Sidebar + Main Content (Primary App Layout)
```
┌──────────┬────────────────────────────────────────┐
│          │  Header (breadcrumbs, actions)         │
│  Sidebar │────────────────────────────────────────│
│  (240px) │                                        │
│          │  Main Content Area                     │
│  - Logo  │  (max-width: 1200px, centered)         │
│  - Nav   │                                        │
│  - User  │                                        │
└──────────┴────────────────────────────────────────┘
```

#### 2. Split View (Auth/Onboarding)
```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│   Illustration      │   Form Content      │
│   (50% width)       │   (50% width)       │
│   Teal/Coral bg     │   White bg          │
│                     │   Centered form     │
│                     │   max-width: 400px  │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

#### 3. Centered Content (Simple Forms/Messages)
```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌─────────────────┐               │
│           │  Card Content   │               │
│           │  max-w: 480px   │               │
│           │  centered       │               │
│           └─────────────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

#### 4. Multi-Step Wizard
```
┌─────────────────────────────────────────────┐
│  Step Indicator (1 ─ 2 ─ 3 ─ 4 ─ 5)        │
├─────────────────────────────────────────────┤
│                                             │
│  Step Title                                 │
│  Step Description                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Step Content                       │   │
│  │  (forms, selections, info)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [Back]      [Save for later]   [Continue]  │
└─────────────────────────────────────────────┘
```

---

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: #0A8080;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  transition: background 150ms ease;
}
.btn-primary:hover {
  background: #086868;
}
.btn-primary:focus {
  outline: 2px solid #0A8080;
  outline-offset: 2px;
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  background: white;
  color: #0A8080;
  border: 1px solid #0A8080;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
}
.btn-secondary:hover {
  background: #E6F4F4;
}
```

#### Tertiary Button (Ghost/Link)
```css
.btn-tertiary {
  background: transparent;
  color: #0A8080;
  padding: 12px 24px;
  font-weight: 600;
  text-decoration: underline;
}
.btn-tertiary:hover {
  color: #086868;
}
```

#### Destructive Button
```css
.btn-destructive {
  background: #D93D42;
  color: white;
  /* Same dimensions as primary */
}
```

#### Button Sizes
| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| Small | 8px 16px | 13px | 32px |
| Medium | 12px 24px | 14px | 40px |
| Large | 16px 32px | 16px | 48px |

#### Button States
- **Disabled**: 50% opacity, cursor: not-allowed
- **Loading**: Spinner replaces text or inline spinner
- **Icon-only**: Square aspect ratio, centered icon

### Cards

```css
.card {
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.card-padding {
  padding: 24px;
}
.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #E5E5E5;
}
.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E5E5;
  background: #FAFAFA;
}
```

#### Card Variants
- **Elevated**: Stronger shadow for prominence
- **Interactive**: Hover state with shadow increase
- **Selected**: Teal border, light teal background
- **Error**: Red border, light red background

### Inputs

#### Text Input
```css
.input {
  height: 44px;
  padding: 0 16px;
  border: 1px solid #D1D1D1;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 150ms, box-shadow 150ms;
}
.input:hover {
  border-color: #A3A3A3;
}
.input:focus {
  border-color: #0A8080;
  box-shadow: 0 0 0 3px rgba(10, 128, 128, 0.15);
  outline: none;
}
.input-error {
  border-color: #D93D42;
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(217, 61, 66, 0.15);
}
```

#### Input with Label
```html
<div class="form-field">
  <label class="label">Email address</label>
  <input type="email" class="input" />
  <span class="hint">We'll use this for account recovery</span>
</div>
```

#### Input Sizes
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small | 36px | 0 12px | 14px |
| Medium | 44px | 0 16px | 16px |
| Large | 52px | 0 20px | 18px |

### Select / Dropdown

```css
.select {
  height: 44px;
  padding: 0 40px 0 16px;
  border: 1px solid #D1D1D1;
  border-radius: 6px;
  background: white url('chevron-down.svg') no-repeat right 12px center;
  appearance: none;
}
```

### Checkbox & Radio

```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D1D1;
  border-radius: 4px;
  transition: all 150ms;
}
.checkbox:checked {
  background: #0A8080;
  border-color: #0A8080;
}
.radio {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D1D1;
  border-radius: 50%;
}
.radio:checked {
  border-color: #0A8080;
  border-width: 6px;
}
```

### Toggle Switch

```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #D1D1D1;
  transition: background 150ms;
}
.toggle:checked {
  background: #0A8080;
}
.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
```

### Tabs

```css
.tabs {
  border-bottom: 1px solid #E5E5E5;
}
.tab {
  padding: 12px 16px;
  color: #737373;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab:hover {
  color: #4A4A4A;
}
.tab-active {
  color: #0A8080;
  border-bottom-color: #0A8080;
}
```

### Badges / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}
.badge-teal {
  background: #E6F4F4;
  color: #0A8080;
}
.badge-green {
  background: #E8F5ED;
  color: #0B8E4C;
}
.badge-red {
  background: #FDEBEB;
  color: #D93D42;
}
.badge-yellow {
  background: #FFF8E6;
  color: #B7791F;
}
.badge-gray {
  background: #F5F5F5;
  color: #737373;
}
```

### Status Dots

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-active { background: #0B8E4C; }
.status-pending { background: #F5A623; }
.status-inactive { background: #D1D1D1; }
.status-error { background: #D93D42; }
```

### Avatars

```css
.avatar {
  border-radius: 50%;
  object-fit: cover;
}
.avatar-sm { width: 32px; height: 32px; }
.avatar-md { width: 40px; height: 40px; }
.avatar-lg { width: 56px; height: 56px; }
.avatar-xl { width: 80px; height: 80px; }

.avatar-placeholder {
  background: #E6F4F4;
  color: #0A8080;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Progress Indicators

#### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: #E5E5E5;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #0A8080;
  transition: width 300ms ease;
}
```

#### Step Indicator
```css
.steps {
  display: flex;
  align-items: center;
}
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.step-incomplete {
  background: #E5E5E5;
  color: #737373;
}
.step-current {
  background: #0A8080;
  color: white;
}
.step-complete {
  background: #0B8E4C;
  color: white;
}
.step-connector {
  flex: 1;
  height: 2px;
  background: #E5E5E5;
  margin: 0 8px;
}
.step-connector-complete {
  background: #0B8E4C;
}
```

### Tooltips

```css
.tooltip {
  background: #1A1A1A;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  max-width: 240px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.tooltip-arrow {
  /* CSS triangle pointing to trigger */
}
```

---

## Navigation Patterns

### Sidebar Navigation

```
┌────────────────────┐
│  [Logo]            │
├────────────────────┤
│  Home              │  ← Icon + Label
│  People            │  ← With expand arrow
│    ├─ Team         │  ← Nested items
│    ├─ Hiring       │
│    └─ Onboarding   │
│  Payroll           │
│  Benefits          │
│  Time off          │
│  Reports           │
├────────────────────┤
│  Settings          │  ← Bottom section
│  Help              │
├────────────────────┤
│  [Avatar] User     │  ← User menu
│  Company name      │
└────────────────────┘
```

**Sidebar Specs**:
- Width: 240px (collapsed: 64px)
- Background: White or Dark Gray (#1A1A1A)
- Active item: Teal text, light teal background (#E6F4F4)
- Icons: 20px, color inherits from text
- Hover: Light gray background (#F5F5F5)

### Breadcrumbs

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/people">People</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">John Smith</li>
  </ol>
</nav>
```

**Specs**:
- Separator: "/" or ">" with 8px horizontal margin
- Current page: Bold, not linked
- Links: Teal color
- Font size: 14px

### Tab Navigation

```
┌──────────────────────────────────────────────┐
│  [Overview]  [Details]  [Documents]  [Notes] │
├──────────────────────────────────────────────┤
│                                              │
│  Tab content area                            │
│                                              │
└──────────────────────────────────────────────┘
```

**Specs**:
- Active tab: Teal text, 2px teal bottom border
- Inactive: Gray 700 text
- Tab padding: 12px 16px
- Border-bottom on container: 1px #E5E5E5

### Command Palette (Quick Search)

```
┌─────────────────────────────────────────────────┐
│  🔍  Search for anything...            ⌘K      │
├─────────────────────────────────────────────────┤
│  Recent                                         │
│  ├─ 👤 John Smith                              │
│  ├─ 📄 Q4 Payroll Report                       │
│  └─ ⚙️ Company Settings                        │
├─────────────────────────────────────────────────┤
│  Navigation                                     │
│  ├─ → Go to People                             │
│  ├─ → Go to Payroll                            │
│  └─ → Go to Reports                            │
├─────────────────────────────────────────────────┤
│  Actions                                        │
│  ├─ + Add new employee                         │
│  ├─ + Run payroll                              │
│  └─ + Create report                            │
└─────────────────────────────────────────────────┘
```

**Specs**:
- Overlay: Semi-transparent black backdrop
- Modal: White, max-width 640px, centered
- Input: Full-width, large (48px height)
- Results: Grouped by category
- Keyboard: Arrow keys navigate, Enter selects

---

## Form Patterns

### Form Layout

```html
<form class="form">
  <div class="form-section">
    <h3 class="form-section-title">Personal Information</h3>

    <div class="form-row">
      <div class="form-field">
        <label>First name</label>
        <input type="text" />
      </div>
      <div class="form-field">
        <label>Last name</label>
        <input type="text" />
      </div>
    </div>

    <div class="form-field">
      <label>Email address</label>
      <input type="email" />
      <span class="hint">We'll use this for notifications</span>
    </div>
  </div>

  <div class="form-actions">
    <button type="button" class="btn-secondary">Cancel</button>
    <button type="submit" class="btn-primary">Save changes</button>
  </div>
</form>
```

### Validation Patterns

#### Inline Validation
```html
<div class="form-field form-field-error">
  <label>Password</label>
  <input type="password" aria-invalid="true" aria-describedby="pwd-error" />
  <span id="pwd-error" class="error-message">
    <svg class="icon-error" /> Password must be at least 8 characters
  </span>
</div>
```

#### Password Strength Meter
```
Password: [••••••••••••••          ]
          ████████░░░░░░  Strong

Requirements:
✓ At least 8 characters
✓ One uppercase letter
✓ One number
✗ One special character
```

### Multi-Step Form (Wizard)

**Pattern**: Fixed header with progress, scrollable content, fixed footer

```
┌─────────────────────────────────────────────┐
│  Step 2 of 5: Company Details               │
│  ████████████░░░░░░░░░░░░░░  40%           │
├─────────────────────────────────────────────┤
│                                             │
│  [Scrollable form content]                  │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  [← Back]    [Save for later]   [Continue →]│
└─────────────────────────────────────────────┘
```

**Footer Button Pattern**:
- Left: Back button (outline)
- Center: Save for later (link/ghost)
- Right: Continue/Submit (primary)

### Inline Entity Creation

When creating related entities within a form:

```
Manager: [Select manager ▼]  [+ Add new manager]

┌─ Add new manager ─────────────────────────┐
│  Name: [________________]                 │
│  Email: [________________]                │
│  [Cancel]              [Add manager]      │
└───────────────────────────────────────────┘
```

---

## Data Display

### Tables

```html
<table class="table">
  <thead>
    <tr>
      <th><input type="checkbox" aria-label="Select all" /></th>
      <th aria-sort="ascending">Name ↑</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input type="checkbox" /></td>
      <td>John Smith</td>
      <td>john@example.com</td>
      <td><span class="badge badge-green">Active</span></td>
      <td><button class="btn-icon">⋮</button></td>
    </tr>
  </tbody>
</table>
```

**Table Specs**:
- Header: Gray 50 background, semibold text
- Rows: White background, hover to Gray 50
- Cell padding: 16px horizontal, 12px vertical
- Borders: 1px bottom border on each row
- Selected row: Light teal background

#### Table Features
- **Sorting**: Click header to sort, show arrow indicator
- **Filtering**: Inline filter inputs or dropdown filters
- **Bulk Selection**: Checkbox column, action bar appears when selected
- **Pagination**: Bottom of table with page size selector
- **Empty State**: Illustration + message + CTA

### Data Cards

```
┌────────────────────────────────────────┐
│  John Smith                    [⋮]    │
│  Software Engineer                     │
├────────────────────────────────────────┤
│  📧 john@example.com                   │
│  📞 (555) 123-4567                     │
│  📍 San Francisco, CA                  │
├────────────────────────────────────────┤
│  Status: ● Active                      │
│  Started: Jan 15, 2024                 │
└────────────────────────────────────────┘
```

### Empty States

```
┌────────────────────────────────────────────────┐
│                                                │
│            [Illustration]                      │
│                                                │
│         No employees yet                       │
│                                                │
│    Add your first team member to get          │
│    started with payroll and benefits.          │
│                                                │
│         [+ Add employee]                       │
│                                                │
└────────────────────────────────────────────────┘
```

**Empty State Components**:
1. Illustration (relevant to context)
2. Title (clear, specific)
3. Description (explains benefit of adding data)
4. Primary CTA (action to resolve empty state)

---

## Feedback & Status

### Toast Notifications

**Position**: Bottom-left corner, 24px from edges

```
┌────────────────────────────────────────┐
│  ✓  Employee added successfully    ✕   │
│     John Smith is now part of the team │
└────────────────────────────────────────┘
```

**Variants**:
- **Success**: Green left border, green check icon
- **Error**: Red left border, red X icon
- **Warning**: Yellow left border, yellow warning icon
- **Info**: Blue left border, blue info icon

**Specs**:
- Width: 360px max
- Duration: 5 seconds (success/info), persistent (error/warning)
- Stacking: Multiple toasts stack upward
- Animation: Slide in from left

### Alert Banners

```
┌──────────────────────────────────────────────────────┐
│ ⚠️ Your trial expires in 3 days. [Upgrade now →]     │
└──────────────────────────────────────────────────────┘
```

**Types**:
- **Page-level**: Full-width, below header
- **Section-level**: Within card/section
- **Dismissible**: X button on right

### Loading States

#### Skeleton Loaders
```
┌─────────────────────────────────────┐
│  ████████████  ███████              │  ← Header skeleton
├─────────────────────────────────────┤
│  ████████  █████████████████████    │  ← Row skeleton
│  ████████  █████████████████████    │
│  ████████  █████████████████████    │
└─────────────────────────────────────┘
```

#### Spinners
- Button: 16px inline spinner
- Page: 40px centered spinner with "Loading..." text
- Branded: Animated Gusto shapes (teal/coral/yellow)

### Confirmation Modals

```
┌─────────────────────────────────────────────┐
│                                             │
│  🗑️                                        │
│                                             │
│  Delete this employee?                      │
│                                             │
│  This will permanently remove John Smith    │
│  from your team. This action cannot be      │
│  undone.                                    │
│                                             │
│  [Cancel]              [Delete employee]    │
│                                             │
└─────────────────────────────────────────────┘
```

**Destructive Modal Specs**:
- Icon: Relevant to action (trash for delete)
- Title: Action-oriented question
- Description: Consequences + irreversibility warning
- Buttons: Cancel (outline), Destructive (red primary)

---

## Animation & Motion

### Timing Functions

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale

| Duration | Usage |
|----------|-------|
| 75ms | Micro-interactions (hover color) |
| 150ms | Buttons, inputs, toggles |
| 200ms | Dropdowns, tooltips |
| 300ms | Modals, sidebars |
| 500ms | Page transitions |

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Branded Loading Animation

Gusto uses playful animated shapes:
- Teal circle
- Coral diamond
- Yellow square
- Shapes rotate and scale in sequence

---

## Accessibility

### Focus Management

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid #0A8080;
  outline-offset: 2px;
}

/* Focus trap for modals */
/* Tab cycles through modal content only */
```

### ARIA Patterns

```html
<!-- Sortable table header -->
<th aria-sort="ascending" role="columnheader">
  Name <span aria-hidden="true">↑</span>
</th>

<!-- Status indicator -->
<span class="status-dot status-active">
  <span class="sr-only">Active</span>
</span>

<!-- Icon button -->
<button aria-label="Edit employee">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Loading state -->
<button disabled aria-busy="true">
  <span class="spinner" aria-hidden="true"></span>
  Saving...
</button>
```

### Color Contrast

All text meets WCAG 2.1 AA requirements:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation

- **Tab**: Move between interactive elements
- **Shift+Tab**: Move backwards
- **Enter/Space**: Activate buttons, links
- **Escape**: Close modals, dropdowns
- **Arrow keys**: Navigate menus, tabs, grids

---

## Mobile & Responsive

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape / small desktop */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

### Mobile Patterns

#### Bottom Navigation (Mobile)
```
┌─────────────────────────────────────┐
│  [Content area]                     │
├─────────────────────────────────────┤
│  🏠   👥   💰   ⚙️   ☰              │
│ Home People Pay Settings More       │
└─────────────────────────────────────┘
```

#### Slide-Over Panel (Mobile)
- Full-width on mobile
- Slides from right on tablet+
- Fixed header with close button
- Scrollable content

#### Touch Targets
- Minimum: 44x44px
- Spacing: 8px between targets
- Increased padding on mobile

### Responsive Table Strategies

1. **Horizontal scroll**: Table scrolls independently
2. **Card transformation**: Rows become cards on mobile
3. **Priority columns**: Hide less important columns
4. **Expandable rows**: Summary visible, details on expand

---

## Design Tokens Summary

```css
:root {
  /* Colors */
  --color-primary: #0A8080;
  --color-primary-hover: #086868;
  --color-primary-light: #E6F4F4;
  --color-accent: #F45D48;
  --color-success: #0B8E4C;
  --color-error: #D93D42;
  --color-warning: #F5A623;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #4A4A4A;
  --color-text-muted: #737373;
  --color-border: #D1D1D1;
  --color-bg-subtle: #F5F5F5;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Tiempos Headline', Georgia, serif;
  --font-mono: 'SF Mono', monospace;

  /* Spacing */
  --space-unit: 8px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-xl: 0 8px 24px rgba(0,0,0,0.16);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

*This design system document was synthesized from comprehensive analysis of 363 Gusto screenshots, covering all major product areas and interaction patterns.*
