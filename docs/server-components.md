# Server Components

## Rules

### 1. `params` must be awaited — it is a Promise in Next.js 15+

In Next.js 15+, the `params` prop passed to server components is a **Promise**. It must be awaited before accessing any route segment values.

**Correct:**

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // use workoutId
}
```

**Incorrect — do not do this:**

```tsx
// ❌ params is not a plain object in Next.js 15+
export default async function Page({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // runtime error
}
```

---

### 2. `searchParams` must also be awaited

The same rule applies to `searchParams` — it is a Promise in Next.js 15+.

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
}
```

---

## Summary

| Prop           | Type in Next.js 15+ | Must await? |
|----------------|---------------------|-------------|
| `params`       | `Promise<{ ... }>`  | Yes         |
| `searchParams` | `Promise<{ ... }>`  | Yes         |
