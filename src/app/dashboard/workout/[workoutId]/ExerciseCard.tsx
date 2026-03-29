"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addSetAction, deleteSetAction, removeExerciseFromWorkoutAction } from "./actions";
import type { WorkoutWithExercises } from "@/data/workouts";

type Props = {
  workoutExercise: WorkoutWithExercises["exercises"][0];
  workoutId: string;
};

export default function ExerciseCard({ workoutExercise, workoutId }: Props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setError, setSetError] = useState<string | null>(null);
  const [setPending, setSetPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removePending, setRemovePending] = useState(false);

  async function handleAddSet(e: React.FormEvent) {
    e.preventDefault();
    setSetError(null);
    setSetPending(true);
    try {
      await addSetAction(workoutExercise.id, workoutId, {
        weight: weight.trim() || null,
        reps: reps.trim() ? parseInt(reps, 10) : null,
      });
      setWeight("");
      setReps("");
    } catch (err) {
      setSetError(err instanceof Error ? err.message : "Failed to log set");
    } finally {
      setSetPending(false);
    }
  }

  async function handleDeleteSet(setId: string) {
    await deleteSetAction(setId, workoutId);
  }

  async function handleRemove() {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    setRemovePending(true);
    await removeExerciseFromWorkoutAction(workoutId, workoutExercise.id);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {workoutExercise.exerciseName}
          </CardTitle>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removePending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {removePending ? "Removing…" : confirmRemove ? "Confirm remove?" : "Remove"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workoutExercise.sets.length > 0 && (
          <div className="space-y-1">
            {workoutExercise.sets.map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between text-sm text-muted-foreground"
              >
                <span>
                  Set {set.setNumber}
                  {set.weight ? ` · ${set.weight} kg` : ""}
                  {set.reps ? ` × ${set.reps}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSet(set.id)}
                  className="text-xs text-red-400 hover:text-red-600 ml-4"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddSet} className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Weight (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 60"
              className="border rounded-md px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g. 10"
              className="border rounded-md px-2 py-1 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={setPending}
            className="bg-black text-white text-sm rounded-md px-3 py-1.5 font-medium disabled:opacity-50"
          >
            {setPending ? "Logging…" : "Log Set"}
          </button>
        </form>
        {setError && <p className="text-xs text-red-600">{setError}</p>}
      </CardContent>
    </Card>
  );
}
