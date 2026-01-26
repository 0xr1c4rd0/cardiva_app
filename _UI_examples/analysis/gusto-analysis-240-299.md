# Gusto UI/UX Analysis - Screenshots 240-299

## Overview

This analysis covers 60 Gusto web application screenshots (240-299), documenting UI patterns, components, interactions, and design decisions from a comprehensive B2B HR/payroll SaaS platform.

---

## Individual Screenshot Analysis

### Image 240 - Documents Templates Page
**Page Type:** Document management - Templates list view

**Layout Pattern:** Sidebar navigation + Secondary sidebar (sub-navigation) + Main content area

**Components Used:**
- Left sidebar navigation with icons
- Secondary sidebar with categories (Team, Company)
- Data table with sortable columns
- Teal "Add template" primary action button
- Three-dot overflow menu for row actions
- Link-style text for document names (teal color)

**Color Usage:**
- Primary: Teal (#0D9488 range)
- Text: Dark gray for labels, teal for links
- Status badge: "Ready to send" in gray text

**Typography:**
- Page title: Large bold "Documents"
- Section headers: Medium weight "Templates"
- Table headers: Small caps style, gray

**Spacing:** Generous whitespace, clear visual hierarchy

**Navigation:** Hierarchical - Team > Shared/Templates/Bulk downloads, Company > Authorization

**Notable UX:** Clean organization of document templates by category with clear status indicators

---

### Image 241 - Add Shortcuts Modal (Empty State)
**Page Type:** Dashboard with modal overlay

**Layout Pattern:** Full-page overlay modal, centered

**Components Used:**
- Modal dialog with close X button
- Text input field (empty)
- Cancel button (outlined/secondary)
- Save button (teal/primary)
- Semi-transparent dark backdrop

**Color Usage:**
- Modal background: White
- Backdrop: Dark gray with opacity
- Primary button: Teal filled
- Secondary button: White with border

**Typography:**
- Modal title: "Add shortcuts" - bold
- Input label: "Shortcuts" - medium weight

**Interactions:** Focus state on input field expected

---

### Image 242 - Add Shortcuts Modal (Dropdown Open)
**Page Type:** Dashboard with modal and dropdown

**Layout Pattern:** Modal with dropdown picker

**Components Used:**
- Text input with dropdown attached
- Dropdown menu with categories (People, Hiring, Learning, etc.)
- Scrollable dropdown list
- Category-organized menu items

**Color Usage:**
- Dropdown background: White
- Hover states expected on items
- Text: Dark gray

**Navigation Options in Dropdown:**
- People
- Hiring
- Learning
- Taxes & Compliance
- Tax setup
- Tax documents
- Tax credits
- Stay compliant
- Report a notice
- Business insurance
- Time & Attendance

**Notable UX:** Comprehensive shortcut categories covering all major app areas

---

### Image 243 - Add Shortcuts Modal (Multi-Select Tags)
**Page Type:** Modal with tag selection

**Layout Pattern:** Modal with tag input

**Components Used:**
- Tag chips/pills with X remove buttons (teal background)
- Multi-select dropdown
- "Clear all" link in teal
- Selected items: "Hiring", "Learning"
- Checkmark indicators for selected items

**Color Usage:**
- Selected tags: Light teal background
- Checkmarks: Teal

**Notable UX:** Clear visual feedback for selected items with easy removal via X or "Clear all"

---

### Image 244 - Add Shortcuts Modal (Tags Selected, Dropdown Closed)
**Page Type:** Modal confirmation state

**Layout Pattern:** Modal with selected tags

**Components Used:**
- Two selected tag pills: "Hiring", "Learning"
- Empty input field for additional selections
- Cancel and Save buttons

**Notable UX:** Clean representation of selected shortcuts before saving

---

### Image 245 - Dashboard with Shortcuts Saved Toast
**Page Type:** Main dashboard

**Layout Pattern:** Sidebar + Three-column main content

**Components Used:**
- Left navigation sidebar
- Shortcuts section added below "Add" in sidebar
- Task cards with expandable content
- Toast notification at bottom left
- "Gusties" emoji/mascot with heart
- Recommendations cards on right column

**Color Usage:**
- Toast: Dark gray/black background with white text and checkmark
- Success checkmark: Green

**Spacing:** Well-organized three-column layout

**Toast Notification:**
- "Shortcuts saved"
- Checkmark icon
- Dismissible with X

**Notable UX:** Non-intrusive success feedback positioned at bottom left

---

### Image 246 - Gusto Money Landing Page with Modal
**Page Type:** Feature landing/marketing page

**Layout Pattern:** Centered hero content with modal overlay

**Components Used:**
- Hero headline: "Smarter cash flow starts today"
- Feature list with checkmark bullets
- Add shortcuts modal overlay
- "Get early access" CTA button (teal)

**Feature Highlights:**
- Invoicing
- Bill Pay
- Connected accounts

**Notable UX:** Marketing content integrated within the app for feature discovery

---

### Image 247 - Gusto Money Page with Shortcuts Saved
**Page Type:** Feature landing page with toast

**Layout Pattern:** Centered content with feature cards

**Components Used:**
- Teal checkmark icons for features
- Feature cards with chevron arrows
- "Know exactly where your money stands" section
- Shortcuts saved toast notification

**Color Usage:**
- Feature icons: Teal circles with checkmarks
- CTA button: Teal

---

### Image 248 - Refer and Earn Program Page
**Page Type:** Referral program dashboard

**Layout Pattern:** Two-column split view

**Components Used:**
- Yellow promotional banner at top
- Left column: Share referral section
- Right column: Program status visualization
- Referral link input with "Copy link" button
- Email invite field with "Send email" button
- Progress arc visualization showing $800 value
- "How it works" section at bottom with 3 steps

**Color Usage:**
- Banner: Yellow/gold background
- Primary buttons: Teal
- Progress visualization: Teal arc on gray background
- Money amount: Large "$800" in dark text

**Typography:**
- Page title: "Refer and earn" - large bold
- Subtitle: Descriptive text about earning potential
- Amount display: Very large numeric

**Notable UX:** Gamification elements with visual progress toward rewards

---

### Image 249 - Refer and Earn (Link Copied State)
**Page Type:** Referral page with interaction feedback

**Components Used:**
- "Link copied!" button state change (teal filled)
- Visual confirmation of action

**Notable UX:** Immediate feedback when copying referral link - button text changes

---

### Image 250 - Refer and Earn (Email Filled)
**Page Type:** Referral page with form input

**Components Used:**
- Email input field populated
- "Add another email" link
- "Preview email" link
- Both links in teal

**Notable UX:** Ability to add multiple emails and preview before sending

---

### Image 251 - Refer and Earn (Email Sent Toast)
**Page Type:** Referral page with success feedback

**Components Used:**
- Toast notification: "Your invitation has successfully been sent."
- Green checkmark in toast

**Notable UX:** Clear confirmation of successful email invitation

---

### Image 252 - Company Settings - Details Page
**Page Type:** Settings/Account information

**Layout Pattern:** Sidebar + Secondary nav + Main content cards

**Components Used:**
- Company logo/avatar with edit overlay
- "Contractors only" badge
- Information cards with Edit links
- Details card: Legal name, Trade name, Website
- Signatory card: Company signatory, Owner info
- Phone number as clickable link (teal)

**Color Usage:**
- Edit links: Teal
- Avatar edit icon: Teal circle overlay

**Typography:**
- Card titles: Bold section headers
- Field labels: Gray
- Field values: Black

**Navigation Hierarchy:**
- Information: Details, Locations, Owners
- Taxes: Accounts
- Settings: Permissions, Customization, Plan & billing

---

### Image 253 - Company Settings - Locations Page
**Page Type:** Location management

**Layout Pattern:** Same as settings pattern

**Components Used:**
- Mailing and filing address card
- "All locations" section with table
- "Add location" primary button (teal)
- Search input for locations
- Filter and Columns links
- Data table with sortable columns
- "Filing and mailing address" badge/tag
- Status indicator: Green dot for "Active"
- Warning icon for "No employees"

**Color Usage:**
- Active status: Green dot
- Warning: Orange/yellow triangle icon

**Notable UX:** Clear differentiation between primary filing address and additional locations

---

### Image 254 - Company Settings - Owners (Empty State)
**Page Type:** Owner management - Empty state

**Layout Pattern:** Settings layout with empty state

**Components Used:**
- Empty state illustration (magnifying glass icon)
- "No owners added yet" message
- "Add owner" CTA button (teal filled, centered)
- Table header visible but no data

**Empty State Design:**
- Simple line icon illustration
- Clear messaging
- Single prominent CTA

**Notable UX:** Inviting empty state that guides user to add content

---

### Image 255 - Tax Account Setup Page
**Page Type:** Tax configuration settings

**Layout Pattern:** Condensed settings view

**Components Used:**
- Federal tax setup section
- Tax account details card with Edit link
- Multiple configuration fields
- "Explore becoming an S corp" link (teal)
- Expandable info icon

**Configuration Fields:**
- Legal name
- Federal EIN
- Business entity type
- S-Corporation taxation
- Deposit schedule
- Federal filing form

**Notable UX:** Complex tax information organized into logical sections

---

### Image 256 - Permissions - Roles Tab
**Page Type:** Role-based access control

**Layout Pattern:** Settings with tabbed content

**Components Used:**
- Tabs: Roles (active, underlined), Users
- Data table with roles
- "Add a role" primary button
- Badge/pill for "Basic" role type
- Member description tags
- Scope descriptions

**Color Usage:**
- Active tab: Teal underline
- Badge: Gray outline "Basic"

**Table Columns:**
- Role (sortable)
- Members
- Scope (sortable)
- Role type (sortable)
- Created by (sortable)

---

### Image 257 - Customization Settings Page
**Page Type:** Platform customization

**Layout Pattern:** Settings card layout

**Components Used:**
- Toggle settings (visual indicators)
- Warning icon for disabled security setting
- Edit links for each setting
- "Learn more" link (teal)
- AI Assistant section: "Gus, AI Assistant"

**Settings Options:**
- Two-step authentication for all admins (Disabled - with warning)
- Employment verification (Enabled)
- Beta skills (Disabled)
- Sound alerts (Disabled)

**Notable UX:** Security warnings for important disabled settings

---

### Image 258 - Plan & Billing Page
**Page Type:** Subscription and billing management

**Layout Pattern:** Settings layout with billing cards

**Components Used:**
- Info banner: "Your discount will start once you pay your first contractor"
- Billing summary card
- "Change plan" link
- Monthly plan breakdown
- "Cancel account" link (teal, potentially destructive)
- Add-ons section
- Next invoice section with date
- "See all invoices" link

**Pricing Display:**
- Base price with contractor fee breakdown
- $0 base + $6 per contractor

**Notable UX:** Clear billing information with easy access to change or cancel

---

### Image 259 - Edit Company Logo Modal (Empty)
**Page Type:** Modal for file upload

**Layout Pattern:** Centered modal overlay

**Components Used:**
- Modal with X close button
- File upload area with dashed border
- "+ Upload" button (teal outlined)
- "or drop file" text
- File requirements: "Only PNG and JPEG files of 300k or less"
- Cancel and Save buttons

**Upload Pattern:**
- Click to upload or drag-and-drop
- Clear file type and size restrictions

---

### Image 260 - Edit Company Logo Modal (With Preview)
**Page Type:** Modal with uploaded image preview

**Components Used:**
- Image preview area showing uploaded logo
- Same upload controls below preview
- Cancel and Save buttons

**Notable UX:** Immediate visual preview of uploaded logo before saving

---

### Image 261 - Company Details with Logo Saved Toast
**Page Type:** Settings page with success feedback

**Components Used:**
- Updated company logo visible in header
- "Company logo saved" toast notification (green checkmark)

**Notable UX:** Immediate visual update after successful logo upload

---

### Image 262 - Edit Owners Slide-Over Panel (Empty)
**Page Type:** Slide-over panel for editing

**Layout Pattern:** Full-height right-side slide-over

**Components Used:**
- Slide-over panel (wider than modal)
- Control owner dropdown selector
- Business owners multi-select
- Helpful context text explaining ownership requirements
- "add them to your team" link
- Cancel and Submit details buttons

**Form Fields:**
- Control owner: "Select the control owner" (single select)
- Business owners: "Select business owners" (multi-select)

**Notable UX:** Contextual help explaining who qualifies as owners

---

### Image 263 - Edit Owners Panel (With Selections)
**Page Type:** Slide-over with form filled

**Components Used:**
- Control owner filled: "Alex Smith" with X to clear
- Business owners with tag chips: "Sam Lee", "Alex Smith"
- "Clear all" link for business owners
- Multi-select input for adding more

**Notable UX:** Clear differentiation between single-select and multi-select patterns

---

### Image 264 - Owners List Page (With Data)
**Page Type:** Owners management - populated state

**Layout Pattern:** Settings with data table

**Components Used:**
- Table with Name, Status, Actions columns
- Status indicators:
  - Green dot: "Provided"
  - Yellow dot: "Request sent to owner - Awaiting info"
- "Add Information" action link
- Edit button (teal)

**Notable UX:** Clear status tracking for owner information collection

---

### Image 265 - Add a Role Wizard (Step 1 - Access Level)
**Page Type:** Multi-step wizard

**Layout Pattern:** Centered wizard content with progress indicator

**Components Used:**
- Step indicator: "Step 1 of 4"
- Progress bar (teal)
- Role icon/illustration (key graphic)
- Radio button group for role types
- Descriptive text for each option

**Role Types:**
- Basic
- Limited admin
- Global admin

**Buttons:** Cancel, Continue (teal)

**Notable UX:** Clear step progression with descriptive options

---

### Image 266 - Add a Role (Step 1 Expanded - Permissions)
**Page Type:** Wizard with expanded options

**Components Used:**
- "Basic" role selected (radio filled)
- Expanded "Team Members" section
- Info banner: "Basic roles will never see sensitive information"
- Sub-permission radio groups:
  - Basic information: No access, View only, Edit access
  - Additional permission categories visible

**Color Usage:**
- Info banner: Light teal background
- Selected radio: Teal filled

**Notable UX:** Progressive disclosure of detailed permissions based on role selection

---

### Image 267 - Add a Role (Permissions Detail)
**Page Type:** Detailed permission configuration

**Layout Pattern:** Scrollable form sections

**Components Used:**
- Multiple permission categories as cards:
  - Time & Attendance
  - Expenses
- Each with radio button groups
- Team time off, Time tracking, Scheduling sub-sections
- Cancel and Continue buttons

**Permission Options:**
- No access
- View only
- Approve
- Edit access

**Notable UX:** Granular permission control with clear hierarchy

---

### Image 268 - Add a Role (Validation Error)
**Page Type:** Form with validation

**Components Used:**
- Error banner: "Please select some access you wish to give this role"
- Teal info icon in banner
- Same permission form below

**Error Handling:**
- Non-blocking inline error
- Clear action required message
- Teal accent for information

**Notable UX:** Helpful validation preventing creation of roles without any permissions

---

### Image 269 - Add a Role (With Selection Made)
**Page Type:** Form with valid selection

**Components Used:**
- "View only" selected under Scheduling
- Error banner cleared
- Ready to proceed

**Notable UX:** Real-time validation feedback

---

### Image 270 - Add a Role (Step 2 - Scope)
**Page Type:** Wizard step 2

**Components Used:**
- "Step 2 of 4" indicator
- Progress bar at 50%
- Dropdown selector for scope: "Everyone"
- Back and Continue buttons

**Notable UX:** Simple scope selection after detailed permissions

---

### Image 271 - Add a Role (Step 3 - Team Member)
**Page Type:** Wizard step 3

**Components Used:**
- "Step 3 of 4" indicator
- Progress bar at 75%
- Search input: "Search for a person..."
- Assigned to field

**Notable UX:** Person picker for role assignment

---

### Image 272 - Add a Role (Step 3 with Selection)
**Page Type:** Wizard with selection made

**Components Used:**
- Tag chip: "Does not have direct reports" with X
- "Clear all" link
- Search input still visible for more selections

**Notable UX:** Filter-based selection for role assignment

---

### Image 273 - Add a Role (Step 4 - Review)
**Page Type:** Wizard final review step

**Layout Pattern:** Summary cards for review

**Components Used:**
- "Step 4 of 4" indicator
- "Give this role a name" text input
- Summary sections:
  - Role definition with Edit link
  - Team Members with Edit link
- Assigned to and Scope displays
- Permission summary with X icons for "No access"

**Notable UX:** Comprehensive review before creation with inline editing

---

### Image 274 - Add a Role (Review with Name)
**Page Type:** Completed wizard form

**Components Used:**
- Role name filled: "Viewer lv. 1"
- Same summary cards below
- Back and Save role buttons

**Notable UX:** Final confirmation step with custom naming

---

### Image 275 - Add a Role (Full Review Summary)
**Page Type:** Extended review scrolled

**Components Used:**
- Time & Attendance section with permissions
- Expenses section
- Multiple permission indicators
- Green checkmarks for enabled access
- X marks for no access

**Color Usage:**
- Check marks: Green for "View only" access
- X marks: Red/coral for "No access"

---

### Image 276 - Permissions Page (Role Saved Toast)
**Page Type:** Permissions list with success feedback

**Components Used:**
- "Role saved" toast notification
- New role "Viewer lv. 1" visible in table
- "View all" link for members
- Two roles now in table

**Notable UX:** Immediate confirmation with role appearing in list

---

### Image 277 - Dashboard (Small Screen/Alternate View)
**Page Type:** Main dashboard

**Layout Pattern:** Three-column with cards

**Components Used:**
- "Good afternoon" greeting
- Tasks section with cards
- Gusties mascot with heart
- Payments in progress section
- Upcoming events
- Recommendations cards

---

### Image 278 - Dashboard with Sidebar Shortcuts Dropdown
**Page Type:** Dashboard with dropdown

**Components Used:**
- Sidebar shortcuts section expanded
- Shortcut items: People, Hiring, Learning

**Notable UX:** Quick access to configured shortcuts from sidebar

---

### Image 279 - People Directory Page
**Page Type:** Employee/contractor directory

**Layout Pattern:** Full-width data table with filters

**Components Used:**
- Tabs: Active, Onboarding, Offboarding, Dismissed, Collaborators
- Search input: "Search people"
- Select all checkbox with count "(2)"
- Data table with sortable columns
- "More" dropdown
- "Org chart" button (outlined)
- "Add person" button with dropdown arrow (teal)
- Filter link
- User avatars in table

**Table Columns:**
- Name (with avatar)
- Department
- Job title
- Worker type
- Country

**Status Examples:**
- Contractor
- Unpaid - Intern

**Notable UX:** Comprehensive people management with multiple organizational views

---

### Image 280 - Dashboard with Command Palette/Search
**Page Type:** Dashboard with command palette overlay

**Layout Pattern:** Floating command palette modal

**Components Used:**
- Search input at top
- "Shortcuts" section with "See more (118)" link
- Search suggestions with icons
- Recent/popular actions listed

**Suggested Actions:**
- Search Gusto help center
- Report a tax notice
- Run payroll
- View extra tax documents
- Tools to hire & onboard
- Manage company benefits

**Color Usage:**
- Icons: Various colors for different action types
- Links: Teal

**Notable UX:** Powerful command palette for quick navigation (Cmd+K style)

---

### Image 281 - Command Palette (No Results)
**Page Type:** Search with no results

**Components Used:**
- Search query: "asdfzxc"
- "No results for asdfzxc" message
- Alternative resources section:
  - Help Center link
  - Talk Shop blog link
  - App directory link
  - Recommendations link
- Keyboard shortcut hint at bottom

**Notable UX:** Helpful alternatives when search yields no results

---

### Image 282 - Command Palette (Search Results)
**Page Type:** Search with results

**Components Used:**
- Search query: "reports"
- Filtered shortcuts showing "See more (9)"
- Result items with icons:
  - Create custom payroll reports
  - View custom reports
  - Create custom employee reports
  - Generate a cash requirements reports
  - View all summary reports

**Notable UX:** Real-time search filtering with categorized results

---

### Image 283 - Calendar Modal (January 2026)
**Page Type:** Calendar overlay/widget

**Layout Pattern:** Modal calendar with week view

**Components Used:**
- Month navigation arrows
- "Today" button (outlined)
- Week day headers (Sun-Sat)
- Date grid with current day highlighted
- Event indicators (flags)
- Legend section at bottom

**Events Visible:**
- New Year's Day (Jan 1)
- Martin Luther King Day (Jan 19)

**Color Usage:**
- Today highlight: Teal border
- Event flags: Small flag icons

**Typography:**
- Month/Year: Large "Jan 2026"
- Day numbers: Clear numeric display

---

### Image 284 - Calendar Modal (February 2026)
**Page Type:** Calendar - February view

**Components Used:**
- Presidents' Day event visible (Feb 16)
- Same calendar structure

**Notable UX:** Bank holidays automatically displayed in calendar

---

### Image 285 - Calendar Modal (March 2026)
**Page Type:** Calendar - March view

**Components Used:**
- No visible events in March
- Cross-month dates visible (from Feb and Apr)

---

### Image 286 - Dashboard with User Menu Dropdown
**Page Type:** Dashboard with profile menu

**Components Used:**
- User menu dropdown in header
- Menu options:
  - Add company
  - Settings
  - App directory
  - Refer & earn
  - Upgrade
  - Help
  - Sign out

**Notable UX:** Standard account management dropdown pattern

---

### Image 287 - Sign In Page
**Page Type:** Authentication - Login

**Layout Pattern:** Split layout - Illustration left, form right

**Components Used:**
- Decorative illustration with plants and people
- Gusto logo at top
- "Sign In" heading
- Email input with "Forgot email" link
- Password input with visibility toggle and "Forgot password" link
- "Remember this device" checkbox
- "Continue" primary button (teal, full width)
- Social sign-in options: Google, Xero, Intuit
- "New to Gusto? Get Started" link
- "Need Help? Visit our help center" link

**Color Usage:**
- Illustration: Muted pastels with teal accents
- Primary button: Teal
- Links: Teal

**Typography:**
- Logo: Gusto wordmark
- Heading: Bold "Sign In"
- Links: Underlined teal

**Notable UX:** Friendly illustration creates welcoming atmosphere

---

### Image 288 - Personal Settings - My Profile
**Page Type:** User account settings

**Layout Pattern:** Sidebar + Settings cards

**Components Used:**
- Account section with Email, Password
- "Change" and "Check exposure" links
- Two-step authentication section:
  - Authenticator app (Disabled) - Set up link
  - Text message (Active) - Edit/Remove links
  - Photo ID backup (Disabled) - Add link
- Personal information section

**Security Features:**
- Multiple 2FA options
- Password exposure check

---

### Image 289 - Personal Settings - Notifications
**Page Type:** Notification preferences

**Layout Pattern:** Simple settings card

**Components Used:**
- Preferences card
- Emails section with summary
- Text messages section
- Voice calls section
- Edit links for each

**Notification Categories:**
- All account emails
- Offers and promotions
- Feedback and surveys
- Sales representative communications

---

### Image 290 - Change Password Modal
**Page Type:** Security modal - password change

**Components Used:**
- Modal title: "Change your account password"
- Current password field
- New password field with requirements
- Password requirements text
- "show" toggle links for each field
- New password confirmation field
- Cancel and Save buttons

**Password Requirements:**
- At least 8 characters
- Don't use password from another site
- Don't include personal info

**Notable UX:** Clear password requirements shown proactively

---

### Image 291 - Change Password (Strength Indicator)
**Page Type:** Password modal with validation

**Components Used:**
- Password fields filled (masked)
- Password strength indicator bar (green = Strong)
- "Password strength: Strong" label

**Color Usage:**
- Strength bar: Green for strong

**Notable UX:** Real-time password strength feedback

---

### Image 292 - Settings with Password Saved Toast
**Page Type:** Settings with success feedback

**Components Used:**
- "Password saved" toast notification
- Green checkmark
- Settings page visible behind

---

### Image 293 - Edit Email Preferences (Full View)
**Page Type:** Full-screen email preferences

**Layout Pattern:** Scrollable form with sections

**Components Used:**
- Back arrow navigation
- "Emails" page title
- Account emails section with radio buttons:
  - All emails
  - Action required and critical emails (selected)
  - Critical emails only
  - Custom
- Marketing emails section with checkboxes:
  - New features and updates
  - Offers and promotions
  - Feedback and surveys
  - Gusto sales representative communications
  - Unsubscribe from all marketing emails
- Cancel and Save buttons

**Color Usage:**
- Selected radio: Teal filled circle
- Checked checkboxes: Teal with checkmark

---

### Image 294 - Email Preferences (Same View)
**Page Type:** Email preferences (duplicate for comparison)

Same components as Image 293

---

### Image 295 - Email Preferences (Scrolled)
**Page Type:** Email preferences scrolled view

**Components Used:**
- Marketing emails section visible
- Same checkbox pattern

---

### Image 296 - Email Preferences (Unsubscribe Selected)
**Page Type:** Email preferences with unsubscribe

**Components Used:**
- "Unsubscribe from all marketing emails" selected
- All other marketing checkboxes become disabled/unchecked
- Visual feedback for bulk unsubscribe action

**Notable UX:** One-click unsubscribe from all marketing

---

### Image 297 - Notifications Settings (Updated Toast)
**Page Type:** Settings with success feedback

**Components Used:**
- "Email settings updated" toast notification
- Updated preferences summary showing selected options
- Green checkmark in toast

---

### Image 298 - Sign In Page (Variant)
**Page Type:** Login page

Same components as Image 287 - appears to be slight variation or same state

---

### Image 299 - Sign In Page (Variant)
**Page Type:** Login page

Same components as Image 287 - appears identical

---

## Summary of Unique UI Patterns Identified

### Layout Patterns

1. **Sidebar + Main Content** - Primary navigation pattern with collapsible sections
2. **Sidebar + Secondary Nav + Content** - Three-column for settings/configuration
3. **Split Screen Auth** - Illustration left, form right for authentication
4. **Modal Overlay** - Centered dialogs with semi-transparent backdrop
5. **Slide-Over Panel** - Full-height right-side panels for complex forms
6. **Command Palette** - Full-screen search/navigation overlay
7. **Multi-Step Wizard** - Progressive form with step indicators

### Component Library

**Navigation:**
- Icon-based sidebar with labels
- Breadcrumb-style secondary navigation
- Tab navigation with underline indicator
- Dropdown menus
- Command palette/spotlight search

**Forms & Inputs:**
- Text inputs with labels
- Search inputs with icons
- Password fields with visibility toggles
- Dropdown selectors (single and multi)
- Radio button groups with descriptions
- Checkbox groups
- Tag/chip inputs with X removal
- File upload areas (click or drag-drop)

**Data Display:**
- Sortable data tables
- Status indicators (colored dots)
- Badge/tag pills
- Cards with headers and Edit links
- Progress bars and indicators
- Avatar images in lists

**Feedback:**
- Toast notifications (bottom-left positioned)
- Inline validation errors (teal banner)
- Password strength meters
- Success checkmarks (green)
- Warning icons (yellow/orange)

**Actions:**
- Primary buttons (teal filled)
- Secondary buttons (white outlined)
- Link buttons (teal text)
- Icon buttons (three-dot overflow)
- Dropdown button (with arrow)

### Color System

**Primary Colors:**
- Teal: #0D9488 range (primary actions, links, selected states)
- White: Backgrounds, cards
- Dark Gray: Primary text, sidebar background

**Status Colors:**
- Green: Success, active, enabled
- Yellow/Orange: Warning, pending
- Red/Coral: Error, no access, destructive

**Accent Colors:**
- Light teal: Info banners, selected tags background
- Gray: Secondary text, disabled states, borders

### Typography Hierarchy

1. **Page Titles:** Large, bold (24-32px equivalent)
2. **Section Headers:** Medium bold (18-20px)
3. **Card Titles:** Bold (16px)
4. **Body Text:** Regular (14px)
5. **Labels:** Medium, often gray (12-14px)
6. **Helper Text:** Small, gray (12px)

### Spacing System

- Generous whitespace throughout
- Consistent padding in cards (16-24px)
- Clear visual hierarchy through spacing
- Adequate touch targets on interactive elements

### Key UX Patterns

1. **Progressive Disclosure** - Complex permissions expand only when needed
2. **Inline Editing** - Edit links within cards for quick changes
3. **Toast Notifications** - Non-blocking success/error feedback
4. **Empty States** - Helpful illustrations with clear CTAs
5. **Search-First Navigation** - Command palette for power users
6. **Step-by-Step Wizards** - Complex tasks broken into manageable steps
7. **Real-Time Validation** - Immediate feedback on form inputs
8. **Confirmation Summaries** - Review steps before final submission
9. **Keyboard Shortcuts** - Indicated in UI for power users
10. **Contextual Help** - Inline explanations and "Learn more" links

### Accessibility Considerations Observed

- Clear focus states expected
- Sufficient color contrast
- Icon + text labels for navigation
- Form field labels present
- Error messages descriptive
- Status communicated through text (not just color)

---

## Recommendations for Cardiva App

Based on this Gusto analysis, consider implementing:

1. **Toast Notification System** - Positioned bottom-left, dismissible, with success/error variants
2. **Command Palette** - Quick navigation via keyboard (Cmd/Ctrl + K)
3. **Settings Organization** - Card-based sections with inline Edit links
4. **Empty States** - Simple illustrations with clear messaging and single CTA
5. **Multi-Select Tags** - Chip/pill pattern with X removal and "Clear all"
6. **Progress Wizards** - For complex multi-step processes
7. **Password Strength Indicator** - Real-time feedback with color coding
8. **Status Dot Indicators** - Green/yellow/red for quick status scanning
9. **Slide-Over Panels** - For editing without full page navigation
10. **Consistent Teal Accent** - For primary actions, links, and selected states
