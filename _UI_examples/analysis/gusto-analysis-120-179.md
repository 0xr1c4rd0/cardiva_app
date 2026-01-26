# Gusto UI/UX Analysis - Screenshots 120-179

## Executive Summary

This analysis covers 60 Gusto screenshots (120-179) focusing on HR/payroll workflows including:
- Background checks setup and configuration
- Compensation benchmarking tools
- Onboarding checklists
- Contractor payments (US and Non-US)
- Automated payment scheduling
- Pay history and reporting

---

## Individual Screenshot Analysis

### Screenshot 120 - Background Check Service Overview
- **Page/Screen Type**: Information/service overview page
- **Layout Pattern**: Two-column content layout with sidebar navigation
- **Components Used**:
  - Left sidebar navigation (dark theme)
  - Two-column text content (What it costs / What it can contain)
  - Checkbox with legal agreement text
  - Loading indicator (spinner with "Please wait...")
  - Bullet point lists
  - Hyperlinks (underlined text links)
- **Color Usage**:
  - Dark sidebar (#1a1a2e or similar)
  - White content area
  - Teal/green accent for interactive elements
  - Red Gusto logo
- **Typography**:
  - Large section headers (bold, ~18-20px)
  - Body text in gray (~14px)
  - Bullet points with consistent spacing
- **Spacing & Whitespace**: Generous padding, clear separation between sections
- **Navigation**: Persistent left sidebar with icons + labels
- **Notable UX Patterns**: Legal consent checkbox before proceeding, clear pricing transparency

---

### Screenshot 121 - Background Check Introduction (Selection State 1)
- **Page/Screen Type**: Multi-step form / onboarding wizard
- **Layout Pattern**: Sidebar + centered form content with right sidebar context
- **Components Used**:
  - Breadcrumb navigation
  - Radio button group
  - Primary/secondary button pair (Go back / Continue)
  - Informational sidebar callout (teal background)
  - Hyperlinks in text
- **Color Usage**:
  - Teal primary buttons
  - Teal sidebar highlight box
  - Gray text hierarchy
- **Typography**:
  - Large question header
  - Smaller explanatory text
  - Radio button labels
- **Spacing & Whitespace**: Excellent - clear visual hierarchy with generous margins
- **Notable UX Patterns**:
  - Right sidebar provides contextual statistics ("1 in 3 Americans will be flagged")
  - Binary choice with clear labeling
  - Progressive disclosure

---

### Screenshot 122 - Background Check Introduction (Selection State 2)
- **Page/Screen Type**: Multi-step form with conditional follow-up
- **Layout Pattern**: Same as 121 with expanded content
- **Components Used**:
  - Radio buttons (parent question selected)
  - Nested radio buttons (follow-up question)
  - Progressive disclosure pattern
- **Notable UX Patterns**:
  - Conditional questions appear after primary selection
  - Clear relationship between questions
  - Follow-up options: "Legally required" vs "Employee vetting"

---

### Screenshot 123 - Checkr Account Setup (Step 1)
- **Page/Screen Type**: Multi-step wizard with progress indicator
- **Layout Pattern**: Centered form with horizontal step indicator
- **Components Used**:
  - Horizontal progress stepper (1. Create account, 2. Create a company policy, 3. Select plan)
  - Progress bar (teal, segmented)
  - Text input field with label and helper text
  - Button pair (Cancel / Create account - teal primary)
- **Color Usage**:
  - Teal progress bar and primary button
  - Gray inactive steps
  - White form background
- **Typography**: Clear step labels, form labels with descriptions
- **Spacing & Whitespace**: Very generous, focused single-field form
- **Notable UX Patterns**:
  - Simple step indicator shows position in flow
  - Single field per screen reduces cognitive load

---

### Screenshot 124 - Company Policy Creation (Step 2a)
- **Page/Screen Type**: Rich text editor / policy creation
- **Layout Pattern**: Sidebar + main content with text editor
- **Components Used**:
  - Breadcrumb navigation
  - Progress stepper
  - Rich text toolbar (B, I, U, alignment icons)
  - Text area with customizable content
  - Link to "View EEOC guidelines"
  - "Customize" label
- **Color Usage**: Standard with teal accents
- **Typography**:
  - Section headers
  - Body text in editor
  - Placeholder/template text
- **Notable UX Patterns**:
  - Pre-filled template content
  - Link to external guidelines
  - Minimal toolbar with essential formatting

---

### Screenshot 125 - Company Policy Creation (Continued)
- **Page/Screen Type**: Policy editor continuation
- **Layout Pattern**: Scrolled view of policy editor
- **Components Used**:
  - Rich text editor (continued)
  - Bullet point content
  - Checkbox option at bottom
  - Purpose/Scope sections
- **Notable UX Patterns**:
  - Structured policy template with clear sections
  - Legal language formatting
  - Company name placeholder integration

---

### Screenshot 126 - Company Policy (Statement of Purpose Section)
- **Page/Screen Type**: Form with textarea
- **Layout Pattern**: Form section with labeled textarea
- **Components Used**:
  - Checkbox (with teal checkmark)
  - Textarea input
  - Checkbox for sharing statement with candidates
  - Button pair (Back / Continue)
- **Color Usage**: Teal checkmarks, teal Continue button
- **Notable UX Patterns**:
  - Optional sharing preference
  - Back/Continue navigation pattern

---

### Screenshot 127 - Company Policy (Checkbox State)
- **Page/Screen Type**: Same form with checkbox interaction
- **Layout Pattern**: Same as 126
- **Components Used**: Same with checkbox checked state visible
- **Notable UX Patterns**: Checkbox with teal fill when selected

---

### Screenshot 128 - Company Policy (Filled State with Validation)
- **Page/Screen Type**: Form with validation state
- **Layout Pattern**: Same form layout
- **Components Used**:
  - Textarea with user input
  - Error message (red text): "A statement of purpose is required"
- **Color Usage**: Red error text for validation
- **Notable UX Patterns**:
  - Inline validation messages
  - Error appears below field

---

### Screenshot 129 - Select Package (Step 3)
- **Page/Screen Type**: Package/plan selection cards
- **Layout Pattern**: Card grid layout (2x2)
- **Components Used**:
  - Selection cards with radio behavior
  - Pricing displayed prominently
  - Feature bullet lists per card
  - Info callout box (lightbulb icon)
  - Accordion FAQs (collapsed)
- **Color Usage**:
  - Teal border on selected card
  - Gray/white card backgrounds
  - Yellow info box
- **Typography**:
  - Package names as headers
  - Price prominently displayed
  - Feature list items
- **Spacing & Whitespace**: Cards have good internal padding
- **Notable UX Patterns**:
  - Visual card selection (radio-like behavior)
  - Pricing transparency
  - Contextual help for decision-making

---

### Screenshot 130 - Package Selection (With Selection State)
- **Page/Screen Type**: Same as 129 with active selection
- **Layout Pattern**: Card grid with FAQs visible
- **Components Used**:
  - Selected card (teal border, radio filled)
  - Expanded FAQ section with accordion items
  - Button pair (Back / Select package)
- **Notable UX Patterns**:
  - FAQs help users make informed decisions
  - Clear selection indication

---

### Screenshot 131 - Background Checks Results (Empty State)
- **Page/Screen Type**: List view with empty state
- **Layout Pattern**: Sidebar + main content with tabs
- **Components Used**:
  - Tab navigation (Results / Settings)
  - Warning alert banner (yellow background)
  - Search input
  - Data table headers (Name, Job title, Package, Status)
  - Empty state illustration (clipboard/document icon)
  - Primary action button (teal: "Run a background check")
  - Filter button
- **Color Usage**:
  - Yellow warning banner
  - Teal primary button
  - Gray table headers
- **Typography**: Clear column headers with sort indicators
- **Empty States**:
  - Simple line illustration
  - "No background checks yet" message
  - Explanatory subtext
- **Notable UX Patterns**:
  - Warning explains setup requirement
  - Clear call-to-action in empty state

---

### Screenshot 132 - Compensation Tool (Initial State)
- **Page/Screen Type**: Search/filter interface with results summary
- **Layout Pattern**: Horizontal filter bar + results area
- **Components Used**:
  - Tab navigation (Curated jobs / All other jobs)
  - Multiple filter dropdowns (Job title, Seniority level, Labor market, Industry, Company size)
  - Search button (teal)
  - "View labor market details" link
  - Toggle buttons (Annual / Hourly)
  - Results summary card with large number ($52,000)
  - Beta badge
- **Color Usage**:
  - Teal search button and toggle active state
  - Large teal dollar amount
- **Typography**:
  - Large salary figure
  - Small explanatory text
- **Notable UX Patterns**:
  - Multi-parameter search
  - Clear results visualization
  - Data source attribution

---

### Screenshot 133 - Compensation Tool (Dropdown Open)
- **Page/Screen Type**: Same with autocomplete dropdown
- **Layout Pattern**: Filter bar with open dropdown
- **Components Used**:
  - Autocomplete dropdown with job title suggestions
  - Dropdown items (Account Executive, Accountant, Analyst, Assistant, Attorney, Bookkeeper)
- **Notable UX Patterns**:
  - Predictive suggestions for job titles
  - Clean dropdown styling

---

### Screenshot 134 - Compensation Tool (Selected Job)
- **Page/Screen Type**: Search form with selection chip
- **Layout Pattern**: Same filter bar
- **Components Used**:
  - Input with selected value chip (Analyst with X to remove)
- **Notable UX Patterns**:
  - Selected values shown as removable chips
  - Clear indication of current filter state

---

### Screenshot 135 - Compensation Tool (Additional Filters)
- **Page/Screen Type**: Search with multiple filters selected
- **Layout Pattern**: Same with additional dropdown selection
- **Components Used**:
  - Company size filter showing "5-9" selection
- **Notable UX Patterns**: Progressive filter refinement

---

### Screenshot 136 - Compensation Results (Percentile View)
- **Page/Screen Type**: Data visualization / benchmarking results
- **Layout Pattern**: Summary cards + detailed breakdown
- **Components Used**:
  - Search results summary header
  - Filter indicator pills
  - Annual/Hourly toggle
  - Percentile cards (10th, 25th, Median, 75th, 90th)
  - Highlighted median card (teal border)
- **Color Usage**:
  - Teal highlight on median
  - Gray other percentiles
- **Typography**:
  - Large salary numbers
  - Small percentile labels
- **Notable UX Patterns**:
  - Percentile distribution for context
  - Clear median emphasis

---

### Screenshot 137 - Compensation Results (With Distribution Chart)
- **Page/Screen Type**: Data visualization with bar chart
- **Layout Pattern**: Percentile cards + histogram chart
- **Components Used**:
  - Same percentile cards
  - Bar chart showing "Distribution across Gusto"
  - X-axis: Annual salary
  - Y-axis: % of employees
  - Teal highlight bar
- **Color Usage**: Teal for highlighted bar, gray for others
- **Typography**: Chart labels and axis text
- **Notable UX Patterns**:
  - Visual salary distribution
  - Data sourced from "over 500 Gusto companies and over 700 employees"

---

### Screenshot 138 - Onboarding Checklists Modal
- **Page/Screen Type**: Modal/dialog overlay
- **Layout Pattern**: Centered modal with icon illustrations
- **Components Used**:
  - Modal overlay (dimmed background)
  - Three-column feature presentation with icons
  - Icon illustrations (document, bicycle, delegation)
  - Feature descriptions
  - Primary CTA button (teal: "Customize the checklist")
- **Color Usage**:
  - White modal background
  - Teal CTA button
  - Colorful icons
- **Typography**:
  - Modal title
  - Feature headers
  - Description text
- **Notable UX Patterns**:
  - Feature introduction before configuration
  - Visual icons for features

---

### Screenshot 139 - Onboarding Checklists List
- **Page/Screen Type**: List/table view
- **Layout Pattern**: Sidebar + main content list
- **Components Used**:
  - Breadcrumb navigation
  - List items with descriptions
  - Item count badges (5 items, 4 items, etc.)
  - Edit action links
  - Teal indicator dots
- **Color Usage**: Teal dots and edit links
- **Typography**:
  - Checklist names as links
  - Gray descriptions
- **Notable UX Patterns**:
  - Template-based checklists
  - Quick edit access

---

### Screenshot 140 - Employee Onboarding Checklist Detail
- **Page/Screen Type**: Checklist detail/edit view
- **Layout Pattern**: Main content with grouped tasks
- **Components Used**:
  - Page header with actions (Create a new task, Show task suggestions)
  - Task groups by timing (Before Day 1, On Day 1)
  - Checkbox tasks with teal indicators
  - Three-dot menu on tasks
  - "+ Add a task" link
- **Color Usage**:
  - Teal checkboxes/indicators
  - Teal action buttons
- **Typography**: Section headers, task names
- **Notable UX Patterns**:
  - Time-based task grouping
  - Easy task addition

---

### Screenshot 141 - Add a Task Modal (Empty)
- **Page/Screen Type**: Modal form
- **Layout Pattern**: Slide-over or centered modal
- **Components Used**:
  - Form fields: Task title (required), Description (optional)
  - Dropdown: Assign to (optional)
  - Radio group: Due date (Before Day 1, On Day 1, After Day 1)
  - Checkbox group: Who should get this task?
  - Form buttons (partially visible)
- **Color Usage**: Standard form colors
- **Typography**: Field labels, helper text
- **Notable UX Patterns**:
  - Optional vs required field indication
  - Radio buttons for timing selection

---

### Screenshot 142 - Add a Task Modal (Filled)
- **Page/Screen Type**: Same modal with data
- **Layout Pattern**: Same as 141
- **Components Used**:
  - Filled text inputs ("Virtual office tour")
  - Description textarea filled
- **Notable UX Patterns**: Clear input states

---

### Screenshot 143 - Add a Task Modal (Dropdown Open)
- **Page/Screen Type**: Same modal with dropdown active
- **Layout Pattern**: Same with dropdown overlay
- **Components Used**:
  - Dropdown showing "Manager" option with X to clear
- **Notable UX Patterns**: Assignment dropdown with clear selection

---

### Screenshot 144 - Add a Task Modal (Complete State)
- **Page/Screen Type**: Completed form ready to submit
- **Layout Pattern**: Same modal
- **Components Used**:
  - All fields filled
  - Radio "On Day 1" selected
  - Checkbox "All new employees" checked
  - Button pair (Add & create another / Add task - teal)
- **Color Usage**: Teal buttons, teal radio/checkbox states
- **Notable UX Patterns**:
  - "Add & create another" for bulk creation
  - Complete form validation state

---

### Screenshot 145 - Feedback Survey Modal
- **Page/Screen Type**: Feedback/survey modal
- **Layout Pattern**: Modal overlay on content
- **Components Used**:
  - Rating buttons (Terrible, Bad, Okay, Good, Great)
  - Text input for additional feedback
  - Checkbox for contact permission
  - Button pair (Dismiss / Submit)
  - Toast notification at bottom
- **Color Usage**:
  - Rating buttons in outline style
  - Teal submit button
  - Teal toast notification
- **Typography**: Survey question, rating labels
- **Notable UX Patterns**:
  - Post-task feedback collection
  - 5-point rating scale
  - Optional contact permission

---

### Screenshot 146 - Feedback Survey (Good Selected)
- **Page/Screen Type**: Same feedback modal
- **Layout Pattern**: Same as 145
- **Components Used**:
  - "Good" rating button selected (teal fill)
- **Notable UX Patterns**: Visual feedback on selection

---

### Screenshot 147 - Onboarding Checklist (After Task Addition)
- **Page/Screen Type**: Updated checklist view
- **Layout Pattern**: Same as 140
- **Components Used**:
  - New task added "Virtual office tour" with due date and assignee
  - Task shows additional metadata (Due day 1, Manager)
- **Notable UX Patterns**: Rich task display with metadata

---

### Screenshot 148 - Feedback Survey (With Highlighted Rating)
- **Page/Screen Type**: Feedback modal variation
- **Layout Pattern**: Same modal
- **Components Used**:
  - "Okay" rating highlighted/selected (teal fill)
- **Notable UX Patterns**: Mid-range rating state

---

### Screenshot 149 - Onboarding Checklist (Feedback Submitted)
- **Page/Screen Type**: Checklist with success toast
- **Layout Pattern**: Main content + toast notification
- **Components Used**:
  - Teal toast: "Your feedback was submitted - Thanks for helping us improve"
  - Dismissible notification
- **Color Usage**: Teal success toast
- **Notable UX Patterns**:
  - Confirmation feedback
  - Auto-dismissing toasts

---

### Screenshot 150 - Pay Landing Page
- **Page/Screen Type**: Category selection / landing page
- **Layout Pattern**: Two-card layout
- **Components Used**:
  - Large category cards with icons
  - Icons (dollar envelope, globe)
  - Card titles (US contractors, Non-US contractors)
  - Action buttons (New Payment - teal outline)
  - Header with Settings and View pay history links
- **Color Usage**:
  - Teal outline buttons
  - Subtle card backgrounds
- **Typography**: Large category names
- **Spacing & Whitespace**: Very generous, focused layout
- **Notable UX Patterns**:
  - Clear category separation
  - Visual icons for quick recognition

---

### Screenshot 151 - Pay History (Empty State)
- **Page/Screen Type**: History list with empty state
- **Layout Pattern**: Sidebar + main content with tabs
- **Components Used**:
  - Back navigation arrow
  - Tab navigation (US payrolls, Non-US payrolls, US contractors, Non-US contractors, Other)
  - Data table with sortable columns (Payday, Type, Pay period, Funding, Status, Total)
  - Filter, Columns, Status key controls
  - Empty state illustration (payment/money icon)
  - Activity log link
- **Color Usage**: Teal links, gray empty state
- **Empty States**:
  - Playful illustration
  - "You haven't run payroll yet"
  - Explanatory subtext
- **Notable UX Patterns**:
  - Multiple category tabs
  - Future data indication

---

### Screenshot 152 - Pay Contractors (Empty State with Warning)
- **Page/Screen Type**: Multi-step wizard with empty state
- **Layout Pattern**: Progress stepper + alert + CTA
- **Components Used**:
  - Progress stepper (1. Enter payments, 2. Review and submit, 3. Confirmation)
  - Warning alert (yellow, with icon)
  - Primary CTA button (teal: "Add new contractor")
- **Color Usage**:
  - Yellow warning background
  - Teal button
- **Typography**: Warning message clearly states requirement
- **Notable UX Patterns**:
  - Clear blocker communication
  - Direct action to resolve

---

### Screenshot 153 - Pay Non-US Contractors
- **Page/Screen Type**: List view with promotion banner
- **Layout Pattern**: Promotion banner + data table
- **Components Used**:
  - Promotion card (red calendar icon)
  - CTA button (teal outline: "Set up new automated payment")
  - Section header "Set up automated payment"
  - Search input
  - Data table with selection checkbox
  - Pagination (Items per page dropdown)
  - New payment button (teal)
- **Color Usage**:
  - Red promotion icon
  - Teal buttons
- **Typography**: Clear section headers
- **Notable UX Patterns**:
  - Feature promotion inline
  - Easy setup flow access

---

### Screenshot 154 - Automated Payment Setup (Step 1 - Select Contractors)
- **Page/Screen Type**: Multi-step form with data selection
- **Layout Pattern**: Breadcrumb + form with table
- **Components Used**:
  - Breadcrumb navigation
  - Progress indicator (Step 1 of 4)
  - Search input with placeholder
  - "Select all" checkbox
  - Data table with sortable columns
  - Filter and Columns buttons
  - Pagination
  - Button pair (Back / Save and continue)
- **Color Usage**: Teal primary button
- **Typography**: Clear step indication
- **Notable UX Patterns**:
  - Bulk selection capability
  - Progress indication

---

### Screenshot 155 - Automated Payment Setup (Selection Made)
- **Page/Screen Type**: Same with selection state
- **Layout Pattern**: Same as 154
- **Components Used**:
  - Selected row with teal checkbox
  - "1 Selected" indicator
- **Color Usage**: Teal selected checkbox
- **Notable UX Patterns**: Selection count feedback

---

### Screenshot 156 - Automated Payment Setup (Step 2 - Schedule Details)
- **Page/Screen Type**: Form for schedule configuration
- **Layout Pattern**: Form with labeled inputs
- **Components Used**:
  - Section header with description
  - Optional field (Automated payment nickname)
  - Dropdown (Payment frequency)
  - Date input (First debit date) with calendar picker
  - Button pair (Back / Save and continue)
- **Color Usage**: Teal primary button
- **Typography**: Clear field labels with helper text
- **Notable UX Patterns**:
  - Optional vs required fields clearly marked
  - Helpful descriptions

---

### Screenshot 157 - Automated Payment Schedule (Frequency Selected)
- **Page/Screen Type**: Same form with selection
- **Layout Pattern**: Same as 156
- **Components Used**:
  - Dropdown showing "Monthly" selected
- **Notable UX Patterns**: Clear selection state

---

### Screenshot 158 - Date Picker Calendar
- **Page/Screen Type**: Calendar date picker overlay
- **Layout Pattern**: Dropdown calendar
- **Components Used**:
  - Month/year header with navigation arrows
  - Day grid (S M T W T F S)
  - Current day highlight (teal circle)
  - Selectable day cells
- **Color Usage**: Teal for current/selected date
- **Typography**: Day abbreviations, date numbers
- **Notable UX Patterns**:
  - Clear current date indication
  - Standard calendar navigation

---

### Screenshot 159 - Automated Payment Schedule (Date Selected)
- **Page/Screen Type**: Completed schedule form
- **Layout Pattern**: Same form layout
- **Components Used**:
  - Filled date input
  - "Preview debit schedule" link
- **Notable UX Patterns**:
  - Preview before committing
  - Clear date formatting

---

### Screenshot 160 - Identity Verification Modal
- **Page/Screen Type**: Security verification modal
- **Layout Pattern**: Centered modal overlay
- **Components Used**:
  - Modal title "Confirm your identity"
  - Explanatory text
  - Code input field (masked)
  - "Need a new code?" section with alternatives
  - Button options (Send message / Call me - outline)
  - Primary CTA (Continue - teal)
- **Color Usage**:
  - Teal primary button
  - Outline secondary buttons
- **Typography**: Clear instructions
- **Notable UX Patterns**:
  - Multiple verification options
  - Code delivery alternatives

---

### Screenshot 161 - Identity Verification (Code Entered)
- **Page/Screen Type**: Same modal with input
- **Layout Pattern**: Same as 160
- **Components Used**:
  - Code input with value entered
- **Notable UX Patterns**: Code input field state

---

### Screenshot 162 - Payment Details (Step 3)
- **Page/Screen Type**: Payment amount entry
- **Layout Pattern**: Form with data table
- **Components Used**:
  - Progress bar (Step 3 of 4)
  - Data table (Name, Payment type, Amount, Currency, Payment, Memo)
  - Currency input with $ symbol
  - Real-time currency conversion display
  - "Add Memo" action link
  - Info icon tooltips
  - Button pair
- **Color Usage**:
  - Teal progress bar
  - Teal edit/action links
- **Typography**: Table headers, amount formatting
- **Notable UX Patterns**:
  - Real-time conversion preview
  - Editable inline fields

---

### Screenshot 163 - Payment Details (Amount Entered)
- **Page/Screen Type**: Same with value
- **Layout Pattern**: Same as 162
- **Components Used**:
  - Amount field with $1.00 entered
  - Converted amount shown (S$1.27 SGD)
- **Notable UX Patterns**: Automatic currency conversion

---

### Screenshot 164 - Payment Details (Validation Error)
- **Page/Screen Type**: Form with validation error
- **Layout Pattern**: Same with error banner
- **Components Used**:
  - Error alert banner (red background)
  - Error icon (exclamation in circle)
  - Error message: "USD amount Payments must be at least 25 US dollars"
- **Color Usage**: Red error banner and icon
- **Notable UX Patterns**:
  - Clear validation messaging
  - Minimum amount requirement

---

### Screenshot 165 - Payment Details (Valid Amount)
- **Page/Screen Type**: Form with valid amount
- **Layout Pattern**: Same as 162
- **Components Used**:
  - Valid amount ($25.00)
  - Converted amount (S$31.67 SGD)
- **Notable UX Patterns**: No error = valid state

---

### Screenshot 166 - Add Memo Popover
- **Page/Screen Type**: Inline edit popover
- **Layout Pattern**: Popover attached to table cell
- **Components Used**:
  - Popover with title "Memo for Sam Lee"
  - Text input
  - Button pair (Cancel / Save)
- **Color Usage**:
  - White popover
  - Teal Save button
- **Typography**: Personalized title
- **Notable UX Patterns**:
  - Inline editing without modal
  - Context-aware title

---

### Screenshot 167 - Add Memo (Filled)
- **Page/Screen Type**: Same popover with input
- **Layout Pattern**: Same as 166
- **Components Used**:
  - Memo input with "Monthly Payout" entered
- **Notable UX Patterns**: Clear input preview

---

### Screenshot 168 - Payment Details (Memo Saved)
- **Page/Screen Type**: Updated table with memo
- **Layout Pattern**: Same table view
- **Components Used**:
  - Memo column showing "Edit Memo" link (indicating saved memo)
- **Notable UX Patterns**: Saved state indication via link change

---

### Screenshot 169 - Review and Submit (Step 4)
- **Page/Screen Type**: Review/confirmation screen
- **Layout Pattern**: Summary cards + data table
- **Components Used**:
  - Summary section (Total amount, Bank account, Debit date, Number of payments)
  - Data table with contractor details
  - Exchange rate note
  - Button pair (Back / Submit - teal)
- **Color Usage**: Teal submit button
- **Typography**:
  - Summary labels and values
  - Important note text
- **Notable UX Patterns**:
  - Clear summary before submission
  - Exchange rate disclaimer

---

### Screenshot 170 - Payment Confirmation
- **Page/Screen Type**: Success confirmation page
- **Layout Pattern**: Success state with summary
- **Components Used**:
  - Success message header
  - Action links (See pay history, Create another payment)
  - Illustration (person with laptop)
  - Same summary information
  - Same data table
- **Color Usage**:
  - Teal action links
  - Cheerful illustration
- **Typography**: Clear success messaging
- **Empty States**: N/A - success state illustration
- **Notable UX Patterns**:
  - Clear next actions
  - Confirmation details preserved

---

### Screenshot 171 - Pay History (With Payment In Progress)
- **Page/Screen Type**: List view with status indicators
- **Layout Pattern**: Sidebar + main content with banner
- **Components Used**:
  - Promotional banner (dismissible X)
  - Tab navigation with active "Non-US contractors" tab
  - Data table with status column
  - Status indicator: "In progress" with yellow dot
  - "Cancel payment" link
  - Search input
  - Add payment button
- **Color Usage**:
  - Yellow status dot for "In progress"
  - Teal "Add payment" button
- **Typography**: Status labels, contractor details
- **Notable UX Patterns**:
  - Clear status indication
  - Cancel action available for pending payments

---

### Screenshot 172 - Debit Schedule Modal (Calendar View)
- **Page/Screen Type**: Multi-calendar modal
- **Layout Pattern**: Modal with 4-up calendar grid
- **Components Used**:
  - 4 monthly calendars side by side
  - Date highlights (red for debit dates, teal for holidays)
  - Legend explaining date colors
  - Toggle link "List view"
  - Button (Close - teal)
- **Color Usage**:
  - Red/coral for debit dates
  - Teal for current day
  - Gray for other days
- **Typography**: Month headers, day numbers
- **Notable UX Patterns**:
  - Multi-month view for planning
  - Clear legend for date types

---

### Screenshot 173 - Debit Schedule Modal (List View)
- **Page/Screen Type**: Same modal in list format
- **Layout Pattern**: Two-column table
- **Components Used**:
  - Table with Pay period and Debit date columns
  - List of upcoming payment periods
  - Toggle link "Calendar view"
  - Button (Close - teal)
- **Typography**: Date formatting (Nov 10, 2025 - Dec 10, 2025)
- **Notable UX Patterns**:
  - Alternative view for different preferences
  - Clear date range formatting

---

### Screenshot 174 - Cancel Payment Confirmation Modal
- **Page/Screen Type**: Destructive action confirmation modal
- **Layout Pattern**: Centered confirmation modal
- **Components Used**:
  - Warning message explaining consequences
  - Button pair (Close / Cancel payment - red)
- **Color Usage**:
  - Red destructive button
  - Warning text
- **Typography**: Clear consequence explanation
- **Notable UX Patterns**:
  - Destructive action confirmation
  - Red color for dangerous action

---

### Screenshot 175 - Canceled Payment Info Modal
- **Page/Screen Type**: Informational modal
- **Layout Pattern**: Centered info modal
- **Components Used**:
  - Title "Canceled payment"
  - Explanation sections (What happened?, Why did this happen?)
  - Close button (teal outline)
- **Typography**: Clear Q&A format
- **Notable UX Patterns**:
  - Educational content about status
  - Clear explanation structure

---

### Screenshot 176 - Pay History (Canceled Status with Toast)
- **Page/Screen Type**: List view with success feedback
- **Layout Pattern**: Same as 171 with toast
- **Components Used**:
  - Status showing "Canceled" with "See Details" link
  - Success toast at bottom: "Dec 17, 2025 contractor payment successfully canceled"
- **Color Usage**:
  - Teal success toast
  - Gray canceled status
- **Notable UX Patterns**:
  - Clear status change confirmation
  - Details link for more info

---

### Screenshot 177 - Pay History (Canceled Status)
- **Page/Screen Type**: List view showing canceled payment
- **Layout Pattern**: Same table view
- **Components Used**:
  - Canceled status indicator
  - "See Details" action link
- **Notable UX Patterns**: Clickable status for details

---

### Screenshot 178 - Reports Landing Page
- **Page/Screen Type**: Feature landing with categories
- **Layout Pattern**: Banner + cards + list
- **Components Used**:
  - Tab navigation (New reports / Report history)
  - Feature promotion banner (dismissible)
  - Recommended reports cards with icons
  - Reports library search
  - Category list with links
  - "New custom report" button (teal)
  - Filter button
- **Color Usage**:
  - Teal buttons and links
  - Yellow/warm banner
- **Typography**:
  - Card headers
  - Category text
- **Notable UX Patterns**:
  - Curated recommendations
  - Search + browse discovery

---

### Screenshot 179 - Report History (Empty State)
- **Page/Screen Type**: Report history list with empty state
- **Layout Pattern**: Sidebar + main content with tabs
- **Components Used**:
  - Tab "Report history" active
  - Data table headers (Report title, Report type, Date, Status, Actions)
  - Empty state illustration (magnifying glass)
  - Empty state message
- **Color Usage**: Gray empty state illustration
- **Empty States**:
  - "No reports found"
  - "It looks like you haven't tried to create a report yet!"
- **Notable UX Patterns**:
  - Clear call-to-action in header remains visible
  - Friendly empty state messaging

---

### Screenshot 180 (179 continued) - Report History (With Data)
- **Page/Screen Type**: Report history with generated reports
- **Layout Pattern**: Data table with entries
- **Components Used**:
  - Report rows with download links
  - Status badges ("Complete" - teal pill)
  - Three-dot action menu
  - Pagination controls
- **Color Usage**: Teal Complete status badge
- **Typography**: Report titles as links
- **Notable UX Patterns**:
  - Download links inline
  - Status badges for quick scanning

---

## Summary of Unique Patterns Found

### Layout Patterns
1. **Sidebar + Main Content**: Persistent dark sidebar with main content area
2. **Multi-step Wizards**: Horizontal progress stepper with step indicators (Step X of Y)
3. **Card Selection Grids**: Selectable cards for plan/package selection
4. **Two-Column Information**: Side-by-side content comparison
5. **Modal Overlays**: Centered modals for focused tasks
6. **Slide-over Panels**: Right-side panels for editing
7. **Tab Navigation**: Horizontal tabs for content categorization
8. **Breadcrumb Navigation**: Path-based navigation for deep flows

### Component Patterns
1. **Progress Steppers**: Both horizontal bar and numbered steps
2. **Data Tables**: Sortable, filterable with column controls
3. **Selection Cards**: Radio-like behavior with visual cards
4. **Form Inputs**: Text, textarea, dropdowns, date pickers
5. **Radio/Checkbox Groups**: Clear selection states with teal accent
6. **Alert Banners**: Yellow warnings, red errors
7. **Toast Notifications**: Bottom-positioned success/info messages
8. **Empty States**: Illustrations with helpful messaging
9. **Filter Controls**: Search, Filter, Columns buttons
10. **Pagination**: Items per page + navigation arrows
11. **Action Menus**: Three-dot overflow menus
12. **Status Badges**: Pill-shaped status indicators

### Color System
- **Primary/Action**: Teal (#0d9488 or similar)
- **Error/Destructive**: Red (#dc2626 or similar)
- **Warning**: Yellow/amber background
- **Success**: Teal with checkmark
- **Inactive/Disabled**: Gray
- **Background**: White main, dark sidebar (#1a1a2e)
- **Text**: Dark gray primary, medium gray secondary

### Typography Patterns
- **Page Headers**: Large, bold (~24px)
- **Section Headers**: Medium, semi-bold (~18px)
- **Body Text**: Regular (~14px)
- **Helper Text**: Small, gray (~12px)
- **Labels**: Medium weight, uppercase sometimes

### Empty State Patterns
- Simple line illustrations (documents, magnifying glass, payments)
- Clear primary message
- Helpful secondary text
- Often includes CTA button

### Interaction Patterns
1. **Feedback Collection**: Post-task 5-point rating surveys
2. **Confirmation Modals**: For destructive actions
3. **Inline Editing**: Popovers for quick edits
4. **Real-time Calculations**: Currency conversion preview
5. **Validation**: Inline error messages with clear requirements
6. **Multi-select**: Checkbox tables with count indicators
7. **Preview Before Commit**: Schedule previews, review screens

### Navigation Patterns
1. **Persistent Sidebar**: Always visible with icon + label
2. **Breadcrumbs**: For deep nested flows
3. **Back Arrows**: Return to previous level
4. **Tab Switching**: Content category changes
5. **Step Navigation**: Back/Continue button pairs

### Unique UX Decisions
1. **Single-field Focus**: One input per wizard step reduces cognitive load
2. **Progressive Disclosure**: Conditional fields appear based on selections
3. **Contextual Help**: Right sidebar provides statistics and guidance
4. **Template-based Flows**: Pre-filled content users can customize
5. **Alternative Views**: Calendar vs List view toggle
6. **Promotional Banners**: Feature discovery inline with workflow
7. **Legal Transparency**: Clear terms and pricing before commitment
8. **Multi-verification Options**: SMS or call for identity verification
