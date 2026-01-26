# Gusto UI/UX Analysis - Screenshots 60-119

## Overview

This analysis covers 60 screenshots from Gusto's web application, focusing on people management, hiring, onboarding, learning, and document signing workflows.

---

## Individual Screenshot Analysis

### Image 60 - Contractor Agreement Review & Next Steps
- **Page/Screen Type**: Multi-step form completion - final review step
- **Layout Pattern**: Sidebar navigation + centered main content with cards
- **Components Used**:
  - Info cards with "Edit" links (Payment, Contractor Agreement)
  - Vertical timeline/stepper with checkmarks
  - Primary CTA button "Send agreement to Sam"
  - Secondary outline button "Go back"
  - Text link "Save and exit"
- **Color Usage**: Teal primary for filled checkmarks, coral/salmon for CTA buttons
- **Typography**: Bold section headers, regular body text, teal links
- **Spacing & Whitespace**: Generous padding in cards, clear visual hierarchy
- **Notable UX Patterns**:
  - "Here's what happens next" timeline explaining upcoming steps
  - Editable summary cards before final action
  - Triple-action footer (back, primary action, save & exit)

---

### Image 61 - People List - Onboarding Tab
- **Page/Screen Type**: Data table/list view with tabs
- **Layout Pattern**: Sidebar + main content with tabbed navigation
- **Components Used**:
  - Horizontal tabs (Active, Onboarding, Offboarding, Dismissed, Collaborators)
  - Search input with placeholder text
  - Data table with sortable columns
  - Status indicator (orange dot = "Pending offer")
  - Action links ("View checklist", "Send reminder")
  - Split dropdown button "Add person"
- **Color Usage**: Orange for pending status, teal for links and active elements
- **Typography**: Table headers in gray, body content in black
- **Spacing & Whitespace**: Clean table with adequate row padding
- **Notable UX Patterns**:
  - Tab-based filtering for people status
  - Contextual actions per row
  - "More" dropdown for additional actions

---

### Image 62 - Add a Person Form - Contractor Role (Collapsed)
- **Page/Screen Type**: Multi-step form wizard
- **Layout Pattern**: Sidebar + centered form with step indicator
- **Components Used**:
  - Progress indicator "Step 2 of 5"
  - Dropdown selects (Work location, State)
  - Text input with helper text
  - Expandable/collapsible sections
  - "Create a new job title" dropdown option
  - Link to create department
- **Color Usage**: Teal for active/selected elements, gray for helper text
- **Typography**: Form labels in bold, helper text smaller and gray
- **Spacing & Whitespace**: Comfortable form field spacing
- **Notable UX Patterns**:
  - Inline creation option for job titles
  - Step-by-step wizard with clear progress

---

### Image 63 - Add a Person Form - Job Title Selection
- **Page/Screen Type**: Multi-step form with dropdown expanded
- **Layout Pattern**: Same as 62
- **Components Used**:
  - Active dropdown showing "Create a new job title" option
  - Conditional field reveal based on selection
- **Notable UX Patterns**:
  - Inline entity creation without leaving the flow
  - Clear labeling of optional fields

---

### Image 64 - Add a Person Form - New Job Title Entered
- **Page/Screen Type**: Multi-step form with conditional field
- **Layout Pattern**: Same as 62-63
- **Components Used**:
  - Text input for new job title ("Product Designer")
  - Department dropdown
  - Manager search field
- **Notable UX Patterns**:
  - Conditional fields appear based on prior selection
  - Manager assignment with org chart visibility explanation

---

### Image 65 - Add a Person Form - Scrolled Down
- **Page/Screen Type**: Multi-step form - lower section visible
- **Layout Pattern**: Sidebar + form content
- **Components Used**:
  - "Create department" expandable link
  - Manager search with helper text
  - Date picker for contract start date
  - Button group: "Go back" (outline), "Save and continue" (filled)
  - "Save and exit" text link
- **Color Usage**: Teal for primary buttons and links
- **Typography**: Helper text explains manager visibility in org chart
- **Notable UX Patterns**:
  - Triple-action navigation pattern
  - "Learn more" external links for context

---

