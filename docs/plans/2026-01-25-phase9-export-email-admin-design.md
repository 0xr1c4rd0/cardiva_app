# Phase 9 Design: Export, Email & Admin Settings

**Created:** 2026-01-25
**Status:** Approved
**Scope:** Expanded Phase 9 with admin configuration capabilities

## Overview

This design expands the original Phase 9 (Export & Email) to include comprehensive admin configuration features. The core changes are:

1. Split the combined export/email modal into separate actions
2. Add admin-configurable email recipient settings
3. Add admin-configurable export field selection
4. Enhance admin user management (role changes, deletion)
5. Create admin settings page for all configuration

## 1. Export/Email UI Split

### Current State

Single "Exportar" button in `ConfirmationSummary` opens `ExportDialog` with both download and email functionality in one modal.

### New Design

**Dropdown trigger instead of single button:**

```tsx
// ConfirmationSummary.tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button disabled={!allDecided || !hasMatches}>
      Exportar <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setDownloadDialogOpen(true)}>
      <Download className="mr-2 h-4 w-4" />
      Transferir Excel
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
      <Mail className="mr-2 h-4 w-4" />
      Enviar por Email
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Two separate dialogs:**

| Dialog | Purpose | Contents |
|--------|---------|----------|
| `ExportDownloadDialog` | Direct Excel download | Export mode (matched/all) + Download button |
| `ExportEmailDialog` | Send via email | Export mode + Recipient config + Send button |

**Files to modify:**
- `confirmation-summary.tsx` — Replace Button with DropdownMenu
- `export-dialog.tsx` → Delete, replace with:
  - `export-download-dialog.tsx` (new)
  - `export-email-dialog.tsx` (new)

**Shared logic remains in:**
- `lib/export/rfp-export.ts` — `transformToExportRows`, `generateExcelBase64`, etc.

## 2. Email Configuration System

### Database Schema

New `app_settings` table (single-row pattern):

```sql
CREATE TABLE app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- ensures single row

  -- Email settings
  email_default_recipients TEXT[] DEFAULT '{}',  -- array of emails
  email_user_can_edit BOOLEAN DEFAULT true,
  email_defaults_replaceable BOOLEAN DEFAULT true,

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update settings"
  ON app_settings FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'user_role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

-- Insert default row
INSERT INTO app_settings (id) VALUES (1);
```

### Behavior Matrix

| `default_recipients` | `user_can_edit` | `defaults_replaceable` | User Experience |
|---------------------|-----------------|------------------------|-----------------|
| Empty | — | — | Empty input, user must add 1-10 emails |
| Has emails | `false` | — | Read-only chips, Send button only |
| Has emails | `true` | `false` | Locked chips + input to add more (max 10 total) |
| Has emails | `true` | `true` | Removable chips + input (max 10 total) |

### ExportEmailDialog Behavior

1. Fetch `app_settings` on mount
2. Render email chips based on configuration:
   - Read-only mode: chips with no X button, no input field
   - Add-only mode: locked chips + input field for additional emails
   - Replaceable mode: chips with X button + input field
3. Validate max 10 emails before enabling Send
4. Pass final recipient array to `sendExportEmail` server action

### Email Chip Component

```tsx
interface EmailChipProps {
  email: string
  removable: boolean
  onRemove?: () => void
}

function EmailChip({ email, removable, onRemove }: EmailChipProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      {email}
      {removable && (
        <button onClick={onRemove} className="ml-1 hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
```

## 3. Export Field Configuration

### Database Schema

```sql
CREATE TABLE export_column_config (
  id SERIAL PRIMARY KEY,
  source_table TEXT NOT NULL,              -- 'rfp_items' or 'rfp_match_suggestions'
  column_name TEXT NOT NULL,               -- actual DB column
  display_name TEXT NOT NULL,              -- Excel header
  visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  column_type TEXT DEFAULT 'text',         -- text, number, currency, date
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_table, column_name)
);

-- RLS policies
ALTER TABLE export_column_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read export config"
  ON export_column_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage export config"
  ON export_column_config FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'user_role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

-- Auto-discovery function
CREATE OR REPLACE FUNCTION sync_export_columns()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  col RECORD;
  col_order INT := 0;
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['rfp_items', 'rfp_match_suggestions']
  LOOP
    FOR col IN
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl
      ORDER BY ordinal_position
    LOOP
      INSERT INTO export_column_config (
        source_table, column_name, display_name, visible, display_order, column_type
      ) VALUES (
        tbl,
        col.column_name,
        INITCAP(REPLACE(col.column_name, '_', ' ')),
        CASE WHEN col.column_name IN ('id', 'created_at', 'updated_at', 'embedding')
             THEN false ELSE true END,
        col_order,
        CASE
          WHEN col.data_type IN ('numeric', 'decimal', 'money') THEN 'currency'
          WHEN col.data_type IN ('integer', 'bigint', 'smallint', 'real', 'double precision') THEN 'number'
          WHEN col.data_type IN ('timestamp', 'timestamptz', 'date', 'time') THEN 'date'
          ELSE 'text'
        END
      ) ON CONFLICT (source_table, column_name) DO NOTHING;
      col_order := col_order + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- Run initial sync
SELECT sync_export_columns();
```

### Export Generation Changes

Update `lib/export/rfp-export.ts`:

```typescript
// New function to fetch column config
async function getExportColumnConfig(): Promise<ExportColumnConfig[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('export_column_config')
    .select('*')
    .eq('visible', true)
    .order('display_order')
  return data || []
}

// Updated export function uses config
export async function transformToExportRows(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean,
  columnConfig: ExportColumnConfig[]
): ExportRow[] {
  // Build rows dynamically based on columnConfig
  // Use display_name as headers
  // Apply column_type formatting
}
```

## 4. Admin User Management Enhancements

### Current State

`/admin/users` shows:
- Pending users table with Approve/Reject buttons
- Approved users table (read-only)

### Enhancements

**Approved users table additions:**

| Column | Description |
|--------|-------------|
| Role dropdown | Select between "Utilizador" / "Admin" |
| Delete button | Remove user (disabled for current user) |

**New server actions:**

```typescript
// src/app/(dashboard)/admin/users/actions.ts

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error('Failed to update role')
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  // Check not deleting self
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.id === userId) {
    throw new Error('Cannot delete your own account')
  }

  // Delete via admin API (cascades to profiles)
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) throw new Error('Failed to delete user')
  revalidatePath('/admin/users')
}
```

**UI components:**

```tsx
// Role dropdown
<Select value={profile.role} onValueChange={(role) => updateUserRole(user.id, role)}>
  <SelectTrigger className="w-32">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="user">Utilizador</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
  </SelectContent>
