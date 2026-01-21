# Cardiva UI Design System

**Based on:** Gusto Design System Analysis (65+ screenshots analyzed)
**Created:** 2025-01-21
**Purpose:** Component specifications for Cardiva RFP Matching App

---

## Design Philosophy

- **Clean & Professional**: Minimal SaaS aesthetic with pharmaceutical-appropriate trust signals
- **Spacious**: Generous whitespace, breathing room between elements
- **Accessible**: High contrast, clear hierarchy, WCAG 2.1 AA compliant
- **Consistent**: Unified patterns across all interactions

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0A6B5D` | Primary buttons, links, active states, focus rings |
| `--color-primary-hover` | `#085A4E` | Button hover states |
| `--color-primary-light` | `#E8F4F2` | Selected row backgrounds, light accents |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-coral` | `#F45D48` | Error states, destructive actions, alerts |
| `--color-coral-light` | `#FEF2F0` | Error backgrounds |
| `--color-yellow` | `#F5A623` | Warning states, pending indicators |
| `--color-green` | `#0D9488` | Success states, completed indicators |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-white` | `#FFFFFF` | Page backgrounds, cards |
| `--color-gray-50` | `#F9FAFB` | Secondary backgrounds, table stripes |
| `--color-gray-100` | `#F3F4F6` | Input backgrounds, dividers |
| `--color-gray-200` | `#E5E7EB` | Borders, separators |
| `--color-gray-400` | `#9CA3AF` | Placeholder text, disabled states |
| `--color-gray-600` | `#4B5563` | Secondary text, labels |
| `--color-gray-900` | `#111827` | Primary text, headings |

---

## Typography

### Font Stack

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `h1` | 32px | 600 | 1.25 | Page titles |
| `h2` | 24px | 600 | 1.3 | Section headers |
| `h3` | 20px | 600 | 1.4 | Card titles, modal headers |
| `h4` | 16px | 600 | 1.5 | Subsection headers |
| `body` | 14px | 400 | 1.5 | Default body text |
| `body-sm` | 13px | 400 | 1.5 | Helper text, secondary info |
| `caption` | 12px | 400 | 1.4 | Labels, timestamps |

### Text Colors

- **Primary**: `--color-gray-900` for headings and important content
- **Secondary**: `--color-gray-600` for labels and helper text
- **Muted**: `--color-gray-400` for placeholders and disabled
- **Link**: `--color-primary` with underline on hover

---

## Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Input padding, small gaps |
| `--space-3` | 12px | Button padding, list items |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Large gaps, modal padding |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Page margins |
| `--space-12` | 48px | Large section breaks |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small inputs, badges |
| `--radius-md` | 6px | Buttons, cards, inputs |
| `--radius-lg` | 8px | Modals, larger cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

---

## Layout

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (64px) - Logo, User Menu                            │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Sidebar  │  Main Content Area                               │
│ (240px)  │  - Max width: 1200px                             │
│          │  - Padding: 40px                                 │
│ - Home   │  - Background: white                             │
│ - RFPs   │                                                  │
│ - Inv    │                                                  │
│ - Hist   │                                                  │
│          │                                                  │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│  Footer - Help links, Copyright                             │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Navigation

- **Width**: 240px (collapsible to 64px on mobile)
- **Background**: `--color-gray-900` (dark) or `--color-white` (light theme)
- **Items**: Icon + Label, 48px height
- **Active State**: `--color-primary` left border (4px), background highlight
- **Hover**: Subtle background change

### Content Area

- **Max Width**: 1200px centered
- **Padding**: 40px horizontal, 32px vertical
- **Background**: `--color-white`

---

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--color-gray-900);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 14px;
  border: 1px solid var(--color-gray-200);
  cursor: pointer;
}
.btn-secondary:hover {
  background: var(--color-gray-50);
}
```

#### Text Link Button
```css
.btn-link {
  color: var(--color-primary);
  background: none;
  border: none;
  padding: 0;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
}
```

#### Button with Dropdown (Split Button)
- Primary section with main action
- Caret dropdown for additional actions
- Used for "Add person ▼" pattern

#### Destructive Button
- Red/coral color for delete, remove actions
- Confirmation required before execution

### Form Inputs

#### Text Input
```css
.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.input::placeholder {
  color: var(--color-gray-400);
}
```

#### Input with Label
```html
<div class="form-field">
  <label class="form-label">Email address</label>
  <input type="email" class="input" />
  <span class="form-helper">We'll send confirmation here</span>
