# Component Library & UI Rules

## Mandatory `shadcn/ui` Skill & Component Usage

Before writing, editing, or reviewing any UI code in this repository, read `./.agents/skills/shadcn/SKILL.md` and inspect `./src/components/ui/`.

1. **Always use `@/components/ui/*` components — NEVER plain HTML UI elements.**
   - Do **not** use raw HTML `<button>`, `<input>`, `<textarea>`, `<select>`, `<label>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `<hr>`, or hand-rolled alert/empty-state/dialog/skeleton `<div>` markup.
   - Always import the library components from `@/components/ui/*` (`Button`, `Input`, `Textarea`, `Select`, `NativeSelect`, `Label`, `Field`/`FieldLabel`/`FieldGroup`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`, `Separator`, `Alert`, `Empty`, `Dialog`, `AlertDialog`, `Skeleton`, `Spinner`, `Badge`, `Card`, `Tabs`, `ToggleGroup`, etc.).

2. **No plain HTML fallbacks without explicit user approval.**
   - If a needed UI component is missing from `./src/components/ui/`, **STOP** and report which component is missing to the user.
   - Do **not** silently fall back to plain HTML elements, custom inline markup, or unapproved placeholder components unless the user explicitly approves it.

3. **Installed Skills**
   - `./.agents/skills/shadcn/SKILL.md` (installed from `shadcn-ui/ui`, tracked in `./skills-lock.json`)
   - `./.agents/skills/migrate-radix-to-base/SKILL.md`

4. **Available `@/components/ui/*` Modules (58 components)**
   - Layout & Surfaces: `accordion`, `aspect-ratio`, `card`, `carousel`, `collapsible`, `resizable`, `scroll-area`, `separator`, `tabs`
   - Forms & Inputs: `button`, `button-group`, `calendar`, `checkbox`, `combobox`, `field`, `form`, `input`, `input-group`, `input-otp`, `label`, `native-select`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`
   - Data & Feedback: `alert`, `avatar`, `badge`, `chart`, `empty`, `item`, `kbd`, `progress`, `skeleton`, `sonner`, `spinner`, `table`
   - Navigation & Menus: `breadcrumb`, `command`, `context-menu`, `dropdown-menu`, `menubar`, `navigation-menu`, `pagination`, `sidebar`
   - Overlays & Utilities: `alert-dialog`, `dialog`, `direction`, `drawer`, `hover-card`, `morphing-dialog`, `popover`, `sheet`, `tooltip`