</Select>

// Delete button (hidden for self)
{currentUserId !== user.id && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Eliminar utilizador?</AlertDialogTitle>
        <AlertDialogDescription>
          Tem a certeza que pretende eliminar {user.email}? Esta ação não pode ser revertida.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={() => deleteUser(user.id)}>
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

## 5. Admin Settings Page

### Route Structure

```
/admin
├── users/page.tsx      (existing - user management)
└── settings/page.tsx   (new - all configuration)
```

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Definições                                             │
│  Configurações gerais da aplicação                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ Configuração de Email                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Destinatários padrão:                             │  │
│  │ [chip@email.com ×] [outro@email.com ×] [+ Add]    │  │
│  │                                                   │  │
│  │ ☑ Utilizadores podem adicionar emails            │  │
│  │ ☑ Utilizadores podem substituir emails padrão    │  │
│  │                                                   │  │
│  │                                    [Guardar]      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ▼ Campos de Exportação                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ rfp_items                                         │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Campo      │ Nome      │ Visível │ Ordem │  │   │  │
│  │ │ produto    │ Produto   │   ✓     │   1   │  │   │  │
│  │ │ quantidade │ Qtd.      │   ✓     │   2   │  │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │ rfp_match_suggestions                             │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Campo      │ Nome      │ Visível │ Ordem │  │   │  │
│  │ │ artigo     │ Artigo    │   ✓     │   1   │  │   │  │
│  │ │ score      │ Confiança │   ✓     │   2   │  │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  │                                    [Guardar]      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ▼ Campos do Inventário                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ (Same table structure as export fields)           │  │
│  │ Uses existing inventory_column_config table       │  │
│  │                                    [Guardar]      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Navigation Update

Add to admin section in sidebar:

```tsx
// In sidebar config
{
  title: "Definições",
  url: "/admin/settings",
  icon: Settings,
}
```

## 6. Implementation Plan

### Phase 9 Revised: Export, Email & Admin Settings

| Plan | Description | Dependencies |
|------|-------------|--------------|
| 09-01 | Database migrations: `app_settings`, `export_column_config`, sync functions | None |
| 09-02 | Split ExportDialog → dropdown + ExportDownloadDialog | None |
| 09-03 | ExportEmailDialog with recipient configuration | 09-01, 09-02 |
| 09-04 | Export field configuration: update `rfp-export.ts` to use DB config | 09-01 |
| 09-05 | Admin settings page: email + export fields + inventory fields sections | 09-01 |
| 09-06 | Admin users enhancements: role dropdown + delete button | None |

### Wave Execution

```
Wave 1: 09-01, 09-02, 09-06 (independent)
Wave 2: 09-03, 09-04, 09-05 (depend on Wave 1)
```

### Requirements Coverage

| Requirement | Plan | Notes |
|-------------|------|-------|
| EXP-01: Export to Excel | 09-02 | Download dialog |
| EXP-02: Send via email | 09-03 | Email dialog with config |
| EXP-03: Export preview | 09-02 | Stats shown in dialogs |
| EXP-04: Configurable export | 09-04 | Admin field config |
| EXP-05: Export after confirmation | Existing | Already gated |
| NEW: Admin email config | 09-05 | Settings page |
| NEW: Admin export field config | 09-05 | Settings page |
| NEW: Admin user role management | 09-06 | Users page enhancement |
| NEW: Admin user deletion | 09-06 | Users page enhancement |

## 7. Files Summary

### New Files

```
src/app/(dashboard)/admin/settings/page.tsx
src/app/(dashboard)/rfps/components/export-download-dialog.tsx
src/app/(dashboard)/rfps/components/export-email-dialog.tsx
src/components/ui/email-chip-input.tsx (optional shared component)
supabase/migrations/YYYYMMDD_app_settings.sql
supabase/migrations/YYYYMMDD_export_column_config.sql
```

### Modified Files

```
src/app/(dashboard)/rfps/components/confirmation-summary.tsx
src/app/(dashboard)/rfps/components/export-dialog.tsx (delete)
src/app/(dashboard)/admin/users/page.tsx
src/app/(dashboard)/admin/users/user-actions.tsx
src/components/app-sidebar.tsx (add Settings link)
src/lib/export/rfp-export.ts
```

---

*Design approved: 2026-01-25*
