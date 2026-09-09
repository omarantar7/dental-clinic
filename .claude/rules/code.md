# Code Quality & Claude Code Workflow

## 1. Ask Questions Before Doing Anything

**This is mandatory.**

Before implementing a new feature, making architectural changes, or modifying significant existing code, ask as many relevant questions as necessary to make the requirements completely clear.

Do not immediately start coding based on assumptions.

The objective is to understand the requirements before implementation.

Questions may cover:

- Functional requirements
- Expected behavior
- Edge cases
- User roles
- Permissions
- Data relationships
- API behavior
- Validation
- Error handling
- Authentication
- Authorization
- UI behavior
- Loading states
- Empty states
- Error states
- Performance requirements
- Security requirements
- Existing architecture
- Reusability
- Naming
- Database behavior
- External integrations
- Deployment requirements

Do not ask questions that have already been answered by the codebase or project documentation.

Inspect the existing code first when the answer can be determined from the project.

If an important decision remains ambiguous, ask before implementing it.

If multiple reasonable approaches exist, briefly explain the alternatives and ask which approach should be used.

---

## 2. Inspect Before Modifying

Before changing existing code:

1. Read the relevant files.
2. Understand their dependencies.
3. Inspect existing patterns.
4. Search for similar implementations.
5. Check existing types and Zod schemas.
6. Check existing services and repositories.
7. Check existing hooks and stores.
8. Follow the established architecture.

Never blindly overwrite existing functionality.

---

## 3. Follow Project Instructions

The project contains:

```text
CLAUDE.md
AGENTS.md
.claude/rules/
```

These instructions must be respected.

`CLAUDE.md` references:

```md
@AGENTS.md
```

The generated Next.js agent rules inside `AGENTS.md` must remain intact.

Do not remove or modify the generated block:

```text
BEGIN:nextjs-agent-rules
...
END:nextjs-agent-rules
```

unless explicitly instructed.

---

## 4. Next.js Documentation

This project uses a Next.js version that may differ from versions in training data.

Before writing Next.js code, inspect the relevant documentation inside:

```text
node_modules/next/dist/docs/
```

Resolve the correct `next` package from the project directory.

In monorepos, ensure the documentation belongs to the actual Next.js version being used by the project.

Do not rely solely on remembered Next.js APIs or conventions.

If local Next.js documentation contradicts prior knowledge, follow the local documentation.

---

## 5. Don't Over-Engineer

SOLID and OOP are important in this project, but they must be applied intelligently.

Do not:

- Create classes for trivial functions
- Create unnecessary interfaces
- Create factories without a real need
- Create abstractions for hypothetical requirements
- Create services that only forward one function without adding value
- Create excessive layers
- Split every few lines into a separate file

The goal is:

> The simplest architecture that remains clean, maintainable, testable, and scalable.

---

## 6. Avoid Duplication

Before writing new code, search for existing:

- Components
- Hooks
- Stores
- Services
- Repositories
- Types
- Zod schemas
- Utilities
- Exceptions
- API clients

Reuse existing functionality when appropriate.

Do not duplicate code simply because the existing implementation is in another file.

---

## 7. Naming

Use clear and descriptive names.

Prefer:

```text
CreatePatientService
PatientRepository
usePatientForm
PatientForm
NotFoundException
```

Avoid vague names such as:

```text
Helper
Manager
Thing
Data
Common
Misc
Stuff
```

unless the name has a specific and meaningful established responsibility.

---

## 8. Type Safety

Use strong TypeScript types throughout the application.

Avoid:

```ts
any;
```

unless there is a genuinely unavoidable reason.

Prefer:

```ts
unknown;
```

when data is genuinely unknown.

Use strong types at important boundaries:

- API requests
- API responses
- Services
- Repositories
- Stores
- External integrations

---

## 9. Error Handling

Handle errors intentionally.

Do not silently swallow errors:

```ts
try {
  // ...
} catch {
  // nothing
}
```

unless there is a deliberate reason.

Errors should be:

- Handled
- Transformed
- Logged appropriately
- Or propagated to the layer responsible for handling them

---

## 10. Comments

Comments should explain **why**, not simply describe what the code already says.

Avoid:

```ts
// Increment counter
counter++;
```

Prefer comments that explain non-obvious decisions or constraints.

---

## 11. No Premature Abstraction

Do not build abstractions for hypothetical future requirements.

Introduce an abstraction when there is a real reason such as:

- Actual complexity
- Repetition
- Multiple implementations
- Dependency inversion
- Testing requirements
- A meaningful architectural boundary

---

## 12. Focused Changes

When modifying existing code, avoid unrelated refactoring.

Keep changes focused on the requested functionality.

If a significant refactor is necessary, explain why and ask before proceeding unless the refactor is required to correctly implement the requested change.

---

## 13. Before Finishing

Before considering a task complete:

1. Verify the implementation against the requirements.
2. Check TypeScript types.
3. Check Zod validation.
4. Check error handling.
5. Check loading/empty/error states where relevant.
6. Check file placement.
7. Check for duplicated logic.
8. Check for unnecessary abstractions.
9. Check SOLID principles.
10. Check dependency direction.
11. Run the appropriate linting, type checking, and tests when available.

The implementation must fit the existing architecture rather than introducing an unrelated architectural style.
