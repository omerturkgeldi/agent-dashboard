# CleanBase.Web

Admin dashboard for **CleanBase.API** (a .NET 8 backend). Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui,
next-intl, TanStack Query and TanStack Table.

It has no database of its own: everything (users, roles, logs, audit trail, notifications, translations) comes from the
backend API.

## Quick start

You need Node.js 20 or newer and a running CleanBase.API
([omerturkgeldi/agent-api](https://github.com/omerturkgeldi/agent-api)).

```bash
cp .env.example .env.local     # then set API_URL to the address of the backend
npm install
npm run dev                    # http://localhost:3000
```

Other commands: `npm run build` and `npm start` (production), `npm run lint`.

### With Docker

To run the dashboard, the backend and PostgreSQL together with one command, clone
[agent-api](https://github.com/omerturkgeldi/agent-api) next to this repo and run `docker compose up -d --build` in it
(its README has the details). The dashboard is then at http://localhost:3000. This repo's `Dockerfile` builds the
dashboard image; `API_URL` is read when the container starts.

To sign in on a fresh database, the backend creates a first SuperAdmin from its `SeedAdmin` setting
(`appsettings.Development.json`: `Email` and `Password`). The backend's own README explains how to run it. It needs
PostgreSQL with a **UTF-8** database.

## How it connects to the backend

One setting: **`API_URL`** in `.env.local` (default `http://localhost:5076`). It is read on the server only, so it is never
sent to the browser and the backend needs no CORS setup for this dashboard.

The browser never talks to the backend directly. It talks to this Next.js app, which forwards the calls:

```
Browser  ──►  Next.js (this project)  ──►  CleanBase.API
              /api/auth/*   sign in and out
              /api/proxy/*  every other API call
              /api/health   is the backend up?
```

The API client is in `src/lib/api/*.ts`, one file per area (users, roles, logs, audit, notifications, translations...).
`api<T>()` unwraps the backend's `{ data, errorMessage }` response and throws an `ApiError` carrying the messages, which
the backend has already translated. To use a new endpoint, add a typed function next to the others.

## How sign-in works

1. The login page posts email and password to `/api/auth/login`. This route calls the backend's `POST /api/auth/login`
   and passes on the visitor's IP, browser and country header (so the session list and the map show the real visitor).
2. The backend answers with an access token (short-lived) and a refresh token. **The browser never sees them**: they are
   stored in httpOnly cookies.
3. Every API call goes through `/api/proxy/*`, which adds the token as `Authorization: Bearer ...`. If the backend answers
   401, the proxy renews the tokens with the refresh token once and repeats the call.
4. `src/proxy.ts` runs before every page: signed-out visitors go to `/login`, an expired access token is renewed before
   the page renders, and users are kept away from pages their role may not see.
5. Signing out ends the session on the backend and removes the cookies.

A session ends when it is ended by the user (profile page) or an admin, when its user is deactivated or deleted, or when
the password is changed or reset. The backend checks this on every request, so it takes effect at once.

The redirects in step 4 are only convenience. **The backend is what enforces access.**

## Roles

| Role | Sees |
| --- | --- |
| SuperAdmin | everything, manages everybody else |
| Admin | everything except SuperAdmin-only actions; manages users who are not Admin or SuperAdmin |
| Tech | dashboard, logs |
| Translator | dashboard, translations |
| Employee | dashboard, notifications, profile |

Rules for managing users (edit, deactivate, reset password, end sessions, delete, change roles): nobody does it to their
own account, a SuperAdmin manages everybody else, an Admin manages only users who are not Admin or SuperAdmin and cannot
give those roles. The dashboard only offers what the signed-in user may do (`src/lib/users/permissions.ts`); the backend
enforces the same rule.

Which page needs which role is listed in `src/lib/config/nav.ts`. The role names must match the backend's
`Roles.cs`.

## Pages

- **Dashboard:** counts, users online on a world map (by country), activity and error charts, system status
  (API and database) for admins and Tech.
- **Users:** search, filter, sort; click a row to open a panel with the user's actions and open sessions.
  Create, edit, deactivate/activate, reset password, delete.
- **Roles**, **Logs**, **Audit** (who changed what), **Notifications**, **Profile** (change password, your own
  sessions), **Translations** (see below).
- `Ctrl/Cmd + K` opens a command palette. Light, dark and system theme, and a language switcher, are in the header.

## Languages and translations

Texts are stored in the backend database and edited on the **Translations** page (SuperAdmin, Admin, Translator). Add a
language there and it appears in the language picker with its flag, no deploy needed. The chosen language is kept in the
`NEXT_LOCALE` cookie and sent to the backend as `Accept-Language`, so the backend's error messages follow it.

- A new text is written in `messages/en.json` and used with `t("group.key")`. `messages/de.json` and `messages/tr.json`
  only give a fresh database its starting German and Turkish.
- New texts reach the database with the **Find new texts** button on the Translations page, or with
  `npm run translations:sync` after a deploy (needs `API_URL`, `TRANSLATIONS_SYNC_EMAIL` and
  `TRANSLATIONS_SYNC_PASSWORD` of a SuperAdmin, Admin or Translator).
- The Translations page can export texts to Excel and import them back.

## Customising

- **App name:** `appName` in `src/lib/config/app.ts`.
- **Colors:** the variables in `src/app/globals.css` (`--primary` is the accent, `--sidebar*` the sidebar; the `.dark`
  block holds the dark-mode versions).
- **Add a page:** create `src/app/(dashboard)/<name>/page.tsx`, add it to `nav.ts` with its roles and add a `nav.<name>`
  text.
- **UI components:** `npx shadcn@latest add <component>`.

More detail on tables, notifications, audit and layout is in [DEVELOPMENT.md](DEVELOPMENT.md).

## When something does not work

- **Sign-in fails or pages stay empty:** check `API_URL` and that the backend runs. Open
  `/api/health` in the browser: `{"api":"up","database":"up"}` means the backend and its database are fine.
- **Signed out again and again after the backend was reset:** sessions live in the backend database, sign in again.
- **Turkish or other special characters break in the backend:** its PostgreSQL database is not UTF-8.
- **Five wrong passwords:** the account is locked for 15 minutes; an admin resetting the password unlocks it.
