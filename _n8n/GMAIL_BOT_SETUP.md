# Gmail Bot User Setup

## Overview

This guide explains how to set up the Gmail automation user for RFP uploads via email trigger.

## Step 1: Run the Database Migrations

Run these migrations in order:

```bash
# 1. Add automation role to user_role enum
# Run: supabase/migrations/20260128_add_automation_role.sql

# 2. Create the Gmail bot user with automation role
# Run: supabase/migrations/20260128_create_gmail_bot_user.sql
```

**IMPORTANT**: After running the second migration, note the UUID that's printed in the output:
```
Gmail Bot User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Step 2: Update n8n Workflow

### Update "Create Email RFP Job" Node

In your n8n workflow "Cardiva - Extract and compare", find the **"Create Email RFP Job"** Postgres node and update the columns mapping to include `user_id`:

**BEFORE:**
```json
{
  "file_name": "={{ $('Gmail Trigger').item.json.subject }}",
  "file_size": "={{ $('Extrai conteúdo').item.binary.attachment_0.fileSize }}",
  "status": "pending",
  "created_at": "={{ $now.toISO() }}",
  "updated_at": "={{ $now.toISO() }}"
}
```

**AFTER:**
```json
{
  "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "file_name": "={{ $('Gmail Trigger').item.json.subject }}",
  "file_size": "={{ $('Extrai conteúdo').item.binary.attachment_0.fileSize }}",
  "status": "pending",
  "created_at": "={{ $now.toISO() }}",
  "updated_at": "={{ $now.toISO() }}"
}
```

Replace `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` with the Gmail Bot User ID from Step 1.

### Configuration in n8n UI

1. Open your n8n workflow
2. Find the **"Create Email RFP Job"** node (Postgres Insert operation)
3. In the **Columns** section:
   - Click **Add Column**
   - Column Name: `user_id`
   - Column Value: Paste the Gmail Bot User ID (as plain text, not an expression)
4. Save the workflow

## Step 3: Verify the Setup

### Check the Gmail Bot User

In Supabase SQL Editor, verify the user was created:

```sql
-- Check the Gmail bot profile
SELECT id, email, first_name, last_name, role, approved_at
FROM profiles
WHERE role = 'automation';

-- Expected result:
-- id: the UUID from step 1
-- email: gmail-bot@cardiva.internal
-- first_name: Gmail
-- last_name: Bot
-- role: automation
-- approved_at: (timestamp)
```

### Test Email Upload

1. Send an email with a PDF attachment to your Gmail trigger address
2. Check the RFPs dashboard - the new RFP should show:
   - Uploader: "Gmail Bot"
   - Anyone can delete it (because it's uploaded by automation)
3. The Gmail Bot user should NOT appear in Admin > Users page

## How It Works

### Authorization Rules

With the automation role, the authorization logic now works as follows:

**Delete RFP Job:**
- ✅ User can delete their own jobs
- ✅ Admins can delete any job
- ✅ **Anyone can delete automation-uploaded jobs** (Gmail bot)

**View RFP File:**
- ✅ User can view their own jobs
- ✅ Admins can view any job
- ❌ Regular users cannot view automation-uploaded jobs (only admins)

### Users Page Filtering

The Admin > Users page automatically filters out automation users:
- Gmail bot won't appear in the users list
- Only regular users and admins are shown
- Automation users can't be managed through the UI

## Troubleshooting

### Migration Failed

If the migration fails with permission errors, you may need to create the user through Supabase Dashboard:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Email: `gmail-bot@cardiva.internal`
4. Password: Generate a random one (user won't login)
5. Email Confirm: Mark as confirmed
6. After creation, note the User ID
7. Run this SQL to update the profile:

```sql
UPDATE profiles
SET
  first_name = 'Gmail',
  last_name = 'Bot',
  role = 'automation',
  approved_at = NOW()
WHERE id = 'USER_ID_FROM_STEP_6';
```

### n8n Workflow Not Working

If RFPs aren't being created:

1. Check n8n execution logs for errors
2. Verify the user_id is a valid UUID (no extra quotes or spaces)
3. Test the workflow manually with the Workflow > Execute button
4. Check Supabase logs for any database errors

### Gmail Bot Appears in Users Page

If the bot appears in the users list:

1. Verify the profile role is set to 'automation':
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'gmail-bot@cardiva.internal';
   ```
2. If role is not 'automation', update it:
   ```sql
   UPDATE profiles SET role = 'automation' WHERE email = 'gmail-bot@cardiva.internal';
   ```
3. Clear your browser cache and refresh the page

## Alternative Approach: Manual Creation

If you prefer to create the user manually instead of using migrations:

### Step 1: Create through Supabase Dashboard

1. Go to Authentication > Users > Add user
2. Email: `gmail-bot@cardiva.internal`
3. Auto-generate password
4. Mark email as confirmed
5. Copy the generated User ID

### Step 2: Update Profile

```sql
-- Replace YOUR_USER_ID with the ID from step 1
UPDATE profiles
SET
  first_name = 'Gmail',
  last_name = 'Bot',
  role = 'automation',
  approved_at = NOW()
WHERE id = 'YOUR_USER_ID';
```

### Step 3: Proceed to n8n Update

Follow Step 2 from the main instructions above.
