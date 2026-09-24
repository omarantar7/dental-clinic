# Technology & Package Rules

## Core Principle

This project already has an established technology stack.

**Prefer the existing dependencies in `package.json` over introducing new libraries.**

Before installing or recommending a new package:

1. Inspect `package.json`.
2. Check whether an existing dependency already solves the problem.
3. Check the installed package's current API/documentation when necessary.
4. Only introduce a new dependency when the existing stack cannot reasonably satisfy the requirement.
5. If adding a new dependency is not clearly necessary, ask for approval first.

Do not introduce alternative libraries simply because they are familiar or commonly used.

---

# Framework

## Next.js

Current version:

```text
next: 16.3.0
```

Use the project's installed Next.js version.

Do not assume APIs from older Next.js versions.

Before implementing Next.js-specific functionality, consult the local Next.js documentation available under:

```text
node_modules/next/dist/docs/
```

Also follow the project's `AGENTS.md` instructions.

---

# React

Current version:

```text
react: 19.2.8
react-dom: 19.2.8
```

Use React 19 APIs and patterns appropriate for the installed version.

Do not introduce another frontend framework or state-management paradigm unless explicitly requested.

---

# TypeScript

Use TypeScript throughout the application.

Current version:

```text
typescript: ^5
```

Prefer strong typing over `any`.

Use the project's existing TypeScript configuration and conventions.

---

# Forms & Validation

The project uses:

```text
react-hook-form
@hookform/resolvers
zod
```

These are the preferred tools for forms and validation.

## React Hook Form

Use `react-hook-form` for complex forms and form state management.

Do not build custom form-state management when React Hook Form already provides the required functionality.

## Zod

Use Zod for runtime validation and schema definitions.

Use Zod for:

- Form validation
- API input validation
- API contracts
- Parsing external/untrusted data
- Backend request validation

## React Hook Form + Zod

When a form requires Zod validation, use:

```text
react-hook-form
        +
@hookform/resolvers
        +
zod
```

The expected pattern is:

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
```

and:

```ts
const form = useForm({
  resolver: zodResolver(schema),
});
```

Do not manually duplicate the same validation logic inside form fields when the Zod schema already represents the rule.

---

# UI

The project already uses:

```text
@base-ui/react
shadcn
class-variance-authority
clsx
tailwind-merge
tw-animate-css
```

Prefer these existing tools for UI development.

## shadcn / UI Components

Use the project's existing shadcn-based components and patterns where applicable.

Do not introduce another component library for functionality that can reasonably be implemented using the existing UI system.

## Styling

The project uses Tailwind CSS.

Prefer Tailwind utilities for component styling.

Use the existing `clsx` and `tailwind-merge` utilities when appropriate.

If the project already has a `cn()` utility, use it rather than creating another class-name utility.

## Class Variance Authority

Use `class-variance-authority` when a component has meaningful style variants.

Do not use it for components where simple conditional classes are sufficient.

---

# Icons

The project currently has:

```text
lucide-react
@hugeicons/react
@hugeicons/core-free-icons
```

Prefer the project's existing icon libraries.

Do not install another icon library without a clear reason.

When implementing a new component, follow the icon library convention already used in the surrounding code.

Avoid mixing icon libraries unnecessarily within the same feature.

---

# Notifications

The project uses:

```text
sonner
```

Use Sonner for toast/notification behavior.

Do not install another toast or notification library.

---

# State Management

The project currently does not specify a dedicated external state-management library in `package.json`.

Use React's built-in state management where appropriate.

If a global store is required, follow the architecture defined in `frontend.md`.

Do not install a state-management library automatically.

If the requirement genuinely needs a new state-management dependency, ask before adding one.

---

# Database

The project uses:

```text
prisma: ^7.9.1
@prisma/client: ^7.9.1
@prisma/adapter-pg: ^7.9.1
pg: ^8.22.0
```

The database is PostgreSQL.

Use the installed Prisma 7 APIs and patterns.

Do not use examples or APIs from older Prisma versions without verifying that they are compatible with Prisma 7.

Database access must follow the repository architecture defined in `backend.md`.

Do not access Prisma directly from frontend code.

Avoid direct Prisma usage inside route handlers when the repository layer should own the data access.

---

# Authentication & Security

The project uses:

```text
bcrypt
jsonwebtoken
```

Use the existing authentication infrastructure rather than introducing another authentication implementation without approval.

Use `bcrypt` for password hashing where password hashing is required.

Use `jsonwebtoken` according to the project's existing authentication architecture.

Do not introduce another JWT or password-hashing library unless there is a clear technical requirement.

Never expose secrets, private keys, passwords, or sensitive environment variables to client-side code.

---

# Email

The project uses:

```text
resend
```

Use Resend for email functionality.

Do not introduce another email provider/library unless explicitly approved.

Email provider configuration belongs in the appropriate backend/infrastructure layer.

---

# File Storage

The project uses AWS S3:

```text
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