</div>
```

#### Input States

| State | Border | Background | Icon |
|-------|--------|------------|------|
| Default | `--color-gray-200` | white | - |
| Focus | `--color-primary` | white | - |
| Error | `--color-coral` | `--color-coral-light` | Red exclamation |
| Success | `--color-green` | white | Green checkmark |
| Disabled | `--color-gray-200` | `--color-gray-100` | - |

#### Select Dropdown
- Same styling as text input
- Chevron down icon on right
- Dropdown panel with hover states

#### Date Picker
- Calendar icon on left
- Format: mm/dd/yyyy
- Clear button (X) on right when filled
- Dropdown calendar for selection

#### Checkbox
```css
.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-gray-300);
  border-radius: 4px;
  cursor: pointer;
}
.checkbox:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  /* White checkmark icon */
}
```

#### Radio Button
```css
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-gray-300);
  border-radius: 50%;
  cursor: pointer;
}
.radio:checked {
  border-color: var(--color-primary);
  /* Inner filled circle */
}
```

#### Radio Card (Selection Card)
```css
.radio-card {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: pointer;
}
.radio-card.selected {
  border-color: var(--color-primary);
  border-left-width: 4px;
  background: var(--color-primary-light);
}
```

### Data Tables

#### Table Structure
```html
<div class="table-container">
  <div class="table-header">
    <div class="table-search">
      <input type="search" placeholder="Search..." />
    </div>
    <div class="table-actions">
      <span class="selected-count">1 selected</span>
      <button class="btn-actions">Actions ▼</button>
      <button class="btn-filter">Filter</button>
    </div>
  </div>
  <table class="data-table">
    <thead>
      <tr>
        <th class="checkbox-col"><input type="checkbox" /></th>
        <th class="sortable">Name ↕</th>
        <th class="sortable">Status ↕</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <!-- rows -->
    </tbody>
  </table>
</div>
```

#### Table Features
- **Sortable Columns**: Up/down arrows, click to sort
- **Checkbox Selection**: Select all, individual selection
- **Bulk Actions**: Dropdown appears when items selected
- **Row Hover**: Subtle background highlight
- **Link Columns**: Teal text, underline on hover
- **Status Indicators**: Colored dots (yellow=pending, green=active, red=error)
- **Action Menu**: Kebab (three dots) menu per row

#### Pagination
- "Showing 1-10 of 100" text
- Previous/Next buttons
- Page numbers: 1, 2, 3... 10

### Cards

#### Basic Card
```css
.card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 24px;
}
```

#### Summary Card (Review Page)
```html
<div class="summary-card">
  <div class="summary-header">
    <h3>Personal</h3>
    <button class="btn-link">Edit</button>
  </div>
  <div class="summary-row">
    <span class="summary-label">Name</span>
    <span class="summary-value">John Doe</span>
  </div>
</div>
```

### Modals

#### Modal Structure
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}
.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body {
  padding: 24px;
}
.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

#### Modal Types
1. **Form Modal**: Create department, sign form
2. **Confirmation Modal**: Delete confirmation
3. **Information Modal**: Details view
4. **Verification Modal**: 6-digit code input

### Progress Indicators

#### Horizontal Step Indicator
```html
<div class="steps">
  <div class="step completed">
    <div class="step-indicator">✓</div>
    <span class="step-label">1. Upload</span>
  </div>
  <div class="step-connector completed"></div>
  <div class="step active">
    <div class="step-indicator">2</div>
    <span class="step-label">2. Review</span>
  </div>
  <div class="step-connector"></div>
  <div class="step">
    <div class="step-indicator">3</div>
    <span class="step-label">3. Export</span>
  </div>
</div>
```

#### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}
```

