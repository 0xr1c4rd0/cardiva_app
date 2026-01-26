# Gusto UI/UX Analysis: Screenshots 180-239

## Executive Summary

This analysis covers 60 screenshots from Gusto's web application, focusing on:
- **Reports & Analytics** (Payroll Trends)
- **Taxes & Compliance** (Tax forms, notices, exemptions, compliance)
- **Time & Attendance** (Time off policies)
- **Documents** (Shared documents management)
- **Business Insurance** (Coverage selection)

---

## Detailed Screenshot Analysis

### Image 180: Payroll Trends Report Dashboard
- **Page Type**: Analytics/Reporting dashboard
- **Layout**: Sidebar + main content with chart area
- **Components**:
  - Line chart with monthly timeline (Jan-Dec 2026)
  - Filter toolbar: Filter, Columns, Time period, Vertical axis, Chart type, Schedule
  - Info banner with "Learn More" CTA (teal background)
  - "Save as template" and "Download" buttons (teal primary)
- **Colors**: Teal primary (#0F9D8A), white background, gray chart area
- **Typography**: Bold page title, regular body text, link-style filter options
- **Spacing**: Generous whitespace, clear visual hierarchy
- **Notable UX**: Welcome banner introduces new feature with dismissible X

### Image 181: Payroll Trends Data Table View
- **Page Type**: Data table/report
- **Layout**: Sidebar + scrollable data table
- **Components**:
  - Sortable columns with chevron indicators
  - Month-by-month data rows (Jan 2025 - Dec 2025)
  - Pagination: "100 items per page" dropdown
  - "Grand totals" summary row
- **Colors**: Alternating row colors subtle, teal accents on active filters
- **Typography**: Monospace-style for currency values, regular for labels
- **Spacing**: Compact table rows, adequate column padding
- **Notable UX**: All values $0.00 shown (new/demo account state)

### Image 182: Save Template Modal
- **Page Type**: Modal dialog
- **Layout**: Centered modal over dimmed background
- **Components**:
  - Text input with label "Template name"
  - Helper text explaining template functionality
  - Cancel (outline) and Submit (teal filled) buttons
- **Colors**: White modal, dark overlay, teal CTA
- **Typography**: Semi-bold modal title, regular body/helper text
- **Spacing**: Generous padding inside modal
- **Notable UX**: Explains where templates will appear after saving

### Image 183: Save Template Modal (Filled State)
- **Page Type**: Modal dialog (input state)
- **Layout**: Same as 182
- **Components**: Text input with "2025" entered
- **Notable UX**: Shows active input state with visible text

### Image 184: Saved Template Confirmation
- **Page Type**: Report with toast notification
- **Layout**: Sidebar + main content
- **Components**:
  - Success toast at bottom: "'2025' has been saved as a template" with teal background
  - "Update template" button replacing "Save as template"
  - Chart with data visualization
- **Colors**: Teal success toast, coral/red underline on toast
- **Typography**: Toast uses white text on teal background
- **Notable UX**: Toast notification confirms action with clear message

### Image 185: Download Dropdown Menu
- **Page Type**: Report with dropdown
- **Layout**: Dropdown menu from Download button
- **Components**:
  - Three options: CSV, PDF, Excel
  - Clean list with hover states implied
- **Colors**: White dropdown, black text
- **Typography**: Regular weight menu items
- **Notable UX**: Multiple export formats for flexibility

### Image 186: Report Loading State
- **Page Type**: Report with loading indicator
- **Layout**: Centered loading animation
- **Components**:
  - Animated illustration: colorful shapes (red diamonds, teal squares, yellow circles) in a pattern
  - Text: "We're putting your report together"
- **Colors**: Brand colors in loading animation (teal, coral, yellow)
- **Typography**: Friendly, conversational loading message
- **Empty States**: Playful animated loading indicator
- **Notable UX**: Branded loading animation maintains engagement

### Image 187: Download Complete Toast
- **Page Type**: Report with success toast
- **Layout**: Sidebar + main content
- **Components**:
  - Toast: "Your report was downloaded and saved to your device"
  - Secondary action: "Make this report often? Try saving it as a template"
- **Colors**: Teal toast background
- **Notable UX**: Suggests template creation after download - smart upsell

### Image 188: Taxes & Compliance Hub
- **Page Type**: Landing/hub page
- **Layout**: Two-column card layout
- **Components**:
  - Quick links section with icon cards (Register with state, Report a notice, View tax forms, Tax exemptions)
  - Important dates sidebar showing upcoming deadlines
  - Compliance section with R&D tax credit card
  - "View details" links
- **Colors**: Teal accents, icons with teal/coral colors
- **Typography**: Section headers bold, dates in gray
- **Spacing**: Card-based layout with generous margins
- **Notable UX**: Proactive date reminders, quick action cards

### Image 189: Taxes & Compliance (Scrolled)
- **Page Type**: Landing page (continued)
- **Layout**: Content sections
- **Components**:
  - R&D Tax Credit card with icon
  - Harassment Prevention Training section with checkbox icon
  - "How Gusto helps you stay compliant" section with checkmark list
- **Colors**: Green checkmarks, subtle gray backgrounds
- **Typography**: Clear section headings
- **Notable UX**: Trust-building compliance automation messaging

### Image 190: Compliance Page Footer
- **Page Type**: Landing page (bottom section)
- **Layout**: Scrolled content
- **Components**:
  - Compliance training link
  - Three compliance features with checkmarks:
    - Employment taxes paid/filed
    - New hire forms sent to state
    - Harassment prevention training compliance
- **Colors**: Teal links, green checkmarks
- **Notable UX**: Footer links to help, terms, privacy

### Image 191: Report a Notice - Step 1
- **Page Type**: Multi-step form
- **Layout**: Form + contextual help sidebar
- **Components**:
  - Progress indicator: "Step 1 of 3"
  - Search input: "Which agency is the notice from?"
  - Dropdown: "What is the notice about?"
  - Continue button (teal)
  - Help card: "Have questions? We can help" with waving hand illustration
- **Colors**: Teal primary actions, white form fields
- **Typography**: Form labels above inputs, helper text below
- **Spacing**: Generous form field spacing
- **Notable UX**: Contextual help stays visible during form completion

### Image 192: Report a Notice - Agency Dropdown
- **Page Type**: Form with open dropdown
- **Layout**: Search dropdown expanded
- **Components**:
  - Searchable dropdown list
  - Agency options: IRS, Social Security, Alabama agencies, etc.
  - Alphabetical organization
- **Colors**: White dropdown, gray borders
- **Typography**: Regular weight list items
- **Notable UX**: Searchable dropdown for long lists

### Image 193: Report a Notice - Agency Selected
- **Page Type**: Form with selection
- **Layout**: Form step 1
- **Components**:
  - Selected value: "Internal Revenue Service" with X to clear
  - Dropdown still empty for notice type
- **Notable UX**: Clear selection with ability to remove

### Image 194: Report a Notice - Notice Type Selection
- **Page Type**: Form with dropdown
- **Layout**: Form step 1
- **Components**:
  - Notice type dropdown with "Missing or late payment" selected
  - Active dropdown showing selection
- **Notable UX**: Conditional logic based on agency selection

### Image 195: Report a Notice - Step 2
- **Page Type**: Multi-step form
- **Layout**: Form with multiple field types
- **Components**:
  - Progress: "Step 2 of 3"
  - Year dropdown, Timeframe dropdown
  - "I'm not sure" checkbox
  - Date picker: "When do you need to pay the agency?"
  - Currency input: "How much total money is due?"
- **Colors**: Teal progress bar
- **Typography**: Label + helper text pattern
- **Notable UX**: "I'm not sure" option reduces user friction

### Image 196: Report a Notice - Step 2 (Filled)
- **Page Type**: Multi-step form
- **Layout**: Form with selections
- **Components**:
  - Year: 2025, Timeframe: Q4, Oct 1 - Dec 31
  - Date field still empty
- **Notable UX**: Quarterly timeframe selection

### Image 197: Report a Notice - Calendar Picker
- **Page Type**: Form with date picker
- **Layout**: Calendar popover
- **Components**:
  - Month navigation (December 2025)
  - Week grid with selectable days
  - Current selection highlighted
- **Colors**: Teal for selected date, gray for navigation
- **Typography**: Calendar uses compact numerals
- **Notable UX**: Standard calendar picker pattern

### Image 198: Report a Notice - Date Selected
- **Page Type**: Form step 2
- **Layout**: Completed date selection
- **Components**:
  - Date showing: 12/3/2025
  - Currency input still at $
- **Notable UX**: US date format (MM/DD/YYYY)

### Image 199: Report a Notice - Amount Entered
- **Page Type**: Form step 2
- **Layout**: Form with all fields filled
- **Components**:
  - Amount: $2.00
  - Back and Submit buttons
- **Colors**: Teal Submit button, outline Back button
- **Notable UX**: Dual button pattern for navigation

### Image 200: Report a Notice - Step 3 (Upload)
- **Page Type**: Multi-step form final step
- **Layout**: Review + upload section
- **Components**:
  - Progress: "Step 3 of 3"
  - Success icon (teal checkmark)
  - Notice summary card with all entered details
  - Upload zone: "+ Upload" button with drag-drop hint
  - Supported formats listed
- **Colors**: Teal checkmark, dashed upload border
- **Typography**: Bold summary title, regular details
- **Notable UX**: Summary review before final submission

### Image 201: Report a Notice - Upload (Scrolled)
- **Page Type**: Form final step
- **Layout**: Upload + additional notes
- **Components**:
  - File upload area
  - Optional text area: "Any additional thoughts you'd like to share?"
  - Back and Send buttons
- **Notable UX**: Optional notes field for context

### Image 202: Report a Notice - File Uploaded
- **Page Type**: Form with attachment
- **Layout**: Upload area with file
- **Components**:
  - File attachment: "PDF File.pdf" with X to remove
  - File icon indicator
- **Notable UX**: Clear file indicator with removal option

### Image 203: Report a Notice - Success
- **Page Type**: Success/confirmation page
- **Layout**: Centered success message
- **Components**:
  - Large teal checkmark icon
  - "We got your notice!" heading
  - Next steps bullet list
  - Link: "View support tickets"
  - "Report another notice" CTA button
- **Colors**: Teal success elements
- **Typography**: Large heading, regular bullet points
- **Notable UX**: Clear next steps, easy repeat action

### Image 204: Support Tickets - Empty State
- **Page Type**: List page (empty)
- **Layout**: Sidebar + centered empty state
- **Components**:
  - Breadcrumb: Help / Support tickets
  - Tab bar: Open | Closed (underline indicator)
  - Empty state illustration: headset icon
  - Message: "You don't have any open support tickets at the moment"
  - "Contact us" CTA button
- **Colors**: Teal underline on active tab, outline button
- **Empty States**: Friendly headset illustration with helpful message
- **Notable UX**: Tabs for filtering, clear empty state guidance

### Image 205: Tax Exemption Setup - Information Screen
- **Page Type**: Informational/educational page
- **Layout**: Single column content
- **Components**:
  - Breadcrumb navigation
  - Educational content about tax exemptions
  - "What does it mean to set up a tax exemption?"
  - "How do I know if I'm exempt?"
  - CPA recommendation note
  - Cancel and "Get started" buttons
  - Directory link for finding CPA
- **Colors**: Teal CTA button
- **Typography**: Question-based headings, paragraph text
- **Notable UX**: Educational content before action reduces errors

### Image 206: Tax Exemption - Radio Selection
- **Page Type**: Form with radio buttons
- **Layout**: Single column form
- **Components**:
  - Radio button group: "Who is exempt from paying this tax?"
  - Options: "My company" / "My employee"
  - Helper text with link
- **Colors**: Teal radio button fill when selected
- **Typography**: Bold question, regular options
- **Notable UX**: Binary choice with clear explanations

### Image 207: Tax Exemption - Follow-up Options
- **Page Type**: Conditional form
- **Layout**: Expanded options
- **Components**:
  - Selected: "My company is exempt"
  - Follow-up: "What type of tax is ___ exempt from paying?"
  - Radio options: Federal tax / State tax
- **Notable UX**: Progressive disclosure of relevant options

### Image 208: Tax Exemption - Error State
- **Page Type**: Form with inline error
- **Layout**: Form with warning banner
- **Components**:
  - Warning banner (yellow/amber background)
  - Triangle warning icon
  - Message: "You cannot setup a state tax exemption for your company at this time"
  - Action link: "register with your state agency"
- **Colors**: Amber/yellow warning background
- **Typography**: Warning text with actionable link
- **Notable UX**: Explains why action can't proceed, offers alternative

### Image 209: Tax Exemptions - Empty List
- **Page Type**: List page (empty)
- **Layout**: Table structure with empty state
- **Components**:
  - "Add exemption" button (teal)
  - Search input with placeholder
  - Filter link
  - Table headers: Jurisdiction, Type, Applicable to, Tax, Status
  - Empty state: magnifying glass illustration + "You have not set up any tax exemptions"
- **Empty States**: Search icon illustration, instructional message
- **Notable UX**: Table ready for data with search capability

### Image 210: R&D Tax Credit - Marketing Page
- **Page Type**: Marketing/information page
- **Layout**: Two-column: content + illustration
- **Components**:
  - Back link "All tax credits"
  - Large heading
  - Value proposition: "$30,000 average credits"
  - Dual CTAs: "Get instant estimate" (outline) + "Get started for free" (teal)
  - Decorative illustration with calculator and numbers
- **Colors**: Teal CTAs, playful illustration colors
- **Typography**: Large heading, marketing copy
- **Notable UX**: Clear value proposition, multiple entry points

### Image 211: R&D Tax Credit - Qualification Quiz
- **Page Type**: Quiz/questionnaire
- **Layout**: Checklist + sidebar
- **Components**:
  - "See if you qualify" heading
  - Checkbox list of company activities
  - Illustration maintained on right
  - "Already claimed R&D tax credits?" card with link
- **Colors**: Empty checkboxes, teal links
- **Typography**: Question heading, checkbox labels
- **Notable UX**: Self-qualification quiz pattern

### Image 212: R&D Quiz - Selection Made
- **Page Type**: Quiz with selection
- **Layout**: Same as 211
- **Components**:
  - "Other" option selected (filled checkbox)
  - Follow-up question appears: "Have you applied or been granted a patent?"
  - Yes/No radio buttons
- **Notable UX**: Conditional questions based on selections

### Image 213: R&D Quiz - Multiple Questions
- **Page Type**: Quiz (expanded)
- **Layout**: Growing questionnaire
- **Components**:
  - More follow-up questions appearing
  - "Do you get paid by another company or government agency?"
  - Progressive form expansion
- **Notable UX**: Branching logic reveals relevant questions

### Image 214: R&D Quiz - Additional Questions
- **Page Type**: Quiz (continued)
- **Layout**: Scrolled content
- **Components**:
  - "Do you own the intellectual property rights of the work?"
  - Yes/No options
- **Notable UX**: IP ownership question for qualification

### Image 215: R&D Quiz - Disqualification Message
- **Page Type**: Quiz result (negative)
- **Layout**: Form with inline warning
- **Components**:
  - Warning banner: "It looks like you don't qualify at this time"
  - Explanation of IRS requirements
  - Link: "specific requirements"
- **Colors**: Amber/yellow warning
- **Typography**: Clear explanation of disqualification reason
- **Notable UX**: Honest about disqualification, explains why

### Image 216: Stay Compliant Dashboard
- **Page Type**: Compliance checklist page
- **Layout**: List of compliance items
- **Components**:
  - Section: "Labor Law Posters" with View link
  - Section: "Requirements automated by Gusto"
  - Checklist items with checkmark icons:
    - Workers' Compensation Insurance
    - Employment Tax Reporting & Payment
    - New Hire Reports
- **Colors**: Green/teal checkmarks, "View" links in teal
- **Typography**: Section headings, compliance item descriptions
- **Notable UX**: Automation messaging builds confidence

### Image 217: Labor Law Posters - Upsell Page
- **Page Type**: Product/feature marketing page
- **Layout**: Hero + pricing cards
- **Components**:
  - Illustrated hero showing people with posters
  - Value proposition heading
  - Three pricing tiers:
    - Workplace posters only: $15/mo
    - Hybrid teams poster bundle: $25/mo
    - Remote posters only: $12/mo
  - Each card: icon, price, description, CTA
- **Colors**: Teal CTAs, illustrated hero
- **Typography**: Large hero text, pricing in cards
- **Notable UX**: Clear pricing comparison, benefit-focused copy

### Image 218: Labor Law Posters (Scrolled)
- **Page Type**: Product page (continued)
- **Layout**: Location table + FAQ
- **Components**:
  - "Your employee locations" table
  - Columns: Location, Poster subscription, Quantity, Actions
  - Status indicators: "Not active"
  - FAQ section: "Questions? Meet answers" with accordions
- **Colors**: Coral/red status for inactive
- **Typography**: Table headers, accordion questions
- **Notable UX**: Accordion FAQ pattern saves space

### Image 219: Business Insurance Hub
- **Page Type**: Product selection page
- **Layout**: Card-based layout
- **Components**:
  - Three insurance type cards:
    - General liability (building icon)
    - Workers' compensation (medical icon)
    - Business owner policy (building icon)
  - "What it covers" preview text
  - "Get a free quote" CTAs
  - Current policies section (empty)
  - Shortcuts sidebar
- **Colors**: Teal icons, outline CTAs
- **Typography**: Card titles, brief descriptions
- **Spacing**: Equal card sizing, generous padding
- **Notable UX**: Clear product comparison, easy quote start

### Image 220: Insurance FAQ Section
- **Page Type**: FAQ/Q&A section
- **Layout**: Accordion list
- **Components**:
  - "Still have questions?" heading
  - Expandable questions about insurance
  - Testimonials: "What customers say about our partner NEXT Insurance"
  - 3-column testimonial cards
  - Star ratings and quotes
- **Colors**: Teal links in accordions
- **Typography**: Question format headings, quote text
- **Notable UX**: Social proof with testimonials

### Image 221: Time Off Policies Page
- **Page Type**: Policy management page
- **Layout**: Feature banner + policy list
- **Components**:
  - Info banner about enabling time tracking in settings
  - Upsell card: "Create special time off policies and get advanced time tools"
  - "Upgrade plan" CTA
  - Empty state: "No time off policies have been added"
  - "Add policy" button
  - Suggested policies section
- **Colors**: Teal banners and CTAs
- **Typography**: Banner headers, descriptive text
- **Notable UX**: Feature upsell integrated naturally

### Image 222: Time Off Policies (With Policy)
- **Page Type**: Policy list page
- **Layout**: Policy cards
- **Components**:
  - "Paid Time Off" section
  - Policy card: "Paid Time Off (PTO)" with enrollment count
  - Suggested policies card: "Sick" leave recommendation
- **Colors**: Teal section indicators
- **Notable UX**: Suggestions based on state requirements

### Image 223: Add Time Off Policy Modal
- **Page Type**: Modal dialog
- **Layout**: Centered modal
- **Components**:
  - "Add a time off policy" title
  - Dropdown: "Policy type" with placeholder
  - Cancel and Continue buttons
- **Colors**: Teal Continue button
- **Notable UX**: Simple policy type selection to start

### Image 224: Add Policy Modal (Dropdown Open)
- **Page Type**: Modal with dropdown
- **Layout**: Modal with expanded select
- **Components**:
  - Selected: "Paid Time Off"
  - Info tooltip explaining PTO vs sick time
- **Colors**: Standard dropdown styling
- **Notable UX**: Contextual help explains options

### Image 225: Create PTO Policy - Step 1 Details
- **Page Type**: Multi-step form wizard
- **Layout**: Stepper + form fields
- **Components**:
  - 5-step progress bar: Policy Details, Settings, Milestones, Add Employees, Starting Balances
  - Calendar icon illustration
  - Form fields: Policy name, Description (optional)
  - Radio: "Is there a limit to how much time employees can take off?"
- **Colors**: Coral/red progress indicator, teal save button
- **Typography**: Step labels, form labels
- **Spacing**: Clear step separation
- **Notable UX**: Visual progress indicator shows 5 steps

### Image 226: Create PTO Policy - Details Filled
- **Page Type**: Multi-step form
- **Layout**: Wizard step 1
- **Components**:
  - Filled policy name: "Paid Time Off (PTO)"
  - Description with helpful example text
  - Radio selection for unlimited vs limited
- **Notable UX**: Pre-filled suggestions speed completion

### Image 227: Create PTO Policy - Accrual Details
- **Page Type**: Multi-step form (settings)
- **Layout**: Form with multiple field groups
- **Components**:
  - "Yes, there's a limit" selected
  - Accrual method radio buttons: Fixed amount vs Based on hours worked
  - "Total hours per year" input
  - "Accrual rate" dropdown
  - "When does the accrual period reset?" with radio options
- **Colors**: Active radio in teal
- **Typography**: Field groupings with section labels
- **Notable UX**: Complex policy rules broken into digestible sections

### Image 228: Create PTO Policy - Hours Configured
- **Page Type**: Multi-step form (settings continued)
- **Layout**: Scrolled form content
- **Components**:
  - Total hours: 160 hours
  - Accrual rate: "Throughout the year at each pay period"
  - Reset options: anniversary date vs same date for all
- **Notable UX**: Real-time configuration options

### Image 229: Create PTO Policy - Warning Banner
- **Page Type**: Multi-step form with warning
- **Layout**: Form with inline alert
- **Components**:
  - Warning banner: "You may need to adjust balances for some employees"
  - Explanation of policy change implications
  - Cancel and "Save & continue" buttons
- **Colors**: Amber/yellow warning banner
- **Typography**: Warning explanation text
- **Notable UX**: Proactive warning about employee impact

### Image 230: Create PTO Policy - Step 2 Settings
- **Page Type**: Multi-step form step 2
- **Layout**: Settings configuration
- **Components**:
  - Progress: step 2 highlighted
  - "Waiting periods" section
  - Radio: immediate accrual vs waiting period
  - "Time off balance" sections
  - Input fields with "hours" suffix
- **Typography**: Clear section headings
- **Notable UX**: Settings logically grouped

### Image 231: Create PTO Policy - Balance Settings
- **Page Type**: Multi-step form (settings continued)
- **Layout**: Scrolled settings
- **Components**:
  - Max hours accrued: 160 hours
  - Max time off balance: 160 hours
  - Carryover section with limit options
  - Payout on dismissal radio buttons
- **Notable UX**: Configurable carryover and payout rules

### Image 232: Create PTO Policy - Payout Options
- **Page Type**: Multi-step form
- **Layout**: Final settings section
- **Components**:
  - Carryover limit options (Yes/No)
  - "Payout on dismissal" section
  - State-specific requirements link
  - Yes/No radio for dismissal payout
- **Colors**: Teal links for regulatory info
- **Notable UX**: Compliance guidance integrated

### Image 233: Create PTO Policy - Step 3 Milestones
- **Page Type**: Multi-step form step 3
- **Layout**: Table-based configuration
- **Components**:
  - Progress: step 3 highlighted
  - "Milestones" explanation
  - "+ Add another milestone" link
  - Table: Milestone, Total hours per year, Max accrued hours
  - Base rate row showing 160/160
- **Colors**: Teal add link
- **Typography**: Table headers, milestone descriptions
- **Notable UX**: Tenure-based benefits configuration

### Image 234: Create PTO Policy - Step 4 Add Employees
- **Page Type**: Multi-step form step 4
- **Layout**: Employee selection panel
- **Components**:
  - Progress: step 4 highlighted
  - Calendar icon
  - Question: "Which employees do you want to enroll?"
  - Two-column layout: employee list | selected panel
  - Search input for employee names
  - Info banner about balance adjustments
- **Empty States**: "No employees added" in selection panel
- **Notable UX**: Transfer list pattern for employee assignment

### Image 235: Add Employees - Empty State
- **Page Type**: Multi-step form (employee selection)
- **Layout**: Compact view
- **Components**:
  - Search field visible
  - Empty state in selection area
  - Warning about balance adjustments
- **Notable UX**: Persistent warning about impact

### Image 236: Create PTO Policy - Step 5 Starting Balances
- **Page Type**: Multi-step form final step
- **Layout**: Review/configuration
- **Components**:
  - Progress: step 5 highlighted
  - "Starting Balances" heading
  - Explanation about existing balances
  - Empty state: no employees added
  - Back and "Create Policy" buttons
- **Colors**: Teal Create Policy CTA
- **Notable UX**: Final review before creation

### Image 237: Create PTO Policy - Success State
- **Page Type**: Success confirmation
- **Layout**: Centered success message
- **Components**:
  - Thumbs up illustration (hand-drawn style)
  - "Alright! Your policy is now active."
  - Helpful next step text
  - "View Policy" outline button
- **Colors**: Teal link text
- **Empty States**: Celebratory illustration
- **Notable UX**: Warm, friendly success message

### Image 238: Documents - Shared Documents List
- **Page Type**: Document management page
- **Layout**: Sidebar navigation + document list
- **Components**:
  - Left sidebar: Team (Shared, Templates, Bulk downloads), Company (Authorization)
  - Tab bar: Active, Draft, Archived (underline indicator)
  - Search input
  - Document list with columns: Name, Uploaded by
  - Document rows with descriptions and "Gusto" attribution
- **Colors**: Teal active tab underline
- **Typography**: Document names as links, gray descriptions
- **Notable UX**: Document categorization system

### Image 239: Documents - Draft Tab Empty State
- **Page Type**: Document list (empty filter)
- **Layout**: Same as 238
- **Components**:
  - "Draft" tab selected (red underline)
  - Empty state: magnifying glass illustration
  - "No results found" message
- **Empty States**: Simple search illustration with clear message
- **Notable UX**: Consistent empty state pattern

---

## Summary of Unique UI Patterns Identified

### Navigation Patterns
1. **Left sidebar navigation** - Persistent, collapsible, with icons and text labels
2. **Breadcrumb trails** - Used for deep navigation (e.g., "Taxes & Compliance / Tax exemptions")
3. **Tab bars with underline indicator** - Active state shown with colored underline (teal or coral)
4. **Step progress indicators** - Numbered steps with visual progress bar (1-5 steps common)

### Form Patterns
1. **Multi-step wizards** - Complex forms broken into 3-5 steps with progress bar
2. **Searchable dropdowns** - Long option lists with search capability
3. **Progressive disclosure** - Conditional questions appear based on previous answers
4. **Inline validation/warnings** - Yellow/amber banners with explanatory text
5. **Radio button groups** - Binary choices with clear labels
6. **Date pickers** - Standard calendar popover
7. **Currency inputs** - Dollar prefix, numeric entry

### Feedback Patterns
1. **Toast notifications** - Bottom-positioned, teal background for success
2. **Success pages** - Centered illustration + heading + next steps
3. **Warning banners** - Yellow/amber background, triangle icon
4. **Loading states** - Animated branded illustrations with friendly messaging

### Empty State Patterns
1. **Illustration + message + CTA** - Consistent empty state formula
2. **Headset icon** - Support tickets
3. **Magnifying glass** - No search results / no data
4. **Helpful suggestions** - "Once you add X, it will appear here"

### Card Patterns
1. **Feature cards** - Icon + title + description + CTA
2. **Pricing cards** - Icon + price + features + CTA
3. **Quick action cards** - Icon + title (clickable)
4. **Testimonial cards** - Quote + attribution + rating

### Modal Patterns
1. **Centered modals** - Dark overlay, white card
2. **Simple forms** - Single field modals for quick input
3. **Confirmation dialogs** - Explain action + dual buttons

### Table Patterns
1. **Sortable columns** - Chevron indicators
2. **Pagination** - Items per page dropdown
3. **Summary rows** - "Grand totals" at bottom
4. **Status columns** - Color-coded status indicators

### Color System
- **Primary**: Teal (#0F9D8A) - CTAs, active states, success
- **Secondary**: Coral/Red - Progress indicators, warnings
- **Warning**: Amber/Yellow - Alert banners
- **Neutral**: Grays for text, borders, backgrounds
- **Success**: Green checkmarks for completed items

### Typography System
- **Page titles**: Large, bold, black
- **Section headings**: Medium, semi-bold
- **Body text**: Regular weight, dark gray
- **Helper text**: Small, lighter gray
- **Links**: Teal color, underlined on hover
- **Currency values**: Aligned right, consistent formatting

### Spacing & Layout
- **Generous whitespace** - Breathable layouts
- **Card-based sections** - Content grouped in cards
- **Two-column layouts** - Form + contextual help sidebar
- **Consistent margins** - ~24px standard spacing

### Unique UX Decisions
1. **Contextual help cards** - FAQ/help cards persistent during form completion
2. **Feature upsells** - Naturally integrated upgrade prompts
3. **Compliance automation messaging** - Trust-building automated task lists
4. **Educational pre-screens** - Explain implications before complex actions
5. **Friendly copy** - Conversational tone ("We got your notice!", "Alright!")
6. **Smart suggestions** - Template recommendations after actions
7. **State-specific guidance** - Links to regulatory requirements

---

## Recommendations for Cardiva Application

Based on this Gusto analysis, consider implementing:

1. **Multi-step form wizards** for complex RFP uploads with visual progress
2. **Contextual help sidebars** during match review workflows
3. **Toast notifications** for upload confirmations and export completions
4. **Empty state illustrations** with actionable guidance
5. **Consistent card-based layouts** for match suggestions
6. **Warning banners** for low-confidence matches or missing data
7. **Loading animations** with friendly messaging during AI processing
8. **Breadcrumb navigation** for deep drill-downs into RFP details