Use the AWS SDK already installed for S3 operations.

Use presigned URLs when the existing architecture calls for direct client-to-S3 uploads/downloads.

Do not install another S3 client.

Keep S3 implementation details inside the appropriate backend/infrastructure layer.

---

# Image Processing

The project uses:

```text
sharp
```

Use Sharp for server-side image processing when required.

Do not introduce another image-processing library without a clear reason.

---

# Environment Variables

The project uses:

```text
dotenv
```

Follow the existing environment-variable configuration.

Never hardcode:

- API keys
- Passwords
- JWT secrets
- Database credentials
- AWS credentials
- Email credentials
- Other secrets

Do not expose server-only environment variables to client-side code.

---

# Query String Handling

The project includes:

```text
qs
```

Use the existing package when complex query-string parsing/stringification is required.

Do not introduce another query-string library for the same purpose.

---

# CLI / Scripts

The project uses:

```text
tsx
@inquirer/prompts
```

where applicable to project scripts.

Existing scripts should remain inside:

```text
src/scripts/
```

Do not place development/maintenance scripts randomly throughout the source tree.

---

# Testing

The project uses:

```text
vitest
vitest-mock-extended
```

Use Vitest for tests.

Use `vitest-mock-extended` when strongly typed mocks are useful, particularly for services and repositories.

Do not introduce Jest unless explicitly requested.

Tests should follow the architecture of the code they test.

Complex business logic in services and repositories should be designed so it can be tested independently.

---

# ESLint

The project uses:

```text
eslint
eslint-config-next
```

Follow the project's existing ESLint configuration.

Do not disable ESLint rules simply to make code pass.

If a rule causes a legitimate architectural problem, understand the reason before changing the configuration.

---

# Tailwind CSS

The project uses:

```text
tailwindcss: ^4
@tailwindcss/postcss
tw-animate-css
```

Use Tailwind CSS 4 conventions.

Do not assume Tailwind CSS 3 configuration patterns are valid.

Verify the installed version's documentation when implementing configuration-level changes.

---

# Package Selection Rules

Before installing a new package, ask:

### 1. Do we already have a package that solves this?

Example:

```text
Need form validation
        ↓
react-hook-form + zod already exist
        ↓
DO NOT install Formik
```

### 2. Can the requirement be solved with the existing framework?

Do not install a package for functionality that Next.js, React, TypeScript, or the existing project utilities already provide.

### 3. Is the new dependency actually justified?

A new package should provide meaningful value such as:

- Required functionality
- Significant complexity reduction
- Better security
- Better performance
- A necessary integration

Avoid dependencies for convenience alone.

---

# Do Not Replace Existing Technologies

Do not replace an existing project technology with another library without explicit approval.

Examples:

```text
React Hook Form → Formik
Zod → Yup
Vitest → Jest
Sonner → another toast library
Prisma → another ORM
S3 SDK → another S3 client
Tailwind → another CSS framework
Lucide/Hugeicons → another icon library
```

Such changes are architectural decisions and must not be made casually.

---

# Version Awareness

The versions in `package.json` are part of the project's technical context.

When an API may differ between versions, inspect the installed package/documentation before implementing it.

Do not blindly copy code written for an older major version.

In particular, pay attention to:

- Next.js 16
- React 19
- Prisma 7
- Zod 4
- Tailwind CSS 4
- Vitest 4
