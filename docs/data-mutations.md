# Data Mutations

## Rules

### 1. DB calls go through `src/data` helper functions

All direct Drizzle ORM calls must be wrapped in helper functions inside `src/data/`. Components, server actions, and other modules must never import or call Drizzle directly.

```
src/
  data/
    workouts.ts      # helpers: createWorkout, updateWorkout, deleteWorkout, ...
    exercises.ts
    sets.ts
```

**Example helper (`src/data/workouts.ts`):**

```ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(data: typeof workouts.$inferInsert) {
  const [row] = await db.insert(workouts).values(data).returning();
  return row;
}

export async function deleteWorkout(id: string) {
  await db.delete(workouts).where(eq(workouts.id, id));
}
```

---

### 2. All mutations happen via server actions in colocated `actions.ts` files

Server actions must live in an `actions.ts` file colocated with the feature/route that uses them. They call `src/data` helpers — never Drizzle directly.

```
src/app/
  workouts/
    page.tsx
    actions.ts      <-- server actions for this route
```

---

### 3. Server actions must use `"use server"` and typed arguments — no `FormData`

Every server action must:

- Begin with `"use server"`
- Accept typed arguments (TypeScript types or inferred from Zod)
- Never accept `FormData` as a parameter

```ts
// actions.ts
"use server";

export async function addWorkout(input: AddWorkoutInput) { ... }
```

---

### 4. All server action arguments must be validated with Zod

Define a Zod schema for each server action's input. Parse and validate before calling any data helper. Throw or return an error if validation fails.

```ts
// actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const AddWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

type AddWorkoutInput = z.infer<typeof AddWorkoutSchema>;

export async function addWorkout(input: AddWorkoutInput) {
  const parsed = AddWorkoutSchema.parse(input);
  return createWorkout(parsed);
}
```

---

### 5. Redirects after server actions must happen on the client, not in the server action

Server actions must never call `redirect()`. After a server action resolves, the calling client component is responsible for navigating (e.g. via `useRouter`).

```ts
// actions.ts — correct
"use server";

export async function addWorkout(input: AddWorkoutInput) {
  const parsed = AddWorkoutSchema.parse(input);
  return createWorkout(parsed);
  // no redirect() here
}
```

```tsx
// page.tsx — correct
const workout = await addWorkout(input);
router.push("/dashboard");
```

---

## Summary

| Rule | Requirement |
|---|---|
| DB access | Via `src/data/` helper functions only |
| ORM | Drizzle ORM, wrapped — never called directly outside `src/data/` |
| Server action location | Colocated `actions.ts` next to the route/feature |
| Server action arguments | Typed — no `FormData` |
| Input validation | Zod schema required on every server action |
| Redirects | Client-side only (`useRouter`) — never `redirect()` inside a server action |