### Image 66 - Create Department Modal (Empty)
- **Page/Screen Type**: Modal dialog overlay
- **Layout Pattern**: Centered modal over dimmed background
- **Components Used**:
  - Modal with close X button
  - Single text input for "Name"
  - Button pair: "Cancel" (outline), "Save" (filled teal)
- **Color Usage**: White modal, teal primary button
- **Typography**: Bold modal title, standard label
- **Spacing & Whitespace**: Simple, focused modal with minimal content
- **Notable UX Patterns**:
  - Minimal modal for quick entity creation
  - Clear Cancel/Save actions

---

### Image 67 - Create Department Modal (Filled)
- **Page/Screen Type**: Modal dialog with input
- **Layout Pattern**: Same as 66
- **Components Used**:
  - Text input with value "Product"
  - Same button pattern
- **Notable UX Patterns**:
  - Inline validation implied (no error states shown)

---

### Image 68 - Department Created - Success Toast
- **Page/Screen Type**: Form with success notification
- **Layout Pattern**: Main form with toast overlay
- **Components Used**:
  - Toast notification at bottom-left
  - Green checkmark icon
  - "Department created" message
  - Dismiss X button
- **Color Usage**: Green for success, teal for selected dropdown value
- **Typography**: Toast message in regular weight
- **Notable UX Patterns**:
  - Non-blocking success toast
  - Auto-selection of newly created entity

---

### Image 69 - Sign Documents - Signatory Assignment
- **Page/Screen Type**: Document signing wizard
- **Layout Pattern**: Back arrow + sidebar steps + centered content
- **Components Used**:
  - Step list with radio indicators (Signatory, Sign all forms)
  - Radio button group (Yes/No options)
  - "FAQs" button top-right
  - Single "Continue" CTA button
- **Color Usage**: Teal for active radio buttons
- **Typography**: Clear question heading, descriptive paragraph
- **Spacing & Whitespace**: Very generous, focused on single decision
- **Notable UX Patterns**:
  - Split document signing into clear steps
  - Help available via FAQs button

---

### Image 70 - Sign Documents - Signatory Details Form (Collapsed)
- **Page/Screen Type**: Form for personal information
- **Layout Pattern**: Step sidebar + form fields
- **Components Used**:
  - Two-column layout for name fields
  - "Middle initial" marked as optional
  - Title dropdown
  - Helper text explaining government ID requirements
- **Notable UX Patterns**:
  - Progressive disclosure of form sections
  - Clear explanation of data usage (IRS Form 8655)

---

### Image 71 - Signatory Personal Details - Full Form
- **Page/Screen Type**: Extended personal information form
- **Layout Pattern**: Single-column form with sections
- **Components Used**:
  - Name fields (First, Last, Middle initial)
  - Title dropdown with "Select..." placeholder
  - Birthday date picker (mm/dd/yyyy format)
  - Phone number with formatting mask
  - SSN field with mask
  - Checkbox "I don't have a Social Security number"
  - Section divider for address
- **Color Usage**: Standard form styling, teal for active elements
- **Typography**: Section headers ("Signatory home address") for grouping
- **Notable UX Patterns**:
  - Checkbox to skip SSN accommodates international workers
  - Masked input for sensitive data

---

### Image 72 - Upload Documents for Identity Verification
- **Page/Screen Type**: Document upload page
- **Layout Pattern**: Step sidebar + upload zones
- **Components Used**:
  - Checked checkbox at top
  - Two file upload dropzones
  - "Select File" links with drag-drop instructions
  - Numbered instructions list
  - Link to download pre-filled form
- **Color Usage**: Dashed border for dropzones, teal links
- **Typography**: Numbered list for clear instructions
- **Spacing & Whitespace**: Clear separation between upload areas
- **Notable UX Patterns**:
  - Pre-filled form download to reduce user effort
  - Drag-and-drop plus click-to-upload flexibility

---

### Image 73 - Sign Company Documents - List View
- **Page/Screen Type**: Document signing checklist
- **Layout Pattern**: Step sidebar + document table
- **Components Used**:
  - Data table with Name, Description, Status, Actions columns
  - Document icon indicators
  - "Sign form" buttons (outline style)
  - Kebab menu for additional actions
  - Button pair: "Back", "Continue"
