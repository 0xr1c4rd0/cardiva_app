# Gusto UI/UX Analysis: Screenshots 300-362

## Overview
This analysis covers 63 screenshots from Gusto's web application (January 2026), documenting authentication flows, onboarding, employee self-service portal, and account management features.

---

## Individual Screenshot Analysis

### Image 300 - Sign In Page
- **Page Type**: Authentication / Login
- **Layout Pattern**: Split view - illustration on left, form on right
- **Components**:
  - Logo (gusto wordmark in coral/salmon color)
  - Email input field
  - Password input with visibility toggle
  - "Forgot email" and "Forgot password" links
  - "Remember this device" checkbox
  - Primary CTA button (teal/dark green)
  - Social sign-in options (Google, Xero, Intuit)
  - "New to Gusto?" link with "Get Started"
  - Help center link
- **Color Usage**:
  - Primary: Teal/dark green (#0A8080 approx) for CTAs
  - Accent: Coral/salmon for logo
  - Neutral: White background, gray text
- **Typography**: Sans-serif, clean hierarchy with bold headings
- **Spacing**: Generous whitespace, centered form card
- **Illustration**: Whimsical office scene with people, plants, desks
- **Notable UX**: Multiple authentication options, clear password recovery paths

### Image 301 - Verify Identity (2FA Method Selection)
- **Page Type**: Two-factor authentication
- **Layout Pattern**: Split view - illustration left, form right
- **Components**:
  - Radio buttons for SMS vs WhatsApp
  - Phone number partially masked (XXX-7552)
  - Continue button (teal)
  - Back link
- **Notable UX**: Clear method selection with radio buttons, WhatsApp as modern alternative

### Image 302 - Enter Verification Code (Empty)
- **Page Type**: OTP entry
- **Layout Pattern**: Split view
- **Components**:
  - 6-digit code input field
  - "Need a new code?" section with Send again/Call me buttons
  - "Have a new phone number?" recovery option
- **Notable UX**: Multiple code recovery options, clear instructions

### Image 303 - Enter Verification Code (Filled)
- **Page Type**: OTP entry (filled state)
- **Components**: Same as 302, code field shows "951737"
- **Notable UX**: Shows filled state interaction

### Image 304 - Add Passkey Prompt
- **Page Type**: Passkey setup prompt
- **Layout Pattern**: Split view, simplified
- **Components**:
  - Clear explanation text
  - Continue button (teal)
  - "Remind me later" link
- **Notable UX**: Non-intrusive passkey promotion, easy skip option

### Image 305 - Loading State
- **Page Type**: Loading/transition
- **Layout Pattern**: Centered content
- **Components**:
  - Top navigation bar with hamburger, logo, calendar, gift icon, user avatar
  - Animated pig mascot illustration (teal sweater)
  - Footer with copyright and links
- **Notable UX**: Branded loading animation with character mascot
- **Empty State**: Uses playful illustration during load

### Image 306 - Password Setup
- **Page Type**: Account setup / password creation
- **Layout Pattern**: Split view
- **Components**:
  - Welcome message with company name
  - Password field with "Show all" toggle
  - Re-enter password field
  - Password requirements text (8+ characters)
  - Continue button
- **Notable UX**: Clear password requirements upfront

### Image 307 - Password Strength: Too Short
- **Page Type**: Password creation (validation state)
- **Components**:
  - Password field with masked entry
  - Password strength indicator: "Too Short" in red/coral
  - Suggestion: "Add another word or two"
- **Color Usage**: Red/coral for error state
- **Notable UX**: Real-time password strength feedback

### Image 308 - Password Strength: Strong
- **Page Type**: Password creation (success state)
- **Components**:
  - Password field showing strength: "Strong" in green
  - Re-enter password field
  - Continue button (now teal/active)
- **Color Usage**: Green for success state
- **Notable UX**: Clear visual feedback for password strength

### Image 309 - Two-Step Authentication Setup
- **Page Type**: 2FA onboarding
- **Layout Pattern**: Centered content with illustration
- **Components**:
  - Large heading explaining 2FA
  - Illustration of hand holding phone with lock
  - "Set up two-step authentication" button (outlined, teal border)
  - Explanation sections with Q&A format
  - External link to security study
- **Notable UX**: Educational approach to security, links to external research

### Image 310 - Personal Information Form (Step 1 of 5)
- **Page Type**: Onboarding wizard / form
- **Layout Pattern**: Full-width form with progress indicator
- **Components**:
  - Progress bar (teal)
  - Step indicator "Step 1 of 5"
  - Text inputs: Preferred first name, Legal first/middle/last name
  - Pronouns dropdown
  - Tax ID input with international context help
  - Birthday date picker with calendar icon
  - "Display birthday to coworkers" checkbox
  - Recovery email field
  - Country code dropdown with phone input
- **Color Usage**: Teal progress bar
- **Typography**: Clear field labels with helper text
- **Notable UX**: Preferred vs legal name distinction, privacy controls for sharing

### Image 311 - Personal Information Form (Continued)
- **Page Type**: Onboarding wizard continuation
- **Components**:
  - Phone number section with country code
  - "Display phone number to coworkers" checkbox
  - Address fields: Country, Street, City, Postal code
  - Terms agreement checkbox with links
  - "Save and continue" button (teal)
- **Notable UX**: Clear international support, privacy toggles

### Image 312 - Payment Details (Step 2 of 5)
- **Page Type**: Onboarding - payment setup
- **Layout Pattern**: Full-width form
- **Components**:
  - Payment method dropdown
  - Success toast: "Personal information saved" (green checkmark)
  - Back/Save and continue button pair
- **Toast Pattern**: Bottom-left, light green background, checkmark icon
- **Notable UX**: Step progress visible, confirmation feedback

### Image 313 - Documents (Step 3 of 5)
- **Page Type**: Document management
- **Layout Pattern**: Table list
- **Components**:
  - Simple table with Name, Status, Actions columns
  - Document row with "Needs signing" status (yellow dot)
  - "Sign" action link (teal)
  - Sort indicators on columns
- **Status Colors**: Yellow/amber for pending actions
- **Notable UX**: Clear action items with status indicators

### Image 314 - Extras (Step 4 of 5)
- **Page Type**: Optional profile settings
- **Layout Pattern**: Card-based sections
- **Components**:
  - Profile photo card with placeholder illustration and edit icon
  - Emergency contact card with Edit link
  - Back/Continue button pair
- **Notable UX**: Optional fields clearly separated, visual placeholder for photo

### Image 315 - Review Information (Step 5 of 5 - Personal)
- **Page Type**: Review/summary
- **Layout Pattern**: Organized data display
- **Components**:
  - Section card for "Personal" with Edit link
  - Key-value pairs for all personal data
  - Sensitive data (Tax ID, email, phone) partially masked
- **Notable UX**: Clear review before final submission, edit access

### Image 316 - Review Information (Payment Section)
- **Page Type**: Review/summary continuation
- **Components**:
  - Personal section continued
  - Payment section with method and bank account
  - Back/Save button pair
- **Notable UX**: All sections reviewable before completion

### Image 317 - Home Dashboard (Anniversary Message)
- **Page Type**: Dashboard / Home
- **Layout Pattern**: Sidebar + main content
- **Components**:
  - Left sidebar: Home, My profile, Pay, Documents
  - Greeting: "Happy anniversary" message
  - Tasks section with empty state
  - Success toast: "Setup completed"
- **Navigation**: Icon + text sidebar items
- **Empty State**: Paper airplane illustration with "All caught up" message
- **Notable UX**: Personalized greeting, clear task status

### Image 318 - Home Dashboard (Full View)
- **Page Type**: Dashboard / Home
- **Layout Pattern**: Sidebar + main content
- **Components**:
  - Full sidebar visible with Help and Settings at bottom
  - "Good morning" greeting with team context
  - Tasks empty state
- **Illustration**: Same paper airplane for empty tasks
- **Notable UX**: Time-based greeting, team context

### Image 319 - 2FA Setup - Method Selection (Step 1 of 3)
- **Page Type**: Security setup wizard
- **Layout Pattern**: Centered form
- **Components**:
  - Progress bar
  - Radio button selection
  - Authentication app option marked "Recommended"
  - Text message/call option
  - Info card about Google Authenticator with iOS/Android links
  - Continue button
- **Notable UX**: Clear recommendation for more secure option

### Image 320 - 2FA Setup - QR Code (Step 2 of 3)
- **Page Type**: Authenticator setup
- **Layout Pattern**: Centered with QR code
- **Components**:
  - Large QR code
  - Step-by-step instructions (numbered list)
  - Alternative: "Enter a setup key" with code
- **Notable UX**: Clear instructions, manual key backup option

### Image 321 - 2FA Setup - Enter Code (Empty)
- **Page Type**: Authenticator verification
- **Components**:
  - QR code displayed above
  - Setup key in copyable format
  - 6-digit code input
  - "Remember device to skip two-step authentication" checkbox
  - Back/Confirm button pair
- **Notable UX**: Copy button for setup key, device trust option

### Image 322 - 2FA Setup - Enter Code (Filled)
- **Page Type**: Authenticator verification (filled)
- **Components**: Same as 321, code shows "222284"

### Image 323 - 2FA Setup - Backup Phone (Step 3 of 3)
- **Page Type**: Backup 2FA setup
- **Components**:
  - Success toast: "Two-factor authentication has been set up successfully"
  - Phone input for backup
  - Legal disclaimer about SMS rates
  - Done/Continue button pair (outline/filled)
- **Notable UX**: Backup method as optional but encouraged

### Image 324 - 2FA Setup - Backup Phone (Filled)
- **Page Type**: Backup phone (filled state)
- **Components**: Same as 323, phone shows "+1 (650)"

### Image 325 - 2FA Backup Verification (Step 4 of 4)
- **Page Type**: Backup verification
- **Components**:
  - Verification code input
  - Phone number displayed
  - "Need a new code?" section with Send message/Call me buttons
  - Back/Confirm button pair
- **Notable UX**: Multiple code delivery options

### Image 326 - 2FA Backup Verification (Filled)
- **Page Type**: Backup verification (filled)
- **Components**: Same as 325, code shows "787295"

### Image 327 - Documents List (Signed)
- **Page Type**: Document management
- **Layout Pattern**: Table with status column
- **Components**:
  - Document with "Signed" status (blue dot)
  - Date displayed
  - View action link
- **Status Colors**: Blue for completed/signed
- **Notable UX**: Clear status progression

### Image 328 - Personal Information (Edit View)
- **Page Type**: Profile edit
- **Layout Pattern**: Form with progress
- **Components**:
  - All personal fields pre-filled
  - Date picker showing formatted date (12/29/1995)
  - Privacy checkboxes
- **Notable UX**: Edit access from onboarding flow

### Image 329 - Address Form (Edit)
- **Page Type**: Profile edit continuation
- **Components**:
  - Address fields pre-filled
  - Terms checkbox (already agreed)
  - Save and continue button

### Image 330 - Payment Details (Wire Transfer)
- **Page Type**: Payment setup form
- **Layout Pattern**: Detailed banking form
- **Components**:
  - Payment method dropdown showing "Wire - Account in Singapore, paid in SGD"
  - Wire details section
  - Account holder name, number, confirm number
  - Bank name
  - SWIFT/BIC code with explanation
  - Info alert: "Double check your information" with warning
- **Alert Pattern**: Blue info icon, light background
- **Notable UX**: International wire support, validation warning

### Image 331 - Payment Details (Filled)
- **Page Type**: Payment setup (filled)
- **Components**: All fields filled with sample data
- **Notable UX**: Clear Save and continue progression

### Image 332 - Sign Document (W-8BEN Form - Top)
- **Page Type**: Document signing
- **Layout Pattern**: Full-width document view
- **Components**:
  - Document header with name and field count
  - "Get started" button (teal)
  - "View document" link
  - Embedded PDF preview
  - "I agree to electronically sign this form" checkbox
- **Notable UX**: Electronic signature flow with consent

### Image 333 - Sign Document (W-8BEN - Middle)
- **Page Type**: Document signing (scrolled)
- **Components**:
  - Document content with form fields
  - "Sign Here" section
  - Pre-filled certification section
  - Next button progress
- **Notable UX**: Guided signing experience

### Image 334 - Sign Document (Signature Applied)
- **Page Type**: Document signing (signed state)
- **Components**:
  - Electronic signature checkbox checked (teal checkmark)
  - Signature applied in document
- **Notable UX**: Clear completion state

### Image 335 - Sign Document (Validation Error)
- **Page Type**: Document signing (error state)
- **Layout Pattern**: With error message
- **Components**:
  - Error message: "Please fix the highlighted missing/invalid field"
  - Cancel/Finish button pair
  - Electronic signature checkbox
- **Color Usage**: Red/coral for validation errors
- **Notable UX**: Inline validation before completion

### Image 336 - My Profile (Work Section)
- **Page Type**: Profile view
- **Layout Pattern**: Sidebar + tabbed content
- **Components**:
  - Profile header with photo, name, role
  - Information tabs: Work, Pay, Personal
  - Role card: Job title, Department, Manager
  - Work card: Worker type, Country, Start date
  - "View work summary" link
  - Work address card
- **Navigation**: Vertical tabs within content area
- **Notable UX**: Organized information categories

### Image 337 - Edit Profile Photo Modal
- **Page Type**: Modal overlay
- **Layout Pattern**: Centered modal with backdrop
- **Components**:
  - Modal title: "Edit profile photo"
  - Upload button with plus icon
  - "or drop file" text
  - Cancel/Save button pair
- **Modal Pattern**: White card, gray overlay, close X optional
- **Notable UX**: Drag-and-drop support

### Image 338 - Edit Profile Photo (Cropped)
- **Page Type**: Photo crop modal
- **Components**:
  - Circular crop overlay on uploaded photo
  - Drag handles for resizing
  - Cancel/Save buttons
- **Notable UX**: Circular crop for profile photos

### Image 339 - Profile Photo Saved
- **Page Type**: Profile view (updated)
- **Components**:
  - Profile showing new photo
  - Success toast: "Profile photo saved"
- **Toast Pattern**: Green checkmark, bottom-left

### Image 340 - Profile (Photo Updated)
- **Page Type**: Profile view
- **Components**: Same as 336 with updated photo avatar

### Image 341 - Pay Section (Payment History)
- **Page Type**: Payment history / list
- **Layout Pattern**: Sidebar + searchable table
- **Components**:
  - Search input: "Search Payments"
  - Columns/Status filter buttons
  - Table: Payday, Payment method, Status, Wage, Total
  - Status with colored dot and "See details" link
- **Notable UX**: Searchable, filterable payment history

### Image 342 - Payment Status Details (Slide-over)
- **Page Type**: Slide-over panel / drawer
- **Layout Pattern**: Right-side drawer over dimmed content
- **Components**:
  - Timeline/stepper showing payment stages
  - Status badges: "Payment was canceled" (red/coral)
  - Detailed explanations for each step
  - Close X button
- **Timeline Pattern**: Vertical with status icons
- **Notable UX**: Full payment journey visibility

### Image 343 - Documents Section
- **Page Type**: Document management
- **Layout Pattern**: Searchable list
- **Components**:
  - "Add document" button (teal, primary)
  - Filter and Columns buttons
  - Search input
  - Document table with Status and Actions
- **Notable UX**: Employee self-service document upload

### Image 344 - Add Document Modal (Empty)
- **Page Type**: Document upload modal
- **Components**:
  - Name input with helper text
  - Document upload area with Upload button
  - "or drop file" text
  - Cancel/Save buttons (Save disabled)
- **Notable UX**: Clear naming guidance

### Image 345 - Add Document Modal (Named)
- **Page Type**: Document upload (partially filled)
- **Components**: Name field filled: "Employee Agreement"

### Image 346 - Add Document Modal (File Selected)
- **Page Type**: Document upload (file attached)
- **Components**:
  - File chip showing filename with X to remove
  - PDF icon indicator
- **Notable UX**: Clear file selection confirmation

### Image 347 - Documents (Document Added)
- **Page Type**: Documents list (updated)
- **Components**:
  - New document row with "Uploaded" status
  - Success toast: "Document added"
  - Three-dot menu for actions
- **Status Colors**: Blue for uploaded status

### Image 348 - Documents List (Standard View)
- **Page Type**: Documents list
- **Components**: Clean list with multiple documents, different statuses

### Image 349 - Document Actions Menu
- **Page Type**: Documents with dropdown
- **Components**:
  - Context menu: View, Delete
  - Simple text menu items
- **Dropdown Pattern**: Shadow, white background, text items

### Image 350 - Delete Confirmation Modal
- **Page Type**: Destructive confirmation modal
- **Layout Pattern**: Centered modal
- **Components**:
  - Warning title: "Are you sure you want to delete the document?"
  - Consequence explanation
  - Document name in bold
  - "No, go back" button (outline)
  - "Yes, delete" button (teal/red variant)
- **Notable UX**: Clear consequences, document name highlighted

### Image 351 - Document Deleted Confirmation
- **Page Type**: Documents list (after delete)
- **Components**:
  - Document removed from list
  - Success toast: "Document deleted"
- **Notable UX**: Clear feedback after destructive action

### Image 352 - Settings - Security Tab
- **Page Type**: Settings / Account security
- **Layout Pattern**: Sidebar + tabbed content
- **Components**:
  - Personal tabs: Security, Privacy
  - Account section: Email with change/check exposure
  - Password with change option
  - Two-step authentication section
  - Authenticator app, Text message status cards
  - Photo ID backup option
  - Recent account activity table
- **Notable UX**: Comprehensive security management

### Image 353 - User Dropdown Menu
- **Page Type**: Dashboard with user menu
- **Layout Pattern**: Dropdown from user avatar
- **Components**:
  - User name and organization
  - Menu items: My account, Sign out
- **Dropdown Pattern**: Right-aligned, shadow, simple options

### Image 354 - Gusto Wallet Overview
- **Page Type**: Employee portal / overview
- **Layout Pattern**: Header card + sections
- **Components**:
  - Teal/green header with illustration
  - "Your work, all in one place" tagline
  - Recent payments section with View all link
  - Payment card showing date, company, amount
  - Work timeline section with Sign in button
- **Illustration**: Workplace scene with people and charts
- **Notable UX**: Unified work view concept

### Image 355 - Payments Detail Page
- **Page Type**: Payments list
- **Layout Pattern**: Clean table
- **Components**:
  - Back navigation arrow
  - Company column with avatar/initials
  - Status indicators
- **Notable UX**: Multi-company payment view

### Image 356 - Wallet User Menu
- **Page Type**: Wallet with dropdown
- **Components**:
  - Extended menu: Switch company, Add company, Settings, Sign out
- **Notable UX**: Multi-company support

### Image 357 - Companies Selection
- **Page Type**: Company switcher
- **Layout Pattern**: Centered list
- **Components**:
  - Search companies input
  - Company card with avatar, name, role
  - "Make primary" link
  - "Sign in" button (outline)
  - "Not the company you're looking for?" section
  - Alternative sign-in link
- **Notable UX**: Multi-company access management

### Image 358 - Primary Profile Confirmation Modal
- **Page Type**: Confirmation modal
- **Components**:
  - Clear question about updating primary profile
  - Member type noted (Team member)
  - No, go back / Yes, update button pair
- **Notable UX**: Clear action confirmation

### Image 359 - Primary Profile Updated
- **Page Type**: Companies list (updated)
- **Components**:
  - "Primary" badge on selected company
  - Success toast: "Primary profile updated"
  - Sign in button now teal/filled
- **Notable UX**: Clear primary designation

### Image 360 - Add Company Form
- **Page Type**: Company onboarding
- **Layout Pattern**: Centered form
- **Components**:
  - Admin first/last name inputs
  - Company name input
  - Radio buttons for payroll status
  - Terms agreement text with links
  - Save button
- **Notable UX**: Guided company addition

### Image 361 - Add Company (Filled)
- **Page Type**: Company onboarding (filled)
- **Components**: Form with sample data entered

### Image 362 - Companies List (Multiple)
- **Page Type**: Company list (multiple companies)
- **Components**:
  - Multiple company cards
  - Different avatars (initials-based)
  - Primary badge indicator
  - Make primary option for secondary companies
  - Success toast: "Company created"
- **Notable UX**: Clear multi-company management

---

## Summary of Unique Patterns

### Layout Patterns
1. **Split View (Auth)**: Illustration left, form right - used for all authentication pages
2. **Sidebar + Main Content**: Dashboard pattern with left navigation
3. **Centered Form**: Used for wizards and focused tasks
4. **Tabbed Content**: Within profile and settings sections
5. **Slide-over/Drawer**: Right-side panel for details (payment status)

### Component Library

#### Navigation
- Hamburger menu icon
- Vertical sidebar with icons + text
- Horizontal tabs within content areas
- Back arrow for drill-down pages
- Breadcrumb-style page titles

#### Forms
- Text inputs with floating/above labels
- Password fields with visibility toggle
- Dropdowns with search capability
- Date pickers with calendar icon
- Radio buttons (circle, teal fill when selected)
- Checkboxes (square, teal checkmark when checked)
- File upload areas with drag-drop
- Country code selectors

#### Buttons
- Primary: Teal fill, white text
- Secondary/Outline: White/transparent fill, teal border and text
- Destructive: Follows same pattern but contextual
- Link style: Teal text, underline on hover

#### Status Indicators
- Colored dots: Yellow (pending), Blue (completed/signed), Blue (canceled)
- Status badges/pills
- Progress bars (teal fill)
- Step indicators ("Step X of Y")

#### Feedback
- Success toasts: Green checkmark, light green background, bottom-left
- Info alerts: Blue icon, light blue background
- Error messages: Red/coral text
- Password strength: Color-coded (red, green)

#### Tables
- Sort indicators on headers
- Status columns with colored dots
- Action links (teal)
- Search input above
- Filter/Columns buttons

#### Modals
- Centered with backdrop
- Close X button
- Cancel/Confirm button pair
- Destructive with clear warnings

#### Cards
- White background, subtle border/shadow
- Section headings with Edit links
- Information displayed as key-value pairs

### Color Palette
- **Primary**: Teal (#0A8080 approximately)
- **Brand/Logo**: Coral/Salmon
- **Success**: Green
- **Warning/Pending**: Yellow/Amber
- **Error**: Red/Coral
- **Info**: Blue
- **Neutral**: White, Light gray backgrounds, Dark gray text

### Typography
- Sans-serif font family (likely custom or Inter-like)
- Clear hierarchy: Large headings, medium subheadings, regular body
- Bold for emphasis and labels
- Gray helper text below fields

### Spacing & Whitespace
- Generous padding in cards and forms
- Clear separation between sections
- Comfortable line heights
- Mobile-friendly touch targets

### Empty States
- **Paper airplane**: "All caught up" for tasks
- **Pig mascot**: Loading animation
- **Placeholder illustrations**: Profile photos, document areas

### Interaction Patterns
- Real-time validation (password strength)
- Progressive disclosure (step-by-step wizards)
- Confirmation modals for destructive actions
- Toast notifications for success feedback
- Inline help text and links
- Multiple authentication options
- Privacy controls (display to coworkers toggles)

### Notable UX Decisions
1. **Preferred vs Legal Name**: Thoughtful distinction for workplace identity
2. **Privacy Toggles**: User control over what coworkers see
3. **Multi-company Support**: Seamless switching between companies
4. **International Support**: Wire transfers, country codes, multiple currencies
5. **Security Education**: Explaining why 2FA matters with external research links
6. **Passkey Promotion**: Modern auth without being pushy
7. **Document Signing Flow**: Guided experience with consent
8. **Payment Timeline**: Full visibility into payment status journey

---

## Design System Observations

### Consistency
- Highly consistent component usage across all screens
- Predictable button placement (primary right, secondary left)
- Uniform toast notification system
- Consistent use of teal as primary action color

### Accessibility Considerations
- Clear focus states visible
- Good color contrast
- Label associations with form fields
- Status communicated via text + color (not color alone)

### Responsive Hints
- Form widths constrained for readability
- Touch-friendly button sizes
- Clear hit areas on interactive elements
