# Frontend Rules

## General Principles

The frontend should prioritize:

* Maintainability
* Type safety
* Separation of concerns
* Reusability
* Testability
* Clear feature boundaries
* SOLID principles
* OOP where it provides real value

Do not over-engineer simple UI and always use shadcn for UI components.

The goal is clean, scalable architecture without unnecessary abstraction.

---

## Components

Components should primarily be responsible for:

* Rendering UI
* Receiving props
* UI interactions
* Calling hooks
* Displaying state

Complex business logic should not live directly inside components.

Prefer:

```tsx
function PatientForm() {
  const patientForm = usePatientForm();

  return (
    // UI
  );
}
```

over placing all form logic directly inside the component.

---

**## Shared UI Components**

The application must follow a **component-first approach** for UI.

Before creating UI markup directly inside a feature component, check whether the element should be a reusable global component.

### Global UI Elements

Common UI elements must be implemented as reusable global components when they can be used across multiple features.

Examples include:

* Page titles / headings
* Section titles
* Paragraphs / descriptive text
* Labels
* Buttons
* Inputs
* Form fields
* Cards
* Dialogs
* Modals
* Badges
* Alerts
* Empty states
* Loading states
* Error states
* Tables
* Dropdowns
* Tooltips
* Other recurring UI patterns

For example, if a login page requires an `<h1>` such as "Welcome Back", do not create the `<h1>` directly inside `LoginForm.tsx` if the same heading pattern could be used elsewhere.

Instead, create a reusable global component such as:

```text
components/
└── ui/
    ├── heading.tsx
    ├── text.tsx
    ├── button.tsx
    └── ...
```

Then features should compose these components:

```tsx
function LoginForm() {
  return (
    <>
      <Heading>Welcome Back</Heading>
      <Text>Sign in to continue.</Text>

      {/* feature-specific UI */}
    </>
  );
}
```

The same `Heading` and `Text` components should be reusable by other features such as:

```text
features/
├── auth/
├── patients/
├── payments/
└── analytics/
```

### Do Not Duplicate Common UI

Do not repeatedly create the same UI pattern inside different feature components.

Bad:

```tsx
// LoginForm.tsx
<h1 className="text-2xl font-bold">Welcome Back</h1>
<p className="text-muted-foreground">Sign in to continue.</p>
```

```tsx
// RegisterForm.tsx
<h1 className="text-2xl font-bold">Create Account</h1>
<p className="text-muted-foreground">Create your account.</p>
```

If the structure and visual responsibility are shared, create a reusable component instead.

Good:

```tsx
<Heading>Welcome Back</Heading>
<Text>Sign in to continue.</Text>
```

```tsx
<Heading>Create Account</Heading>
<Text>Create your account.</Text>
```

### Use shadcn for UI

**Always use shadcn/ui components and the project's existing UI primitives whenever an appropriate component exists.**

Do not manually recreate components that shadcn already provides.

Examples:

* Button → use the existing Button component
* Input → use the existing Input component
* Dialog → use the existing Dialog component
* Select → use the existing Select component
* Dropdown → use the existing Dropdown component
* Checkbox → use the existing Checkbox component
* Switch → use the existing Switch component
* Tabs → use the existing Tabs component
* Tooltip → use the existing Tooltip component
* Form controls → use the existing shadcn form components/patterns

If a required UI component does not exist, first check whether it can be composed from existing shadcn primitives before creating a completely new implementation.

Do not introduce another UI component library when shadcn or the existing project components can satisfy the requirement.

### Global vs Feature Components

Use this rule when deciding where a component belongs:

**Global component:**

If the component represents a reusable UI concept that can reasonably be used by multiple features, place it in:

```text
components/
```

or the appropriate global UI subdirectory.

**Feature component:**

If the component contains UI that is specific to one business domain or feature and has no meaningful reuse outside that feature, place it in:

```text
features/<feature>/components/
```

For example:

```text
components/ui/
├── heading.tsx
├── text.tsx
├── button.tsx
├── input.tsx
└── card.tsx

features/auth/components/
├── login-form.tsx
└── forgot-password-form.tsx

features/patients/components/
├── patient-form.tsx
└── patient-table.tsx
```

### Important Rule

Before writing JSX for a common UI element, ask:

> "Is this UI pattern reusable across multiple features?"

If yes, create or reuse a global component.

Do not duplicate common UI markup merely because the text, data, or context is different.

Components should provide **structure and behavior**, while their content should generally be supplied through props or children.

Do not turn every HTML element into a component unnecessarily. The goal is to eliminate **meaningful UI duplication**, not to abstract trivial markup.


## Custom Hooks

Custom hooks are a primary location for complex frontend behavior.

Hooks should have a clear responsibility.

Avoid massive hooks that manage unrelated concerns.

Bad:

```text
usePatient()
├── fetching
├── validation
├── formatting
├── permissions
├── notifications
└── unrelated UI state
```

Prefer focused hooks.

Feature-specific hooks belong inside:

```text
features/<feature>/hooks/
```

Global reusable hooks belong inside:

```text
hooks/
```

---

## SOLID Principles

Apply SOLID principles whenever they improve the design.

### Single Responsibility

Each component, hook, store, class, or abstraction should have one primary responsibility.

### Open/Closed

Prefer designs that allow behavior to be extended without repeatedly modifying existing code.

### Liskov Substitution

When inheritance is used, derived implementations must remain valid substitutes for their abstractions.

Prefer composition when inheritance does not provide meaningful value.

### Interface Segregation

Prefer small, focused interfaces.

```ts
interface UserReader {
  getUser(id: string): Promise<User>;
}

interface UserUpdater {
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
}
```

### Dependency Inversion

Complex application logic should depend on abstractions rather than tightly coupling itself to concrete implementations when doing so provides meaningful value.

---

## OOP

Use OOP more heavily in:

* Custom hooks when complexity justifies it
* Stores
* Complex state management
* Stateful frontend abstractions
* Domain-specific frontend behavior

Good candidates can include:

```text
FormStateManager
PaginationManager
FilterManager
AuthenticationStore
```

when the complexity genuinely justifies a class.

Do not create classes for trivial functionality.

Prefer:

* Encapsulation
* Composition
* Interfaces
* Dependency injection
* Small focused classes
* Polymorphism when useful

Avoid inheritance-heavy designs.

---

## Stores

Keep state as close to its consumer as possible.

Use:

* React local state for local UI state
* Stores for genuinely shared application state

Stores should:

* Encapsulate state
* Expose meaningful operations
* Avoid UI responsibilities
* Avoid duplicating server state unnecessarily

Complex stores should follow SOLID principles and may use OOP.

---

## API Communication

Do not scatter raw API calls throughout components.

Avoid having multiple components independently implement the same API operation.

API communication should be accessed through the appropriate application layer.

Frontend API contracts must be strongly typed.

---

## Validation

Use Zod for runtime validation.

Shared validation contracts should be reused where appropriate.

Do not duplicate the same validation rules unnecessarily.

Frontend validation improves user experience.

Backend validation remains authoritative and must always validate incoming data independently.

---

## TypeScript

Use strict TypeScript.

Avoid `any`.

Prefer `unknown` when data is genuinely unknown.

Explicitly type important boundaries such as:

* API inputs
* API outputs
* Service interfaces
* Repository interfaces
* Complex state
* Function parameters and return values where clarity benefits

Do not add unnecessary type annotations where TypeScript inference is already obvious.

---

## Feature Boundaries

Features should remain independently understandable.

For example:

```text
features/
├── auth/
├── patients/
├── payments/
└── analytics/
```

Avoid unnecessary cross-feature dependencies.

Do not import another feature's internal implementation when a cleaner shared abstraction exists.

---

## Business Logic

Business logic must not live inside:

* JSX
* UI primitives
* Layout components
* Route pages

Move complex behavior to the appropriate hooks, stores, services, repositories, or utilities according to responsibility.
