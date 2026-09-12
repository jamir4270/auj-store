app-name/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ... the rest of auth pages
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (public)/                    # unauthenticated / end-user facing
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── account/
│   │   │       └── ...
│   │   │
│   │   ├── (staff)/dashboard/           # authenticated org/staff portal
│   │   │   ├── layout.tsx               # role-gated
│   │   │   └── ...
│   │   │
│   │   ├── (admin)/platform/            # superadmin-only
│   │   │   ├── layout.tsx               # role-gated
│   │   │   └── ...
│   │   │
│   │   └── api/
│   │       ├── webhooks/
│   │       └── cron/
│   │
│   ├── components/
│   │   ├── ui/                          # unopinionated primitives
│   │   ├── public/
│   │   ├── staff/
│   │   └── admin/
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts                # browser/public client
│   │   │   ├── server.ts                # server-side client (RSC/actions)
│   │   │   └── admin.ts                 # privileged client, isolated on purpose
│   │   │
│   │   ├── actions/                     # server actions, 1 file per bounded context
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   
│   │   │
│   │   ├── security/
│   │   │   └── ...                      # sensitive, must-not-regress logic, isolated + unit-testable
│   │   │
│   │   ├── storage/
│   │   ├── email/
│   │   │   └── templates/
│   │   │
│   │   └── validators/                  # schema validation (e.g. zod), one per domain object
│   │
│   ├── types/
│   │   ├── database.types.ts            # generated
│   │   └── domain.ts                    # hand-written, UI/domain-only unions
│   │
│   └── proxy.ts                         # network-boundary routing: redirects, rewrites, coarse role gating
│
├── db/
│   ├── migrations/
│   ├── functions/                       # server-side procedures, if applicable
│   └── seed.sql
│
└── docs/