- **Color Usage**: Teal for sign form buttons
- **Typography**: Document names as links
- **Notable UX Patterns**:
  - Clear document purpose in description
  - Inline signing without page navigation

---

### Image 74 - Sign Company Documents - Error State
- **Page/Screen Type**: Same as 73 with validation error
- **Layout Pattern**: Same with error indicator
- **Components Used**:
  - Red error icon with message "Sign company documents"
- **Color Usage**: Red/coral for error state
- **Notable UX Patterns**:
  - Inline error messaging before allowing continue

---

### Image 75 - Sign Form Modal (Empty)
- **Page/Screen Type**: E-signature modal
- **Layout Pattern**: Centered modal
- **Components Used**:
  - Modal with document title and icon
  - Signature text input
  - Checkbox for consent "I agree to electronically sign this form"
  - Button pair: "Cancel", "Sign"
- **Color Usage**: Teal for Sign button
- **Typography**: Instruction text for signature field
- **Spacing & Whitespace**: Focused modal layout
- **Notable UX Patterns**:
  - Type-to-sign approach
  - Explicit consent checkbox

---

### Image 76 - Sign Form Modal (Signed)
- **Page/Screen Type**: E-signature modal with signature
- **Layout Pattern**: Same as 75
- **Components Used**:
  - Signature rendered in cursive/script font style
  - Checked consent checkbox
- **Color Usage**: Signature appears in handwriting-style font
- **Typography**: Script font for signature ("Sam Lee")
- **Notable UX Patterns**:
  - Visual transformation of typed name to signature style
  - Sign button enabled after consent

---

### Image 77 - People List - Active Tab (Single Person)
- **Page/Screen Type**: Employee list view
- **Layout Pattern**: Sidebar + tabbed content + data table
- **Components Used**:
  - "Select all" checkbox with count
  - Filter button
  - Avatar icons for people
  - Sortable column headers
  - Links for Name, Department, Job title
- **Color Usage**: Teal for all interactive links
- **Typography**: Standard table typography
- **Notable UX Patterns**:
  - Bulk selection with count indicator
  - All key fields are clickable/linked

---

### Image 78 - People List - Multiple People
- **Page/Screen Type**: Extended employee list
- **Layout Pattern**: Same as 77
- **Components Used**:
  - Country column added
  - Multiple employee rows
  - "Refer & earn" navigation item visible
- **Notable UX Patterns**:
  - Table adapts to show relevant columns
  - International employee support (Country column)

---

### Image 79 - People List - Onboarding Status
- **Page/Screen Type**: Onboarding tracking list
- **Layout Pattern**: Same tabbed pattern
- **Components Used**:
  - Status column with colored dot indicators
  - "On track" status with teal dot
  - Progress column (showing "--")
  - Kebab menu for actions
- **Color Usage**: Teal dot for "On track" status
- **Notable UX Patterns**:
  - Clear status visualization
  - Progress tracking per employee

---

### Image 80 - Add a Person - Compensation Step
- **Page/Screen Type**: Multi-step form - compensation
- **Layout Pattern**: Sidebar + progress bar + form
- **Components Used**:
  - Visual progress bar (75% filled)
  - "Step 3 of 4" indicator
  - Radio button group for payment type
  - Triple-action footer
- **Color Usage**: Teal progress bar fill
- **Typography**: Section header "Share Sam's compensation details"
- **Notable UX Patterns**:
  - Binary choice simplifies decision
  - Visual progress reinforces position in flow

---

### Image 81 - Add a Person - Compensation Selected
- **Page/Screen Type**: Same as 80 with selection made
- **Layout Pattern**: Same
- **Components Used**:
  - Selected radio button (Fixed payment amount)
- **Notable UX Patterns**:
  - Clear visual feedback for selection

---

### Image 82 - Invite to Gusto - Method Selection
- **Page/Screen Type**: Onboarding method selection
- **Layout Pattern**: Two-card choice layout
- **Components Used**:
  - Two option cards side by side
  - "Recommended" badge on self-onboard option
  - Illustration icons in each card
  - "Continue" vs "Start" button variants
  - Step indicator "Step 1 of 3"