#### Vertical Timeline
- Completed steps: Teal checkmark
- Current step: Teal dot with "Continue" button
- Pending steps: Gray dot

### Alerts & Notifications

#### Alert Banner (Inline)
```css
.alert-error {
  background: var(--color-coral-light);
  border-left: 4px solid var(--color-coral);
  padding: 16px;
  border-radius: var(--radius-md);
}
.alert-error .alert-icon {
  color: var(--color-coral);
}
```

| Type | Border Color | Background | Icon |
|------|--------------|------------|------|
| Error | `--color-coral` | `--color-coral-light` | Circle-X |
| Warning | `--color-yellow` | Yellow-50 | Triangle-! |
| Success | `--color-green` | Green-50 | Checkmark |
| Info | `--color-primary` | `--color-primary-light` | Info-i |

#### Toast Notification
```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}
.toast-success .toast-icon {
  color: var(--color-green);
}
.toast-dismiss {
  margin-left: auto;
  color: var(--color-gray-400);
}
```

### Empty States

```html
<div class="empty-state">
  <img src="illustration.svg" alt="" class="empty-illustration" />
  <h3 class="empty-title">No RFPs uploaded yet</h3>
  <p class="empty-description">Upload your first RFP to get started with matching</p>
  <button class="btn-primary">Upload RFP</button>
</div>
```

### File Upload

#### Dropzone
```css
.dropzone {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-md);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone:hover,
.dropzone.dragover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
```

#### Upload Content
```html
<div class="dropzone">
  <div class="dropzone-icon">📄</div>
  <p><a class="btn-link">Select File</a></p>
  <p class="dropzone-hint">or drop your file here</p>
  <p class="dropzone-formats">Supported: PDF (max 10MB)</p>
</div>
```

### Navigation

#### Tabs
```css
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
  gap: 32px;
}
.tab {
  padding: 12px 0;
  color: var(--color-gray-600);
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab.active {
  color: var(--color-gray-900);
  border-bottom-color: var(--color-primary);
}
```

#### Breadcrumbs
```html
<nav class="breadcrumbs">
  <a href="/">Home</a>
  <span class="separator">/</span>
  <a href="/rfps">RFPs</a>
  <span class="separator">/</span>
  <span class="current">Upload</span>
</nav>
```

### Avatars

```css
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 12px;
}
```

### Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}
.badge-pending {
  background: #FEF3C7;
  color: #92400E;
}
.badge-success {
  background: #D1FAE5;
  color: #065F46;
}
.badge-error {
  background: #FEE2E2;
  color: #991B1B;
}
```

---

## Cardiva-Specific Components

### RFP Upload Card

```html
<div class="upload-card">
  <div class="upload-card-header">
    <h2>Upload RFP</h2>
    <p>Upload a PDF file to extract and match products</p>
  </div>
  <div class="dropzone">
    <!-- dropzone content -->
  </div>
  <div class="upload-card-footer">
    <span class="upload-hint">Processing takes 3-5 minutes</span>
  </div>
</div>
```

### Match Result Card

```html
<div class="match-card">
  <div class="match-header">
    <div class="match-rfp-item">
      <span class="match-label">RFP Item</span>
      <span class="match-value">Seringa descartável 5ml</span>
    </div>
    <div class="match-status">
      <span class="badge badge-pending">Pending Review</span>
    </div>
  </div>
  <div class="match-suggestions">
    <h4>Suggested Matches</h4>
    <div class="match-option">
      <input type="radio" name="match-1" />
      <div class="match-option-content">
        <span class="match-product">SERINGA DESC 5ML C/AG - COD: 12345</span>
        <span class="match-confidence high">95% match</span>
      </div>
      <button class="btn-accept">Accept</button>
    </div>
    <div class="match-option">
      <input type="radio" name="match-1" />
      <div class="match-option-content">
        <span class="match-product">SERINGA DESC 3ML C/AG - COD: 12346</span>
        <span class="match-confidence medium">72% match</span>
      </div>
      <button class="btn-accept">Accept</button>
    </div>
  </div>
  <div class="match-actions">
    <button class="btn-secondary">Reject All</button>
    <button class="btn-link">Manual Match</button>
  </div>
