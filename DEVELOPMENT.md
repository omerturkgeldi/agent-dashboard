# CleanBase.Web

Admin dashboard for CleanBase.API. Next.js (App Router), TypeScript, Tailwind, shadcn/ui, next-intl.

## Run

```bash
cp .env.example .env.local   # API_URL = address of CleanBase.API
npm install
npm run dev                  # http://localhost:3000
```

The backend needs the roles/pagination/role-assignment endpoints, so run CleanBase.API from the same version.
In Development the API seeds a first SuperAdmin from `SeedAdmin` in `appsettings.Development.json`.

## How it works

- **Auth:** the browser never sees tokens. `/api/auth/login` stores them in httpOnly cookies, `/api/proxy/*`
  forwards API calls with the Bearer token and refreshes it once on a 401, `src/proxy.ts` redirects signed-out users
  to `/login`, renews an expired access token before rendering, and keeps users off pages their role cannot see.
  These are convenience checks, the backend enforces access.
- **API client:** `src/lib/api/*.ts`. `api<T>()` unwraps the backend's `{ data, errorMessage }` and throws `ApiError`
  with the (already translated) messages. Add an endpoint by adding a typed function next to the others.
- **Languages and translations** live in the backend database and are edited on the Translations page (roles
  SuperAdmin, Admin, Translator). Languages are dynamic: a language added there shows up in the language picker (with its
  flag) without a deploy. The chosen language is stored in the `NEXT_LOCALE` cookie (no URL prefix) and sent to the
  backend as `Accept-Language`, so backend error messages match the UI language.
  - `messages/en.json` is where a text is born: write the English text there and use it with `t("group.key")`.
    `messages/de.json` and `messages/tr.json` only ship the starting German and Turkish for a fresh database, they
    never overwrite what translators saved. At runtime the texts come from `GET /api/translations/bundle/{language}`
    (cached for a minute, dropped right away when you save on the Translations page); the bundled files are only a
    safety net when the backend cannot be reached, and English fills any gap.
  - **New texts reach the database** when you press "Scan code" on the Translations page, or run
    `npm run translations:sync` after a deploy (`API_URL`, `TRANSLATIONS_SYNC_EMAIL`, `TRANSLATIONS_SYNC_PASSWORD`;
    the account needs the Translator, Admin or SuperAdmin role). Every language gets an "untranslated" row and the
    translators get a notification. Changing an English text marks its translations "needs review".
  - **Excel:** the Translations page exports the texts (one language, only the missing ones, or all languages) as `.xlsx`
    and imports the filled-in file again: one column per language, empty cells and unchanged texts are skipped, texts
    with wrong placeholders are reported. Texts that came with the code and were never edited follow `messages/*.json`;
    once a person edits a text on the page or in Excel, the files never overwrite it.
- **Roles and menu:** `src/lib/config/nav.ts` lists pages and the roles that may see them. Role names mirror
  `CleanBase.Repositories/Constants/Roles.cs` (`src/lib/api/types.ts`).

## Audit and notifications

- **Audit** (`/audit`, SuperAdmin and Admin): who changed what and when, with old and new values. The backend records
  every insert/update/delete automatically plus logins, logouts and password and role changes.
- **Notifications** (bell in the header and `/notifications`): the backend stores a notification `type` and its `data`,
  and the text comes from `notifications.types.<type>` in `messages/*.json`, so it follows the user's language.
  To add one, send it from a backend service (`INotificationService`), add the type to `NotificationTypes` and add its
  message to every messages file. The unread count is polled every 30 seconds, there is no push channel yet.

## Tables

Every list uses one `DataTable` (`src/components/data-table`): search, multi-select filters with counts, sort and hide
columns, row menu, page size and paging. Give it TanStack Table `columns` and give each column `meta: { label }`
(that also gives it the standard header). Two modes:

- **Client-side** (default): pass all rows. Sorting, search (`searchable`), filters (`filters`) and paging run in the
  browser. See `app/(dashboard)/users/users-table.tsx`.
- **Server-side** (`server={{ page, pageSize, total, onPageChange }}`): the API pages the data, put your own filters in
  `toolbar`. Sorting is off because the API decides the order. See `app/(dashboard)/logs/logs-table.tsx`.

Page size: tables start with the user's "Default rows per page" (Settings). A server-side table gets it from
`useTablePageSize()` (`src/lib/preferences.ts`), a client-side one by itself; `initialPageSize` overrides it.

Also available: `DataTableRowActions` (the "..." menu), `createSelectColumn` (row selection checkboxes).

## Users and sessions

- The users table offers edit, deactivate/activate, reset password, sessions and delete, but only for users the signed-in
  user may manage (`src/lib/users/permissions.ts`, the same rule the backend enforces). Nothing is offered on your own row.
- Resetting a password: the admin types or generates the new password and passes it on (there is no e-mail). The user is
  signed out everywhere.
- The profile page lists your own sessions (devices) and can end them. The login route passes the browser's IP,
  User-Agent and country header on to the backend, because the backend only sees this server.
- The dashboard's "users online" card draws `src/components/world-map/paths.json`, generated by
  `npm run build:world-map` (no map library in the browser). Countries come from a proxy header, see the backend README.

## Layout and colors

- **Sidebar:** `src/lib/config/nav.ts` defines groups (one can be `pinned` to the bottom), links, collapsible parents,
  their roles and the highlighted quick action at the top. `Ctrl/Cmd + K` opens a command palette with the same
  pages the user's roles allow. The header logo
  is `components/layout/logo.tsx` (text from `lib/config/app.ts`). The signed-in user card sits at the bottom.
- **Colors:** one palette, in `src/app/globals.css`: a deep red accent (`--primary`) and a solid dark-red sidebar
  (`--sidebar*`), everything else neutral. The `.dark` block has the dark-mode versions (a slightly lighter accent and a
  darker sidebar). To recolor the app, change those variables. Light, dark and system mode are toggled in the header.
- **Layout:** the sidebar is a plain left column (it collapses to icons, or to a drawer on phones), so its color does
  not wrap around the page.

## Common tasks

- **Add a page:** create `src/app/(dashboard)/<name>/page.tsx`, add it to `nav.ts` (with its roles) and a `nav.<name>` message.
- **Add a language:** Translations page, "Add language". All existing texts get an empty translation right away.
- **Rename the app:** `appName` in `src/lib/config/app.ts`.
- **UI components:** `npx shadcn@latest add <component>`.