- **Color Usage**: Teal for badges and buttons
- **Typography**: Bold card titles, descriptive paragraphs
- **Spacing & Whitespace**: Equal-sized cards with generous internal padding
- **Notable UX Patterns**:
  - Card-based selection for major choices
  - Recommended option highlighted
  - Clear explanation of each option's implications

---

### Image 83 - Invite to Gusto - Contact Details
- **Page/Screen Type**: Contact and document configuration
- **Layout Pattern**: Form with expandable sections
- **Components Used**:
  - Text input for email
  - Expandable document section
  - Checkbox list for documents to send
  - "Edit" link for configuration
  - New hire report checkbox
- **Notable UX Patterns**:
  - Sensible defaults with edit option
  - Compliance checkbox (new hire report)

---

### Image 84 - Invite to Gusto - Timeline Preview
- **Page/Screen Type**: Onboarding timeline confirmation
- **Layout Pattern**: Vertical timeline + info card
- **Components Used**:
  - Vertical timeline with icons and dates
  - Completed steps (checkmarks)
  - Pending steps (empty circles)
  - Info card with contextual tip
  - Dual CTAs: "I've added all current team members" + "Add another team member"
- **Color Usage**: Teal for completed checks, gray for pending
- **Typography**: Timeline step titles in bold
- **Spacing & Whitespace**: Clear timeline visual hierarchy
- **Notable UX Patterns**:
  - Shows user what happens after they complete action
  - Batch action option (add more team members)

---

### Image 85 - Identity Verification Modal (Empty Code)
- **Page/Screen Type**: Two-factor authentication modal
- **Layout Pattern**: Dark sidebar + centered modal
- **Components Used**:
  - Modal over dark background showing timeline
  - 6-digit code input
  - "Need a new code?" with "Send message" and "Call me" options
  - Continue button
- **Color Usage**: Teal buttons, dark overlay
- **Typography**: Security explanation text
- **Notable UX Patterns**:
  - Contextual 2FA during sensitive operations
  - Multiple code delivery options

---

### Image 86 - Identity Verification Modal (Code Entered)
- **Page/Screen Type**: Same with code filled
- **Layout Pattern**: Same as 85
- **Components Used**:
  - Code input showing "382179"
- **Notable UX Patterns**:
  - Single continuous input for code entry

---

### Image 87 - Bank Account Verified - Success
- **Page/Screen Type**: Success/confirmation page
- **Layout Pattern**: Sidebar + centered success message
- **Components Used**:
  - Bank icon illustration
  - "Default" badge
  - Account name and masked number
  - Green checkmark "Connected" status
  - Single "Save and continue" CTA
- **Color Usage**: Green for connected status, teal for CTA
- **Typography**: Success headline "Done! Your bank account has been verified."
- **Spacing & Whitespace**: Celebratory, focused layout
- **Notable UX Patterns**:
  - Clear success state with next action
  - Masked sensitive account data

---

### Image 88 - People Onboarding - Invited Status
- **Page/Screen Type**: Onboarding list with invited member
- **Layout Pattern**: Standard table view
- **Components Used**:
  - Orange dot for "Invited" status
  - Updated start date
- **Color Usage**: Orange for invited/pending status
- **Notable UX Patterns**:
  - Status progression visible in list

---

### Image 89 - People List - Row Selected
- **Page/Screen Type**: List with selection state
- **Layout Pattern**: Table with selection UI
- **Components Used**:
  - Checkbox selected state
  - "1 selected" indicator
  - "Actions" dropdown button
  - Filter button
- **Color Usage**: Teal for selected state, gray background on selected row
- **Notable UX Patterns**:
  - Bulk action UI appears on selection
  - Selection count shown

---

### Image 90 - Bulk Actions Dropdown
- **Page/Screen Type**: List with actions menu open
- **Layout Pattern**: Table with dropdown menu
- **Components Used**:
  - Dropdown menu showing "Update compensations"
- **Notable UX Patterns**:
  - Contextual bulk actions based on selection

---

### Image 91 - Update Compensation - Empty State
- **Page/Screen Type**: Bulk compensation update wizard
- **Layout Pattern**: Progress bar + search + selection table
- **Components Used**:
  - Two-step progress indicator
  - Search field
  - "Select all" checkbox
  - Items per page dropdown
  - Pagination controls
  - Empty state message "No employees selected"
  - Back button
