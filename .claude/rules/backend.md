# Backend Rules

## General Principles

The backend must prioritize:

- SOLID principles
- OOP where appropriate
- Separation of concerns
- Dependency inversion
- Testability
- Strong typing
- Maintainability
- Clear service/repository boundaries
- Explicit business rules

Avoid putting the entire application inside route handlers or a single large service.

---

## Backend Layering

Follow this general flow:

```text
Route / Controller
        ↓
Service
        ↓
Repository
        ↓
Database / External Provider
```

Each layer must have a clear responsibility.

---

## Routes / Controllers

Routes and controllers must remain thin.

They should generally:

1. Receive the request
2. Parse and validate input
3. Call the appropriate service
4. Return the response

They should NOT contain complex business logic.

Do not put database queries, complex calculations, business rules, or large workflows directly inside route handlers.

---

## Services

Services contain application and business logic.

A service should determine:

- What should happen
- Which business rules apply
- Which repositories are required
- Which external services need to be coordinated

Example:

```ts
class CreatePatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<Patient> {
    // business logic
  }
}
```

Services should not manage HTTP concerns.

---

## Repositories

Repositories abstract persistence and data access.

Typical responsibilities:

```text
findById()
findMany()
create()
update()
delete()
```

Repositories should not contain application-level business rules.

For example, avoid:

```ts
patientRepository.createPatientAndSendWelcomeEmail();
```

Instead:

```text
CreatePatientService
    ↓
PatientRepository
    ↓
EmailService
```

The service orchestrates the operation.

---

## SOLID

SOLID principles should be actively applied.

### Single Responsibility

Keep services, repositories, and classes focused.

Avoid giant services such as:

```text
UserService
├── authentication
├── registration
├── payments
├── reporting
├── permissions
└── file uploads
```

Split responsibilities when they are genuinely independent.

### Open/Closed

Use abstractions where behavior is expected to evolve.

### Liskov Substitution

Implementations must remain valid substitutes for their abstractions.

### Interface Segregation

Prefer focused interfaces.

### Dependency Inversion

High-level business logic should depend on abstractions.

Example:

```ts
interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
}
```

Then:

```ts
class PrismaPatientRepository implements PatientRepository {
  // implementation
}
```

Services should depend on `PatientRepository`, not unnecessarily on `PrismaPatientRepository`.

---

## OOP

Use OOP extensively where it improves backend architecture.

Good candidates include:

- Services
- Repositories
- External service clients
- Authentication logic
- Complex business rules
- Domain managers
- Exception types

Prefer:

- Classes
- Interfaces
- Encapsulation
- Dependency injection
- Composition
- Polymorphism

Do not force classes into code that is naturally better represented as a pure function.

---

## Dependency Injection

Prefer dependency injection for services and repositories.

Example:

```ts
class CreatePatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(input: CreatePatientInput) {
    // ...
  }
}
```

Avoid constructing complex dependencies deep inside business logic.

Dependency injection should improve:

- Testability
- Replaceability
- Dependency inversion
- Maintainability

---

## Validation

Use Zod for runtime validation.

Shared API contracts should be centralized in `types/` where appropriate.

Do not maintain duplicate definitions of the same API contract unnecessarily.

The backend must always validate incoming data independently.

Never rely on frontend validation for security.

---

## Database Access

Database and ORM access must be isolated from business logic.

Do not perform direct database operations inside:

- Controllers
- Route handlers
- Components
- Generic utilities

Use repositories.

---

## External Services

External integrations should have clear boundaries.

For sufficiently complex integrations, use abstractions:

```ts
interface EmailService {
  sendWelcomeEmail(input: WelcomeEmailInput): Promise<void>;
}
```

Business logic should depend on the abstraction when that provides meaningful flexibility and testability.

---

## Exceptions

Use meaningful custom exceptions.

Examples:

```ts
throw new NotFoundException("Patient not found");

throw new UnauthorizedException("Unauthorized");

throw new ValidationException("Invalid patient data");
```

Do not throw arbitrary strings.

Do not use generic errors for every situation when a meaningful application exception exists.
