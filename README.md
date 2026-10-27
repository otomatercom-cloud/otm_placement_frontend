# Placement Console (Next.js)

A Next.js 16 frontend for the `otm_placement_management` Odoo module:

- **Staff dashboard** (`/dashboard`, `/candidates`, `/slots`, `/interviews`) —
  candidate pipeline, interview slot availability, mock-interview tracking,
  a performance chart, a mini calendar and animated KPI tiles. **Requires
  staff sign-in** (see section 1d) — a visitor without a valid session is
  redirected to `/login`.
- **Candidate self-service** (`/c/register`, `/c/book`, `/c/status/[token]`) —
  no login required, identity is the same `access_token` the existing
  website pages already use. Left intentionally open to the public, same
  as the existing website pages.

Architecture matches the Car Wash / `fly` deployment already running on the
Otomater server: Next.js is a **BFF (backend-for-frontend)**. The browser
never talks to Odoo directly — every Odoo call happens server-side, inside
this app's `/api/*` route handlers and Server Components, using two
different mechanisms:

1. **JSON-2 API** (`src/lib/odoo.ts` → `odooCall`) for ordinary reads/writes
   on Odoo models (dashboard stats, candidate/slot/interview lists) — bearer
   token + `X-Odoo-Database` header, same shape as every other
   Otomater Next.js integration.
2. **BFF controller routes** (`src/lib/odoo.ts` → `odooBffCall`) for
   candidate self-service actions (register, book a slot, check status).
   These hit a small new controller shipped with the Odoo module itself
   (`otm_placement_management/controllers/api_bff.py`), secured by a shared
   secret header instead of the JSON-2 key, so booking keeps using the
   exact same validated, atomic model methods (`book_slot`, the one-active-
   interview rule, email/WhatsApp notifications) the public website pages
   already rely on — nothing was reimplemented in JavaScript.

## 1. Odoo-side setup

### 1a. Install the updated module

Two files were added/changed in `otm_placement_management`:

- `controllers/api_bff.py` (new)
- `controllers/__init__.py` (added one import line)

Deploy these to the server and **upgrade the module**:

```bash
# on the Odoo server
sudo -u odoo /path/to/odoo-bin -c /etc/odoo/odoo.conf -d <your_db> -u otm_placement_management --stop-after-init
sudo systemctl restart odoo
```

### 1b. Set the BFF shared secret

Settings → Technical → Parameters → System Parameters → New:

| Key | Value |
|---|---|
| `otm_placement_management.bff_secret` | a long random string, e.g. output of `openssl rand -hex 32` |

Put the **same value** in the Next.js app's `ODOO_BFF_SECRET` env var (below).

### 1c. Create a JSON-2 API service user

The dashboard/candidates/slots/interviews pages read Odoo models directly
via the JSON-2 API, so they need their own service user — never reuse an
admin's personal API key.

1. Settings → Users & Companies → Users → New:
   - Name: `Placement Console API`
   - Login: `placement-console-api@logicschool.local` (or similar; needs no
     real mailbox)
   - Under **Odoo 19 this is `group_ids`, not the pre-19 `groups_id`** — add
     this user to the **Placement / Manager** group (`group_placement_manager`)
     so it can read candidates, slots and interviews. Do **not** give it the
     Administrator group.
2. On that user's form, open the **Account Security** tab → **New API Key**.
   - Odoo 19 **requires an expiry date** on API keys — pick one (e.g. 1 year
     out) and put a reminder to rotate it before it expires.
   - Copy the generated key immediately; Odoo shows it only once.
3. Test it works **as this user, over HTTP** — not as admin in
   `odoo-bin shell`, which hides real access-control gaps:

   ```bash
   curl -X POST https://your-odoo-host/json/2/otm.placement.candidate/search_count \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer <the_api_key>" \
     -H "X-Odoo-Database: <your_db>" \
     -d '{"domain": []}'
   ```

   If this returns a number, the key and group are correct. If it 403s,
   recheck the group assignment.

### 1d. Staff login

Staff sign in with their **own Odoo username and password** — there's no
separate user database in the Next.js app. On submit, the app calls Odoo's
own `/web/session/authenticate` endpoint (the same one the Odoo web client
uses) to check the password, then confirms the user is in one of the
Placement groups (`group_placement_user`, `group_placement_manager` or
`group_placement_administrator`) using the JSON-2 service key from step 1c
— so nothing extra needs to be configured here, as long as 1c is done and
the staff member's Odoo account is in a Placement group. A signed,
http-only session cookie is then set for 10 hours; it never stores the
Odoo session itself.

**Nothing to install for this step** — it reuses the module's existing
groups and the JSON-2 key. Just make sure each staff member's Odoo user is
assigned to a Placement group (Settings → Users).

## 2. Next.js app configuration

Copy `.env.local.example` to `.env.local` and fill in:

```bash
ODOO_BASE_URL=https://erp.logicschool.example.com   # no trailing slash
ODOO_API_KEY=<the JSON-2 API key from step 1c>
ODOO_DB=<your Odoo database name>
ODOO_BFF_SECRET=<the same secret set in step 1b>
AUTH_SECRET=<a different random string, e.g. `openssl rand -hex 32`>
```

## 3. Local build & run

```bash
npm install
npm run build
npm run start   # production server on :3000
```

## 4. Deploy on the Otomater server (same pattern as `/opt/fly`)

```bash
# one-time
mkdir -p /opt/placement-console
# copy the built app (or the whole project + run npm ci && npm run build on the server)
cd /opt/placement-console
npm ci
npm run build

# write env vars
cat > .env.local <<'EOF'
ODOO_BASE_URL=https://erp.logicschool.example.com
ODOO_API_KEY=...
ODOO_DB=...
ODOO_BFF_SECRET=...
EOF

# run under pm2, same as the `fly` process
pm2 start npm --name "placement-console" -- start
pm2 save
```

To pick up a changed env var later (pm2 caches the environment at start):

```bash
pm2 restart placement-console --update-env
```

Put this behind the same reverse proxy / domain pattern used for
`fly.elysians360.in` (e.g. `placement.elysians360.in` or a path on the
existing domain), with TLS terminated at nginx/Caddy in front of pm2.

## 5. What's where

| Route | Type | Notes |
|---|---|---|
| `/dashboard` | staff | pipeline strip, KPI tiles, today's slots/interviews |
| `/candidates`, `/candidates/[id]` | staff | filterable list + detail view |
| `/slots` | staff | interview slot availability (generate more from Odoo: Placement → Generate Interview Slots) |
| `/interviews` | staff | mock interview history/status |
| `/c/register` | candidate | self-service registration (no login) |
| `/c/book` | candidate | phone+email lookup → pick a slot → book |
| `/c/status/[token]` | candidate | status page, bookmarked via the token from register/book |
| `/login` | staff | Odoo-credential sign-in; redirects back to the page that was requested |

Staff routes are gated at the edge (`src/proxy.ts`, Next 16's renamed
`middleware.ts`) — any request to `/dashboard`, `/candidates`, `/slots`,
`/interviews` or their `/api/*` equivalents without a valid session cookie
is redirected to `/login` (API calls get a 401 instead of a redirect). The
candidate-facing `/c/*` routes are deliberately left open, same as the
existing public website pages.