- **Color Usage**: Teal progress bar
- **Typography**: Explanatory paragraph about compensation updates
- **Spacing & Whitespace**: Clean, tool-like interface
- **Notable UX Patterns**:
  - Multi-step wizard for bulk operations
  - Clear empty state guidance

---

### Image 92 - Team Member Profile - Onboarding Checklist
- **Page/Screen Type**: Individual profile with checklist
- **Layout Pattern**: Breadcrumb + profile header + vertical checklist
- **Components Used**:
  - Breadcrumb navigation
  - Avatar with name and start date
  - Vertical checklist with completion states
  - Info banner for hire pending state
  - Links within checklist items
- **Color Usage**: Teal checkmarks for complete, gray circles for pending
- **Typography**: Bold checklist item titles, gray supporting text
- **Notable UX Patterns**:
  - Combines profile view with action items
  - Contextual info banner explains current state

---

### Image 93 - Offer Document View
- **Page/Screen Type**: Document viewer/agreement
- **Layout Pattern**: Breadcrumb + document preview
- **Components Used**:
  - Document with legal text
  - "Update offer" link
  - Scrollable document content
  - Contract sections (Agreement, Services, Term, Fees, etc.)
- **Color Usage**: Black text document, teal links
- **Typography**: Legal document formatting with numbered sections
- **Notable UX Patterns**:
  - Full document preview before signing
  - Expiration date shown

---

### Image 94 - Signed Contract Schedule
- **Page/Screen Type**: Contract schedule/attachment
- **Layout Pattern**: Document continuation
- **Components Used**:
  - Signature blocks with cursive signatures
  - Service description
  - Fee arrangement
  - "Back to offers" button
- **Color Usage**: Blue/teal for links
- **Typography**: Mix of typed and signature fonts
- **Notable UX Patterns**:
  - Both party signatures visible
  - Clear service/fee terms

---

### Image 95 - Onboarding Actions Menu
- **Page/Screen Type**: List with contextual menu
- **Layout Pattern**: Table with dropdown
- **Components Used**:
  - Kebab menu options:
    - View onboarding timeline
    - Update onboarding
    - Send reminder
    - Remove Sam (destructive)
- **Color Usage**: Red/coral for destructive action
- **Typography**: Standard menu items, red for delete
- **Notable UX Patterns**:
  - Contextual actions per row
  - Destructive action visually distinct

---

### Image 96 - Remove Team Member Modal
- **Page/Screen Type**: Destructive action confirmation
- **Layout Pattern**: Centered modal
- **Components Used**:
  - Warning text explaining consequences
  - Cancel button (outline)
  - Remove button (coral/red filled)
- **Color Usage**: Red/coral for destructive button
- **Typography**: Clear warning about file deletion
- **Spacing & Whitespace**: Focused modal content
- **Notable UX Patterns**:
  - Explicit confirmation for destructive actions
  - Clear explanation of consequences

---

### Image 97 - Remove Success - Empty State
- **Page/Screen Type**: List empty state after deletion
- **Layout Pattern**: Table with empty illustration
- **Components Used**:
  - Magnifying glass illustration
  - "No team members currently onboarding" message
  - Success toast at bottom
- **Color Usage**: Green checkmark in toast, muted illustration
- **Typography**: Centered empty state text
- **Spacing & Whitespace**: Generous centered empty state
- **Notable UX Patterns**:
  - Friendly empty state with illustration
  - Success confirmation toast

---

### Image 98 - Onboarding Timeline Actions
- **Page/Screen Type**: List with quick actions menu
- **Layout Pattern**: Table with kebab dropdown
- **Components Used**:
  - Menu with checkmark on current state
  - "Mark as complete" option
- **Notable UX Patterns**:
  - Quick status updates from list view

---

### Image 99 - Complete Onboarding Confirmation
- **Page/Screen Type**: Action confirmation modal
- **Layout Pattern**: Centered modal
- **Components Used**:
  - Warning about irreversible action
  - Cancel and "Complete onboarding" buttons
- **Color Usage**: Teal for primary action
- **Typography**: Clear explanation of consequences
- **Notable UX Patterns**:
  - Confirmation for significant status changes

