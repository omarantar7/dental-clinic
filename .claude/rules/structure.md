# Project Structure Rules

## Core Principle

This project follows a domain-oriented architecture with clear separation of concerns.

Every file must have a clear responsibility and must live in the directory responsible for that concern.

Before creating a new file or folder:

1. Check whether an existing location already owns the responsibility.
2. Check whether similar functionality already exists.
3. Avoid unnecessary files and abstractions.
4. Keep domain-specific code inside its domain.
5. Keep shared code genuinely shared.

---

## Project Structure

```text
src/
├── app/                           # ROUTING ONLY
│   ├── layout.tsx                 # Root layout & global providers
│   ├── page.tsx                   # Landing page
│   │
│   ├── (auth)/                    # Authentication route group
│   │   ├── layout.tsx             # Auth-specific structural layout
│   │   └── login/
│   │       └── page.tsx           # Thin route component
│   │
│   └── (dashboard)/               # Authenticated routes
│       └── analytics/
│           └── page.tsx           # Thin route component
│
├── features/                      # DOMAIN-SPECIFIC FRONTEND FEATURES
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   │
│   └── analytics/
│       ├── components/
│       ├── hooks/
│       └── types/
│
├── components/                    # GLOBAL / SHARED UI
│   ├── ui/                        # Primitive UI components
│   ├── layout/                    # Navbar, Sidebar, Footer, etc.
│   └── providers/                 # Global providers
│
├── hooks/                         # GLOBAL REUSABLE HOOKS
│
├── stores/                        # GLOBAL APPLICATION STATE
│
├── lib/                           # THIRD-PARTY CLIENTS & CONFIGURATION
│
├── utils/                         # PURE REUSABLE UTILITIES
│
├── types/                         # SHARED TYPES & ZOD SCHEMAS
│
├── repositories/                  # DATA ACCESS
│
├── services/                      # APPLICATION / BUSINESS LOGIC
│
├── config/                        # APPLICATION CONFIGURATION
│
├── exceptions/                    # CUSTOM APPLICATION EXCEPTIONS
│
└── scripts/                       # DEVELOPMENT / MAINTENANCE SCRIPTS
```

---

## `app/`

`app/` is responsible for routing and route-level concerns only.

Pages should be thin.

A page should generally import and render a feature component:

```tsx
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

Do not put the following directly inside route pages:

- Complex business logic
- Database operations
- Large forms
- Complex state management
- API implementation
- Reusable business logic

Move that logic into the appropriate layer.

---

## `features/`

Features represent independent business domains.

For now, every feature should contain only:

```text
features/
└── feature-name/
    ├── components/
    ├── hooks/
    └── types/
```

Do not add additional feature folders unless there is a clear architectural reason.

Examples:

```text
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── types/
│       └── login.ts
│
└── patients/
    ├── components/
    │   ├── PatientList.tsx
    │   └── PatientForm.tsx
    ├── hooks/
    │   └── usePatients.ts
    └── types/
        └── patient.ts
```

Feature-specific components belong inside their feature.

### `features/<feature>/types/`

Contains types that are specific to a single feature and have no reuse outside it — for example, the shape of a feature's own API response, or props for a feature's internal state.

Do not define these types inline inside a hook or component. Give them a home in the feature's `types/` folder and import from there, the same way `components/` and `hooks/` are already split out.

A type only belongs in the global `types/` folder when it represents a contract shared across features, or shared between frontend and backend (e.g. a Zod validation schema also used by an API route). See `types/` below for that distinction.

Do not move a component into `components/` simply because it is used more than once within the same feature.

Move it to `components/` only when it is genuinely reusable across unrelated domains.

---

## `components/`

`components/` contains globally reusable UI.

### `components/ui/`

Contains domain-agnostic primitives:

- Button
- Input
- Dialog
- Select
- Card
- Table
- Dropdown

These components must not contain business/domain knowledge.

### `components/layout/`

Contains global structural components:

- Navbar
- Sidebar
- Header
- Footer
- Dashboard shell

### `components/providers/`

Contains global application providers.

---

## `hooks/`

Contains hooks that are reusable across multiple unrelated features.

Examples:

```text
hooks/
├── useDebounce.ts
├── useMediaQuery.ts
└── useClickOutside.ts
```

If a hook is specific to one domain, put it inside that feature:

```text
features/patients/hooks/usePatients.ts
```

---

## `stores/`

`stores/` contains global application state.

Stores must not contain UI components.

Do not put every piece of state into a global store.

Use local component state for local concerns.

Use stores when state genuinely needs to be shared.

---

## `types/`

`types/` contains shared application and API types — contracts used across multiple features, or shared between frontend and backend (e.g. a Zod validation schema imported by both a form and an API route).

Zod schemas that represent shared contracts may also live here.

Do not duplicate the same API types or validation schemas across frontend and backend.

A type used by only one feature does not belong here — put it in that feature's own `features/<feature>/types/` folder instead. See `features/` above.

---

## `repositories/`

Repositories are responsible for data access.

They may communicate with:

- Databases
- ORMs
- Persistence layers
- External data stores

Repositories must not contain UI logic or application-level orchestration.

---

## `services/`

Services contain application and business logic.

Services may orchestrate:

- Repositories
- External services
- Business rules
- Domain operations

Services must not depend on React components or UI concerns.

---

## `lib/`

`lib/` contains configured third-party clients and infrastructure integrations.

Examples:

```text
lib/
├── prisma.ts
├── axios.ts
├── redis.ts
└── external-api.ts
```

Do not turn `lib/` into a business-logic directory.

---

## `utils/`

Utilities should be small, reusable, and preferably pure.

Examples:

```text
formatDate()
formatCurrency()
cn()
```

Do not use `utils/` as a dumping ground.

If a function is domain-specific, keep it with that domain.

---

## `exceptions/`

Contains custom application exception classes.

Examples:

```text
AppException.ts
NotFoundException.ts
UnauthorizedException.ts
ValidationException.ts
```

---

## Dependency Direction

Prefer a clear dependency direction:

```text
app
 ↓
features
 ↓
hooks / stores / services
 ↓
repositories
 ↓
database / external systems
```

Shared infrastructure such as `types`, `utils`, `lib`, and `exceptions` should be used carefully.

Avoid circular dependencies, especially between features.

---

## File Creation Rule

Do not create a new file simply because a piece of code could theoretically be separated.

Create a new file when it provides a meaningful architectural boundary, improves reuse, testability, readability, or separation of responsibility.
