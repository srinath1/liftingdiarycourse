"use client";

import { useState } from "react";
import {
  addExerciseToWorkoutAction,
  addSetAction,
  createAndAddExerciseAction,
} from "./actions";

type Exercise = { id: string; name: string };

type SetEntry = { weight: string; reps: string };

type Props = {
  workoutId: string;
  allExercises: Exercise[];
  onDone: () => void;
};

export default function ExerciseSearchPanel({
  workoutId,
  allExercises,
  onDone,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([{ weight: "", reps: "" }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = query.trim()
    ? allExercises.filter((ex) =>
        ex.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : allExercises;

  const showCreate =
    query.trim() &&
    !allExercises.some(
      (ex) => ex.name.toLowerCase() === query.trim().toLowerCase()
    );

  function handleSetChange(index: number, field: keyof SetEntry, value: string) {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addSetRow() {
    setSets((prev) => [...prev, { weight: "", reps: "" }]);
  }

  function removeSetRow(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    if (!selected) return;
    setPending(true);
    setError(null);
    try {
      const weRow =
        selected.id === "__new__"
          ? await createAndAddExerciseAction(workoutId, { name: selected.name })
          : await addExerciseToWorkoutAction(workoutId, { exerciseId: selected.id });

      for (const s of sets) {
        const weight = s.weight.trim() || null;
        const reps = s.reps.trim() ? parseInt(s.reps, 10) : null;
        if (weight !== null || reps !== null) {
          await addSetAction(weRow.id, workoutId, { weight, reps });
        }
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  // Step 2: exercise selected — enter sets
  if (selected) {
    return (
      <div className="border rounded-md p-4 space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{selected.name}</h3>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Sets</p>
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10">
                Set {i + 1}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={s.weight}
                onChange={(e) => handleSetChange(i, "weight", e.target.value)}
                placeholder="kg"
                className="border rounded-md px-2 py-1 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={s.reps}
                onChange={(e) => handleSetChange(i, "reps", e.target.value)}
                placeholder="reps"
                className="border rounded-md px-2 py-1 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSetRow(i)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSetRow}
            className="text-xs text-muted-foreground hover:underline"
          >
            + Add another set
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="bg-black text-white text-sm font-medium rounded-md px-4 py-2 disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add to Workout"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm border rounded-md px-4 py-2 text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Step 1: pick an exercise
  return (
    <div className="border rounded-md p-3 space-y-2 bg-background">
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search exercises…"
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <ul className="max-h-56 overflow-y-auto divide-y rounded-md border">
        {filtered.map((ex) => (
          <li key={ex.id}>
            <button
              type="button"
              onClick={() => setSelected(ex)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
            >
              {ex.name}
            </button>
          </li>
        ))}
        {filtered.length === 0 && !showCreate && (
          <li className="px-3 py-2 text-sm text-muted-foreground">
            No exercises found.
          </li>
        )}
      </ul>

      {showCreate && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            setSelected({ id: "__new__", name: query.trim() })
          }
          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md border border-dashed disabled:opacity-50"
        >
          + Create &quot;{query.trim()}&quot;
        </button>
      )}

      <button
        type="button"
        onClick={onDone}
        className="text-xs text-muted-foreground hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