---

### Image 100 - Onboarding Complete Toast
- **Page/Screen Type**: Success state with toast
- **Layout Pattern**: Empty list + success notification
- **Components Used**:
  - Same empty state illustration
  - Success toast "You finished onboarding Sam."
- **Notable UX Patterns**:
  - Clear success feedback with personalization

---

### Image 101 - Hiring Toolkit Dashboard
- **Page/Screen Type**: Feature dashboard/toolkit
- **Layout Pattern**: Card-based feature list
- **Components Used**:
  - Feature cards with icons and descriptions
  - Action buttons ("See details", "Set up your account", "Estimate a salary", "Customize templates")
  - Resource tabs (Deciding to hire, Defining the role, etc.)
  - Article cards with teal accent bar
- **Color Usage**: Teal accent bars on article cards
- **Typography**: Bold feature titles, descriptive text
- **Spacing & Whitespace**: Card-based layout with clear grouping
- **Notable UX Patterns**:
  - Tool kit approach to related features
  - Resource library with categorized tabs

---

### Image 102 - Hiring Resources & Extra Tools
- **Page/Screen Type**: Resources and upsell section
- **Layout Pattern**: Continued toolkit layout
- **Components Used**:
  - "See all articles" link
  - Locked feature cards with "Upgrade to unlock" badges
  - HR guidance card with illustration
  - "Learn more" buttons
- **Color Usage**: Teal badges, gray for locked state
- **Typography**: "Upgrade to unlock" as clear upsell indicator
- **Notable UX Patterns**:
  - Freemium upsell pattern with locked features
  - HR expert guidance promotion

---

### Image 103 - Hiring Tools - Global Teams
- **Page/Screen Type**: Extended hiring tools section
- **Layout Pattern**: Continued card layout
- **Components Used**:
  - "Gusto Global" badge
  - International hiring card
  - Multiple "Learn more" CTAs
- **Notable UX Patterns**:
  - Feature discovery through browseable cards
  - Premium feature badges

---

### Image 104 - Learning Course Catalog
- **Page/Screen Type**: Course catalog/learning management
- **Layout Pattern**: Sidebar filters + course grid
- **Components Used**:
  - Three tabs (Course catalog, Course progress, State requirements)
  - Search input
  - Category filter list (sidebar)
  - State filter list
  - Course cards in two columns
  - "View course info" links
- **Color Usage**: Teal for active filters and links
- **Typography**: Course titles bold, descriptions smaller
- **Spacing & Whitespace**: Card-based grid with filters sidebar
- **Notable UX Patterns**:
  - Dual-axis filtering (category + state)
  - Course duration shown upfront

---

### Image 105 - Enroll Team Members - Selection
- **Page/Screen Type**: Course enrollment wizard
- **Layout Pattern**: Breadcrumb + progress steps + selection table
- **Components Used**:
  - Three-step progress bar (Select, Set dates, Review)
  - Search input
  - Selection table with Filter button
  - Checkbox selection
  - Back/Continue navigation
- **Color Usage**: Teal progress bar segments
- **Typography**: Clear step labels
- **Notable UX Patterns**:
  - Multi-step enrollment flow
  - Bulk selection for team enrollment

---

### Image 106 - Enroll Team Members - Selected State
- **Page/Screen Type**: Selection confirmed
- **Layout Pattern**: Same as 105
- **Components Used**:
  - Selected checkbox
  - "1 selected" indicator with Actions dropdown
  - Enabled Continue button
- **Notable UX Patterns**:
  - Selection enables progression

---

### Image 107 - Learning - Course Progress Empty State
- **Page/Screen Type**: Course progress tracking
- **Layout Pattern**: Tab content with empty state
- **Components Used**:
  - Columns toggle button
  - Search input
  - Sortable table headers
  - Empty state illustration (heart with badge)
  - "View courses" CTA button
- **Color Usage**: Coral illustration accent
- **Typography**: Friendly empty state messaging
- **Spacing & Whitespace**: Centered empty state with clear CTA
- **Notable UX Patterns**:
  - Actionable empty state directing to solution

---

