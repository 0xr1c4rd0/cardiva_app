# Gusto UI/UX Analysis - Images 0-59

## Executive Summary

This analysis covers 60 screenshots from Gusto's web application, documenting the complete onboarding flow from marketing landing page through contractor payment setup and team member addition. Gusto demonstrates a mature, user-friendly design system with consistent patterns for forms, wizards, dashboards, and progressive disclosure.

---

## Individual Screen Analysis

### Image 0: Marketing Landing Page with Product Preview
- **Page Type**: Marketing/Landing page with embedded product demo
- **Layout Pattern**: Full-width header with navigation, hero section with CTA, product preview modal overlay
- **Components**: Navigation bar, headline text, dual CTAs ("Create free account", "How Gusto works"), product preview showing payroll confirmation flow
- **Color Usage**:
  - Primary: Coral/Salmon (#F45D48) for Gusto logo and accents
  - Secondary: Teal (#0A8080) for primary CTAs
  - Background: White with subtle gray cards
  - Text: Dark charcoal for readability
- **Typography**: Large serif headline "Payroll, HR, Benefits. Simplified.", sans-serif body text
- **Spacing**: Generous whitespace, clear visual hierarchy
- **Notable UX**: Product preview shows real interface to build trust; social proof badges at bottom (Newsweek, Fast Company)

### Image 1: Account Registration Form (Empty)
- **Page Type**: Registration/Sign-up form
- **Layout Pattern**: Centered card layout with minimal header
- **Components**:
  - Google SSO button (outlined, teal text)
  - Divider with "or" text
  - Form fields: First name, Last name, Work email, Company name, No. of employees, Company phone, Password, Confirm password
  - Full-width teal "Create account" button
  - Terms/privacy links
- **Color Usage**: White background, teal primary button, coral logo
- **Typography**: Large heading "Create your free account on Gusto", smaller subhead explaining value prop
- **Form Design**:
  - Two-column layout for name fields
  - Single column for other fields
  - Password show/hide toggle
  - Password requirements displayed as checklist below field
- **Notable UX**: Support phone number in top-right corner; footer with privacy links

### Image 2: Account Registration (Partially Filled)
- **Page Type**: Registration form in progress
- **Layout Pattern**: Same as Image 1
- **Components**: Same form with some fields redacted/filled
- **Notable UX**: Fields appear to gray out/mask when filled for privacy

### Image 3: Account Registration (Password Validation - Weak)
- **Page Type**: Registration with validation feedback
- **Components**: Password strength indicator showing weakness
- **Color Usage**:
  - Red/coral for error states
  - Green checkmark for passed requirements
  - Yellow/orange progress bar for "weak" password
- **Notable UX**: Real-time password validation with:
  - Strength meter (colored bar)
  - Checklist items change from empty circles to checked/failed
  - Helpful suggestion text: "Stronger password required. Try adding special characters or random words"

### Image 4: Account Registration (Password Validation - Strong)
- **Page Type**: Registration with successful validation
- **Components**: All password requirements showing green checkmarks
- **Color Usage**: Green/teal checkmarks indicate success
- **Notable UX**: Full green progress bar indicates strong password

### Image 5: Account Registration (Password Mismatch Error)
- **Page Type**: Registration with error state
- **Components**: Error message below confirm password field
- **Color Usage**: Red/coral error icon and text
- **Error Pattern**: Inline error message "Passwords do not match" with warning icon
- **Notable UX**: Field border changes to red/coral to indicate error

### Image 6: Account Registration (Matching Passwords)
- **Page Type**: Registration ready to submit
- **Components**: Both password fields filled, all validations passed
- **Notable UX**: Green strength bar, all checkmarks green, form ready for submission

### Image 7: Account Registration (Loading State)
- **Page Type**: Form submission loading
- **Components**: Spinner/loading indicator on "Create account" button
- **Notable UX**: Button shows loading spinner while processing, prevents double submission

### Image 8: Email Verification Screen
- **Page Type**: Post-registration confirmation
- **Layout Pattern**: Split layout - left side content, right side illustration
- **Components**:
  - Green mail icon
  - Heading "Check your email"
  - Instructional text
  - "How did you hear about us?" dropdown (optional survey)
  - Submit button
  - Device mockups showing email on desktop and mobile
- **Color Usage**: Teal accents, coral logo
- **Illustration Style**: Clean line art with subtle color, showing multi-device experience
- **Notable UX**: Post-signup survey integrated into wait screen; questions link for support

### Image 9: Email Verification (Survey Answered)
- **Page Type**: Same as Image 8
- **Components**: Dropdown showing "Other advertising" selected
- **Notable UX**: Simple single-select dropdown for attribution

### Image 10: Email Verification (Thank You State)
- **Page Type**: Survey completion
- **Components**: "Thanks! We've heard good things about you too." confirmation message
- **Notable UX**: Friendly, conversational tone in confirmation

### Image 11: Company Profile Setup - Worker Types
- **Page Type**: Onboarding wizard step
- **Layout Pattern**: Full-width header, centered content card with progress indicator
- **Components**:
  - Progress bar (green, showing early stage)
  - Question heading with context
  - Checkbox list with descriptions:
    - Myself (As a W-2 employee)
    - Employees in the US
    - Non-US employees
    - Contractors in the US
    - Non-US contractors
    - Vendors
  - Back/Continue button pair
- **Color Usage**: Teal progress bar, teal filled checkboxes
- **Typography**: Bold question heading, regular weight descriptions
- **Checkbox Design**: Square with rounded corners, teal fill when checked
- **Notable UX**: "Questions?" phone link in top right; descriptive text under each option explaining the difference

### Image 12: Dashboard Home (Setup in Progress)
- **Page Type**: Main dashboard
- **Layout Pattern**: Left sidebar navigation + main content area
- **Components**:
  - Sidebar: Home (active), People, Hiring, Learning, Pay, Reports, Taxes & Compliance, Time & Attendance, Benefits, Documents, Money, Shortcuts section with Add link, App directory
  - Main content:
    - Greeting "Good afternoon"
    - Setup progress card with "Continue" CTA
    - Tasks section with "All caught up" empty state
    - Payments in progress section
    - Upcoming calendar items
    - Recommendations cards
- **Color Usage**: Teal sidebar active state, coral recommendation badges
- **Empty State**: Cute robot/mascot illustration with "We'll let you know if something comes up"
- **Navigation**: Icon + text labels, clear active state with teal highlight
- **Notable UX**: Proactive setup prompt; recommendation cards for upselling

### Image 13: Company Profile - Worker Types (Selected)
- **Page Type**: Onboarding wizard with selections
- **Components**: Same as Image 11 with "Contractors in the US" and "Non-US contractors" checked
- **Notable UX**: Multiple selections allowed, checkboxes show teal fill

### Image 14: Company Profile - IRS Registration Question
- **Page Type**: Onboarding wizard - yes/no question
- **Layout Pattern**: Centered content, minimal UI
- **Components**:
  - Progress bar (partial)
  - Question with explanatory text and link to "register with the IRS"
  - Radio buttons: Yes / No
  - Back/Continue buttons
- **Radio Button Design**: Circular, teal fill when selected
- **Typography**: Bold question, regular supporting text
- **Notable UX**: Contextual help link embedded in description

### Image 15: Company Profile - IRS Question (Yes Selected)
- **Page Type**: Same as Image 14
- **Components**: "Yes" radio selected with teal fill
- **Notable UX**: Clean binary choice pattern

### Image 16: Company Profile - Team Size Input
- **Page Type**: Onboarding wizard - number input
- **Layout Pattern**: Centered content
- **Components**:
  - Progress bar (about 50%)
  - Question heading with context
  - Text input field with placeholder
  - Back/Continue buttons
- **Input Design**: Single text field, standard border, placeholder text "Number of contractors working in US"
- **Notable UX**: Natural language context: "We'll use this info to make recommendations based on your company size"

### Image 17: Company Profile - Team Size Filled
- **Page Type**: Same as Image 16
- **Components**: Input showing "2" entered
- **Notable UX**: Numeric input with no special validation shown

### Image 18: Industry Selection with Search
- **Page Type**: Onboarding wizard - searchable selection
- **Layout Pattern**: Compact wizard view (smaller viewport)
- **Components**:
  - Search input with "Consulting" entered
  - AI indicator badge "AI-powered insights to match you with the right industry"
  - Radio list of matching industries:
    - Administrative Management and General Management Consulting Services
    - Other Management Consulting Services
    - Human Resources Consulting Services
  - Optional website input
- **Color Usage**: Green checkmark indicator for selected option
- **Notable UX**:
  - AI-powered matching indicated
  - Search filters options in real-time
  - Descriptive text under each industry option
  - Optional fields clearly labeled

### Image 19: Industry Selection (Option Selected)
- **Page Type**: Same as Image 18
- **Components**: "Other Management Consulting Services" selected with green left border
- **Notable UX**: Selected option has teal/green left border highlight

### Image 20: Cannabis Business Question
- **Page Type**: Onboarding wizard - compliance question
- **Components**:
  - Yes/No radio buttons for cannabis-related business
  - Explanatory text about specialized banks
  - "No" option selected
- **Notable UX**: Compliance-driven question with clear explanation of why it matters

### Image 21: Loading State - Mascot Animation
- **Page Type**: Processing/Loading screen
- **Layout Pattern**: Centered illustration
- **Components**: Cute pig mascot character (animated/illustrative)
- **Illustration Style**: Playful, hand-drawn look with subtle colors
- **Notable UX**: Delightful loading animation instead of spinner; builds brand personality

### Image 22: Profile Complete - Package Creation
- **Page Type**: Transition/Success state
- **Layout Pattern**: Centered text
- **Components**:
  - "Company profile complete!" confirmation
  - "Creating a Gusto package for [company]" message
  - Checkmark with "Only paying contractors"
- **Color Usage**: Green checkmark for success
- **Notable UX**: Shows user what was understood from their inputs

### Image 23: Recommended Package Display
- **Page Type**: Pricing/Plan recommendation
- **Layout Pattern**: Centered card
- **Components**:
  - Plan card with:
    - "Gusto plan" label
    - Plan name "The Contractor Only plan"
    - Price "$6/mo per person"
    - Promotional badge "$35 OFF FOR 6 MONTHS"
    - "View full plan" link
    - Description text
    - Green status indicators: "$0 due today", "No credit card needed"
  - Billing consent checkbox
  - Terms agreement link
  - Primary CTA "Start with this package"
- **Color Usage**:
  - Teal for promotional badge
  - Green for positive indicators
  - Coral for price highlight
- **Notable UX**: Clear pricing, no-commitment messaging, promotional offer prominently displayed

### Image 24: Recommended Package (Checkbox Selected)
- **Page Type**: Same as Image 23
- **Components**: Billing consent checkbox now checked
- **Notable UX**: Must agree to terms before continuing

### Image 25: Plan Details Modal
- **Page Type**: Modal overlay
- **Layout Pattern**: Right-side slide-in panel
- **Components**:
  - Modal header "Plan details" with close X
  - Plan name and pricing
  - "For companies who need" section
  - "Top Features" checklist with info icons:
    - US contractor payments
    - 4 day pay
    - Form 1099 creation and filings
    - State new hire reporting
  - Footnote about discounted pricing
  - "Close" button
- **Color Usage**: Checkmarks in teal, info icons in gray
- **Modal Design**: White background, subtle shadow, overlay dims background
- **Notable UX**: Info icons provide additional detail on hover/click

### Image 26: Plan Details (Tooltip Shown)
- **Page Type**: Same modal with tooltip
- **Components**: Tooltip explaining "US contractor payments" feature
- **Tooltip Design**: Small popover with close X, white background, subtle shadow
- **Notable UX**: Progressive disclosure of feature details

### Image 27: Contractor Payment Setup - Address Step
- **Page Type**: Setup wizard with sidebar steps
- **Layout Pattern**: Left sidebar steps + main content form
- **Components**:
  - Back arrow with page title "Set up contractor payments"
  - FAQs link
  - Steps sidebar:
    - Addresses (active, blue circle)
    - Federal tax info
    - Bank account
  - Form content:
    - Heading "Enter your company's mailing address"
    - Mailing address input
    - Checkbox "This is a physical location I work at"
    - Company phone (pre-filled)
    - Back/Continue buttons
- **Color Usage**: Blue/teal for active step indicator
- **Step Indicator Design**: Numbered circles, active has filled color
- **Notable UX**: Clear step progression; helpful context about why info is needed

### Image 28: Address Step (Validation Error)
- **Page Type**: Same form with error
- **Components**:
  - Red/coral border on empty required field
  - Error message "Please enter an address"
- **Error Design**: Red border, inline error text with warning icon
- **Notable UX**: Validation prevents proceeding without required data

### Image 29: Address Step (Autocomplete Dropdown)
- **Page Type**: Form with autocomplete
- **Components**:
  - Address input with autocomplete suggestions dropdown
  - Clear/X button in input field
- **Notable UX**: Google Maps-style address autocomplete for accuracy

### Image 30: Address Step (Address Filled)
- **Page Type**: Form with completed address
- **Components**: Address field populated, clear button visible
- **Notable UX**: Easy to clear and re-enter if needed

### Image 31: Address Step (Physical Location Checked)
- **Page Type**: Same form with checkbox selected
- **Components**: Teal checkbox indicating physical work location
- **Notable UX**: Additional context captured for compliance

### Image 32: Federal Tax Info Step
- **Page Type**: Tax information form
- **Layout Pattern**: Sidebar steps + scrollable form
- **Components**:
  - Federal EIN input with format example
  - Business entity type dropdown
  - Address selection radio buttons
  - Links to "register online" and examples
- **Input Design**: Masked input for EIN (XX-XXXXXXX format)
- **Notable UX**: Links to IRS registration; clear explanations of each field

### Image 33: Federal Tax Info (Dropdown Shown)
- **Page Type**: Same form with dropdown open
- **Components**: "Please select..." dropdown expanded
- **Notable UX**: Standard dropdown pattern

### Image 34: Federal Tax Info (LLC Selected)
- **Page Type**: Form with selections
- **Components**:
  - EIN filled
  - "Limited Liability Company (LLC)" selected
  - Additional questions appear: S-Corp election, legal name, DBA name
- **Notable UX**: Progressive disclosure - new questions appear based on entity type selection

### Image 35: Federal Tax Info (Full Form)
- **Page Type**: Complete tax form
- **Components**:
  - Legal name input
  - DBA/trade name input
  - Federal filing form selection (Form 941 vs 944)
  - IRS address selection
- **Radio Button Groups**: Clear grouping with explanatory text
- **Notable UX**: Detailed explanations help users select correct options

### Image 36: Bank Account Connection
- **Page Type**: Bank linking step
- **Layout Pattern**: Sidebar steps (bank account now active) + main content
- **Components**:
  - "Recommended" badge
  - Plaid integration card
  - "Verify with Plaid" teal button
  - Alternative manual verification link
  - Terms and privacy policy links
- **Card Design**: Subtle border, clear hierarchy
- **Notable UX**: Plaid as recommended option; manual alternative available; clear security messaging

### Image 37: Bank Account Verified Success
- **Page Type**: Success confirmation
- **Layout Pattern**: Same wizard layout
- **Components**:
  - Success heading "Done! Your bank account has been verified."
  - Bank card showing:
    - Bank icon
    - "Default" badge
    - Account name "COLUMN NA WISE Checking"
    - "Connected" status with green checkmark
    - Account number (partially masked)
  - Back/Continue buttons
- **Color Usage**: Green for success indicators
- **Card Design**: Clean white card with bank icon
- **Notable UX**: Clear confirmation; default designation shown

### Image 38: Add a Person - Basic Info
- **Page Type**: Team member creation wizard
- **Layout Pattern**: Full sidebar nav visible + main form
- **Components**:
  - "Add a person" heading
  - Progress indicator "Basics - Steps 1 of 4"
  - Form fields:
    - First name, Middle initial (optional)
    - Last name
    - Preferred first name (optional with explanation)
    - Worker type section with radio options:
      - Employee
      - Contractor (Individual)
- **Color Usage**: Active nav item highlighted
- **Notable UX**: Step counter in top right; optional fields clearly marked; preferred name accommodation

### Image 39: Dashboard - Task List
- **Page Type**: Home dashboard with tasks
- **Layout Pattern**: Sidebar + main content
- **Components**:
  - Tasks list:
    - "Choose S corporation status" with "Start" link
    - "Connect apps to Gusto" with "Start" link
  - "Gusotes" empty state with heart
  - Recommendations panel with promotional cards:
    - "Get advanced features at a transparent price"
    - Xero integration offer
    - Banking and Borrowing card
- **Card Design**: White cards with subtle shadows, dismissible X
- **Notable UX**: Action-oriented task list; upsell recommendations contextually placed

### Image 40: Contractor Payment Timeline
- **Page Type**: Setup progress tracker
- **Layout Pattern**: Vertical timeline
- **Components**:
  - Timeline with steps:
    - Fill out company profile (completed, checkmark)
    - Set up contractor payments (completed)
    - Add team members (in progress, "Let's do it" CTA)
    - Sign documents (pending, time estimate)
    - Verify bank account (completed)
    - Gusto reviews your account (pending with date)
  - Review links for completed steps
- **Timeline Design**:
  - Vertical line connecting steps
  - Filled teal circles for completed
  - Empty circles with date for pending
  - Current step highlighted
- **Color Usage**: Teal for completed, gray for pending
- **Notable UX**: Clear progress visualization; time estimates for future steps; review links for verification

### Image 41: Contractor Payment Timeline (More Steps)
- **Page Type**: Same timeline, scrolled
- **Components**:
  - "Finish onboarding team members" with "Pending action" badge
  - "Sign documents" with time estimate
  - "Verify bank account" completed
  - "Gusto reviews your account" with info icon
  - "Pay your contractors" final step
- **Badge Design**: "Pending action" label with outlined style
- **Notable UX**: Info icon for steps needing explanation; final goal step visible

### Image 42: Dashboard with Xero Promo
- **Page Type**: Home dashboard
- **Components**: Same structure as Image 39 with different promotional content
- **Notable UX**: Rotating/personalized recommendations

### Image 43: Add a Person - Empty Form
- **Page Type**: Team member form (fresh)
- **Components**: All fields empty, ready for input
- **Notable UX**: Clean starting state

### Image 44: Add a Person - Name Filled
- **Page Type**: Team member form (partial)
- **Components**:
  - First name: "Sam"
  - Last name: "Lee"
  - Preferred first name: "Sam"
- **Notable UX**: Preferred name auto-populates from first name

### Image 45: Add a Person - Worker Type Selection
- **Page Type**: Expanded worker type options
- **Components**:
  - Full radio list:
    - Employee
    - Contractor (Individual) - selected
    - Contractor (Business)
    - External collaborator
    - Unpaid team member
  - Country dropdown (United States)
  - Personal email input
  - Onboarding options checkbox
- **Color Usage**: Teal radio button fill
- **Notable UX**: Comprehensive worker type options; country-aware

### Image 46: Add a Person - Email Filled
- **Page Type**: Form with email
- **Components**: Email field populated, "Send a contractor agreement" checkbox, "Set up background checks" link
- **Dual Buttons**: "Cancel" (outline) and "Save and continue" (filled teal)
- **Notable UX**: Optional onboarding automation; link to background checks

### Image 47: Add a Person - Role Step
- **Page Type**: Step 2 - Role information
- **Layout Pattern**: Same form layout
- **Components**:
  - "Tell us about Sam's role as a contractor"
  - Dropdowns: Work location, Work state
  - Job title input (optional)
  - Department dropdown with "Create department" link
  - Manager search input
- **Notable UX**: Can create new departments inline; manager lookup with search

### Image 48: Add a Person - Role Details Filled
- **Page Type**: Role form with selections
- **Components**:
  - "Create a new job title" selected
  - New job title: "Product Designer"
  - Department: "Product" (dropdown)
  - Manager search field
  - Contract start date with calendar picker
- **Date Picker**: Calendar icon + formatted date input
- **Button Group**: "Go back", "Save and continue", "Save and exit" link
- **Notable UX**: Multiple save options; create-on-the-fly for job titles

### Image 49: Add a Person - Compensation Step
- **Page Type**: Step 3 - Compensation
- **Layout Pattern**: Simple form
- **Components**:
  - Progress indicator "Step 3 of 5"
  - Payment type radio buttons:
    - Fixed payment amount
    - Hourly rate
- **Notable UX**: Clean binary choice for payment structure

### Image 50: Add a Person - Fixed Payment Selected
- **Page Type**: Compensation with selection
- **Components**: "Fixed payment amount" radio selected
- **Notable UX**: Selection triggers next step

### Image 51: Contractor Agreement Form
- **Page Type**: Step 4 - Agreement details
- **Layout Pattern**: Long scrollable form
- **Components**:
  - Agreement template dropdown
  - Template title input
  - Agreement expiration date picker
  - Fixed payment amount input
  - Responsibilities textarea
  - Work duration radio buttons
  - End date field
- **Form Design**: Mix of inputs, textareas, radios, date pickers
- **Notable UX**: Template system for agreements; rich text responsibilities field

### Image 52: Contractor Agreement (Filled)
- **Page Type**: Same form with data
- **Components**:
  - Date: 06/06/2025
  - Payment: 100
  - Responsibilities: Bullet list of design tasks
- **Notable UX**: Structured input supports formatted lists

### Image 53: Contractor Agreement - Signature Section
- **Page Type**: Agreement with signature capture
- **Layout Pattern**: Scrolled form view
- **Components**:
  - Company signature section
  - Title input: "CEO"
  - Signature capture field with handwritten "Sam Lee"
  - Agreement preview section showing formatted contract text
- **Signature Design**: Canvas/drawn signature with X marker
- **Notable UX**: CEO signs on behalf of company; preview shows generated document

### Image 54: Contractor Agreement - Preview
- **Page Type**: Agreement document preview
- **Layout Pattern**: Document view within wizard
- **Components**:
  - Full agreement text preview
  - Sections: Services, Term
  - Info banner "Offer customization is currently limited"
  - "Go back" / "Save and continue" buttons
- **Banner Design**: Teal background, info icon, descriptive text
- **Notable UX**: Preview before sending; customization limitations disclosed

### Image 55: Contractor Agreement - Validation Error
- **Page Type**: Form with date validation error
- **Layout Pattern**: Compact form view
- **Components**:
  - Red error banner "We ran into a problem"
  - Bullet: "Validation failed: Expiration date The expiration date must be today or in the future"
  - Form fields with error state
- **Error Design**: Red banner with icon, bulleted error list
- **Notable UX**: Clear error messaging with specific field identified

### Image 56: Contractor Agreement - Error Corrected
- **Page Type**: Same form with corrected date
- **Components**: Date changed to 11/05/2025 (valid future date)
- **Notable UX**: Error clears when corrected

### Image 57: Contractor Agreement - Final Preview
- **Page Type**: Same as Image 54
- **Components**: Complete agreement ready to send
- **Notable UX**: Consistent preview pattern before confirmation

### Image 58: Add a Person - Review Step
- **Page Type**: Step 5 - Final review
- **Layout Pattern**: Summary cards
- **Components**:
  - "Review Sam's information" heading
  - Summary cards:
    - Personal (Name, Email, Worker type) with Edit link
    - Role (Work location, Manager, Job title, Department) with Edit link
- **Card Design**: White background, section header, field labels + values
- **Notable UX**: Edit links allow going back to specific sections

### Image 59: Add a Person - Full Review
- **Page Type**: Complete review with next steps
- **Layout Pattern**: Scrolled summary view
- **Components**:
  - Role card (continued): Start date
  - Payment card: Wage type
  - Contractor Agreement card
  - "Here's what happens next" section:
    - Timeline step: "Gusto will send Sam the contractor agreement"
    - Date: "Today - Expires November 5th"
- **Timeline Design**: Vertical line with status icon
- **Notable UX**: Clear next action preview; expiration date shown

---

## Pattern Summary

### Layout Patterns Identified

1. **Centered Card Layout**: Used for auth flows, simple forms (Registration, Email verification)
2. **Sidebar + Main Content**: Used for dashboards, complex forms with steps (Dashboard, Add Person wizard)
3. **Full-Width with Progress Bar**: Used for onboarding wizards (Company profile setup)
4. **Vertical Timeline**: Used for setup progress tracking
5. **Modal/Slide Panel**: Used for detail views, plan information
6. **Split Layout**: Used for marketing with illustrations

### Component Library

#### Buttons
- **Primary**: Teal (#0A8080) filled, white text, rounded corners (~8px)
- **Secondary**: White/transparent with teal border and text
- **Ghost/Link**: Text only with underline on hover
- **Loading State**: Spinner replaces text

#### Form Elements
- **Text Input**: Gray border, rounded corners, focus state with teal border
- **Dropdown**: Standard select with chevron, same styling as inputs
- **Checkbox**: Square with rounded corners, teal fill when checked
- **Radio Button**: Circle, teal fill when selected
- **Date Picker**: Calendar icon prefix, formatted date display

#### Feedback
- **Success**: Green checkmarks, green text
- **Error**: Coral/red borders, inline error text with icon
- **Warning**: Yellow/amber indicators
- **Info**: Teal banners with icon

#### Navigation
- **Sidebar**: Icon + text labels, teal highlight for active
- **Progress Bar**: Horizontal, teal filled portion
- **Step Indicator**: Numbered circles, filled = complete
- **Breadcrumb/Back**: Arrow + text link

### Color System

| Role | Color | Hex (approximate) |
|------|-------|-------------------|
| Brand Primary | Coral/Salmon | #F45D48 |
| Action Primary | Teal | #0A8080 |
| Success | Green | #0B8E4C |
| Error | Red/Coral | #D93D42 |
| Warning | Amber | #E5A50A |
| Text Primary | Charcoal | #1A1A1A |
| Text Secondary | Gray | #6B6B6B |
| Background | White | #FFFFFF |
| Border | Light Gray | #E5E5E5 |

### Typography

- **Headings**: Serif font (appears to be GT Super or similar) for marketing, sans-serif for app
- **Body**: Clean sans-serif (appears to be Inter or similar)
- **Font Weights**: Regular (400), Medium (500), Bold (700)
- **Sizes**: Clear hierarchy from ~32px headings down to ~14px body

### Spacing System

- **Base unit**: Appears to be 4px or 8px
- **Section spacing**: 24-32px between major sections
- **Form field spacing**: 16-24px between fields
- **Button spacing**: 16px between button pairs
- **Card padding**: 24px internal padding

### Empty States

- **Illustration Style**: Hand-drawn, cute mascots (pig, robot)
- **Messaging**: Friendly, conversational tone
- **CTA**: Always provide a path forward

### Progressive Disclosure

- Multi-step wizards with clear progress
- Conditional fields based on selections
- Info icons with tooltips for details
- "Learn more" links for extended content

### Accessibility Considerations

- High contrast text
- Clear focus states
- Form labels associated with inputs
- Error messages linked to fields
- Logical tab order

---

## Key UX Patterns for Reference

### Onboarding Best Practices
1. Break complex setup into digestible steps
2. Show progress with visual indicators
3. Use friendly illustrations during loading
4. Explain why information is needed
5. Provide "Edit" links on review screens

### Form Design
1. Label above input (not placeholder-only)
2. Group related fields (name fields on same row)
3. Inline validation with clear error messages
4. Optional fields clearly marked
5. Auto-save or "Save and exit" options

### Dashboard Design
1. Personalized greeting
2. Clear task prioritization
3. Progress tracking for setup
4. Recommendations without being pushy
5. Quick actions in sidebar

### Trust Building
1. "$0 due today" messaging
2. Support phone number always visible
3. Security indicators (Plaid, verified badges)
4. Preview before committing
5. Clear cancellation/edit paths