</div>
```

### Confidence Score Indicator

```css
.confidence {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.confidence.high {
  color: var(--color-green);
}
.confidence.medium {
  color: var(--color-yellow);
}
.confidence.low {
  color: var(--color-coral);
}
```

### Processing Status Banner

```html
<div class="processing-banner">
  <div class="processing-spinner"></div>
  <div class="processing-content">
    <span class="processing-title">Processing RFP...</span>
    <span class="processing-subtitle">This may take 3-5 minutes</span>
  </div>
  <div class="processing-progress">
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 45%"></div>
    </div>
    <span class="progress-text">Extracting products...</span>
  </div>
</div>
```

### Inventory Table

Extended data table with:
- Product code column
- Product name column (searchable)
- Category column (filterable)
- Stock status column
- Last updated column
- Actions column

### History List

```html
<div class="history-item">
  <div class="history-icon">📄</div>
  <div class="history-content">
    <span class="history-title">RFP_Hospital_Central_Jan2025.pdf</span>
    <span class="history-meta">Uploaded Jan 15, 2025 • 45 items matched</span>
  </div>
  <div class="history-status">
    <span class="badge badge-success">Completed</span>
  </div>
  <div class="history-actions">
    <button class="btn-link">View Results</button>
    <button class="btn-link">Re-download</button>
  </div>
</div>
```

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

| Breakpoint | Sidebar | Content Width | Adjustments |
|------------|---------|---------------|-------------|
| < 768px | Hidden (hamburger) | 100% | Stack forms vertically |
| 768-1024px | Collapsed (icons only) | 100% - 64px | Reduce padding |
| > 1024px | Full (240px) | Max 1200px | Full layout |

---

## Animation & Transitions

```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

### Common Animations

- **Button hover**: Background color transition (fast)
- **Input focus**: Border and shadow transition (fast)
- **Modal open**: Fade in + scale up (normal)
- **Toast appear**: Slide in from left (normal)
- **Dropdown open**: Fade in + slide down (fast)
- **Progress bar**: Width transition (slow)

---

## Icon System

Use **Lucide Icons** (MIT licensed, consistent with shadcn/ui)

### Common Icons

| Icon | Usage |
|------|-------|
| `home` | Dashboard/Home nav |
| `file-text` | RFP/Documents |
| `package` | Inventory |
| `history` | History |
| `upload` | Upload action |
| `download` | Download/Export |
| `check` | Success, completed |
| `x` | Close, error, remove |
| `alert-circle` | Warning |
| `info` | Information |
| `search` | Search |
| `filter` | Filter |
| `more-vertical` | Kebab menu |
| `chevron-down` | Dropdown |
| `arrow-up-down` | Sort |
| `edit` | Edit action |
| `trash` | Delete action |
| `mail` | Email |
| `user` | User/Profile |
| `settings` | Settings |
| `log-out` | Logout |

---

## Implementation Notes

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui (Radix primitives)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **State**: Zustand + TanStack Query

### shadcn/ui Components to Use

- `Button` - All button variants
- `Input` - Text inputs
- `Select` - Dropdowns
- `Checkbox` - Checkboxes
- `RadioGroup` - Radio buttons
- `Dialog` - Modals
- `Table` - Data tables
- `Tabs` - Tab navigation
- `Toast` - Notifications
- `Progress` - Progress bars
- `Card` - Cards
- `Badge` - Status badges
- `Avatar` - User avatars
- `DropdownMenu` - Action menus
- `AlertDialog` - Confirmations

### Custom Components Needed

1. `FileDropzone` - File upload with drag & drop
2. `MatchCard` - RFP match result display
3. `ConfidenceIndicator` - Match score visualization
4. `ProcessingBanner` - Background processing status
5. `StepIndicator` - Multi-step progress
6. `EmptyState` - Empty state with illustration
7. `DataTable` - Extended table with all features
8. `Sidebar` - App navigation

---

*Design system extracted from 65+ Gusto UI screenshots*
*Last updated: 2025-01-21*