### Image 108 - State Harassment Prevention Requirements
- **Page/Screen Type**: Compliance information page
- **Layout Pattern**: Cards with state categorization
- **Components Used**:
  - Info banner explaining state laws
  - Three category cards (Mandated, Encouraged, Best practice)
  - Icons for each category
  - State lists within cards
  - Info section about determining requirements
  - Two sub-cards for location factors
- **Color Usage**: Category-specific icons
- **Typography**: State names listed, explanatory text
- **Spacing & Whitespace**: Information-dense but organized
- **Notable UX Patterns**:
  - Complex compliance info made navigable
  - Location-based rule explanation

---

### Image 109 - Course Catalog - Course Cards
- **Page/Screen Type**: Course listing with cards
- **Layout Pattern**: Two-column course grid
- **Components Used**:
  - Course cards with:
    - Title
    - Duration
    - Description
    - "View course info" link
  - State-specific badges (California)
- **Color Usage**: Teal for links
- **Typography**: Bold course titles, gray descriptions
- **Notable UX Patterns**:
  - State compliance badges on relevant courses
  - Scannable card format

---

### Image 110 - Course Detail Preview
- **Page/Screen Type**: Course detail with preview
- **Layout Pattern**: Main content + sidebar help
- **Components Used**:
  - Back link
  - Course title and description
  - Price and duration info
  - "Enroll team members" CTA button
  - Embedded video preview (YouTube)
  - "Got questions?" sidebar card with FAQ link
- **Color Usage**: Teal buttons, video player chrome
- **Typography**: Course title as heading
- **Spacing & Whitespace**: Video prominent, details secondary
- **Notable UX Patterns**:
  - Video preview before purchase
  - Help sidebar for questions

---

### Image 111 - Course Enrollment - Same as 105
- **Page/Screen Type**: Enrollment flow repeated
- **Notable UX Patterns**: Consistent enrollment experience across courses

---

### Image 112 - Course Enrollment - Selected (Repeat)
- **Page/Screen Type**: Same selection state
- **Notable UX Patterns**: Consistent patterns maintained

---

### Image 113 - Set Dates and Reminders Step
- **Page/Screen Type**: Enrollment step 2 - scheduling
- **Layout Pattern**: Form with date picker + toggle
- **Components Used**:
  - Date picker input (mm/dd/yyyy)
  - Helper text about overdue completion
  - Toggle switch for automatic reminders
  - Reminder timing (7 days before)
  - "Preview email" link
  - Back/Continue buttons
- **Color Usage**: Teal for toggle on-state
- **Typography**: Section headers, helper text
- **Notable UX Patterns**:
  - Smart defaults with customization option
  - Email preview before sending

---

### Image 114 - Date Selected
- **Page/Screen Type**: Same with date filled
- **Layout Pattern**: Same as 113
- **Components Used**:
  - Date value "12/01/2025"
- **Notable UX Patterns**:
  - Date format shown after selection

---

### Image 115 - Enrollment Review Step
- **Page/Screen Type**: Final review before enrollment
- **Layout Pattern**: Review summary with edit links
- **Components Used**:
  - Summary cards showing:
    - Course name
    - Number of team members
    - Key dates with edit link
    - Reminder settings with edit link
  - Progress bar complete (all three steps)
- **Color Usage**: Teal for edit links
- **Typography**: Label/value pairs
- **Spacing & Whitespace**: Clean summary layout
- **Notable UX Patterns**:
  - Inline edit capability from review
  - Clear summary before commitment

---

### Image 116 - Purchase Confirmation with Cost
- **Page/Screen Type**: Purchase confirmation/checkout
- **Layout Pattern**: Invoice summary + next steps
- **Components Used**:
  - Cost calculation card
  - Price per person breakdown
  - "What happens next" timeline
  - Radio-style step indicator
  - Purchase CTA with price
  - Terms agreement text
- **Color Usage**: Teal for purchase button
- **Typography**: Large price display
- **Spacing & Whitespace**: Cost prominent, steps secondary
- **Notable UX Patterns**:
  - Transparent pricing before purchase
  - Clear post-purchase expectations
  - Legal terms linked

---

### Image 117 - Background Checks Integration
- **Page/Screen Type**: Third-party integration landing
- **Layout Pattern**: Split info page
- **Components Used**:
  - Partner logo (Checkr)
  - Explanation text with links
  - "How it works" three-step cards
  - Two-column info sections
  - Pricing and check types info
- **Color Usage**: Checkr brand colors, teal Gusto accents
- **Typography**: Step numbers, feature lists
- **Spacing & Whitespace**: Marketing-style layout
- **Notable UX Patterns**:
  - Partner integration explained clearly
  - Three-step process visualization

---

### Image 118 - Background Checks - Costs and Types
- **Page/Screen Type**: Continued integration info
- **Layout Pattern**: Two-column content
- **Components Used**:
  - Bulleted feature list
  - Pricing information with links
  - Checkbox consent with legal text
  - "Get started" CTA button
  - "Already have account? Log in here" link
- **Color Usage**: Teal buttons and links
- **Typography**: Bullet lists for scannability
- **Spacing & Whitespace**: Dense but organized information
- **Notable UX Patterns**:
  - Legal consent before proceeding
  - Account linking for existing users

---

### Image 119 - Background Checks - Consent Checked
- **Page/Screen Type**: Same with consent given
- **Layout Pattern**: Same as 118
- **Components Used**:
  - Checkbox now checked
  - Get started button presumably enabled
- **Notable UX Patterns**:
  - Consent required before action

---

## Summary of Unique Patterns

### Layout Patterns
1. **Sidebar + Main Content**: Consistent navigation pattern across all pages
2. **Progress Bar/Step Indicator**: Multi-step wizards with clear position
3. **Card-based Selection**: Major choices presented as selectable cards
4. **Tabbed Content**: Filtering complex lists (People tabs, Course tabs)
5. **Modal Dialogs**: Focused actions without page navigation
6. **Empty States**: Illustrated, actionable empty states with clear CTAs

### Component Library
1. **Buttons**: Primary (teal filled), Secondary (outline), Destructive (coral/red), Link-style
2. **Tables**: Sortable columns, checkbox selection, kebab menus, status indicators
3. **Forms**: Labels with helper text, conditional fields, masked inputs
4. **Toasts**: Bottom-left success/error notifications with dismiss
5. **Dropdowns**: Action menus, select inputs, split buttons
6. **Progress Indicators**: Linear progress bars, step indicators, vertical timelines
7. **Status Dots**: Color-coded status (teal=on track, orange=pending, green=complete)
8. **Badges**: "Recommended", "Default", "Upgrade to unlock"

### Color System
- **Primary**: Teal (#0F766E or similar)
- **Success**: Green
- **Warning/Pending**: Orange
- **Error/Destructive**: Coral/Red
- **Neutral**: Grays for text hierarchy
- **Background**: White primary, light gray secondary

### Typography Patterns
- **Page Titles**: Large, bold
- **Section Headers**: Medium-bold
- **Table Headers**: Gray, uppercase optional
- **Body Text**: Regular weight
- **Helper Text**: Smaller, gray
- **Links**: Teal, underlined on hover

### Interaction Patterns
1. **Triple-Action Footer**: Back (outline) + Primary CTA (filled) + Save/Exit (link)
2. **Inline Entity Creation**: Create new items without leaving flow
3. **Bulk Selection**: Checkbox with count + Actions dropdown
4. **Contextual Menus**: Kebab menus with row-specific actions
5. **Confirmation Modals**: For destructive or significant actions
6. **Success Toasts**: Non-blocking feedback for completed actions

### UX Best Practices Observed
1. **Progressive Disclosure**: Show complexity only when needed
2. **Smart Defaults**: Pre-select recommended options
3. **Clear Next Steps**: "What happens next" sections
4. **Inline Help**: FAQs buttons, "Learn more" links
5. **Visual Feedback**: Selection states, completion checkmarks
6. **Error Prevention**: Confirmations before destructive actions
7. **Batch Operations**: Select multiple items for bulk actions
8. **Compliance Support**: State-specific requirements clearly indicated

### Navigation Patterns
1. **Breadcrumbs**: For deep navigation (Learning > Course > Enroll)
2. **Back Arrows**: Return to previous context
3. **Tabs**: Switch between related views
4. **Sidebar**: Primary app navigation
5. **Step Indicators**: Progress through multi-step flows
