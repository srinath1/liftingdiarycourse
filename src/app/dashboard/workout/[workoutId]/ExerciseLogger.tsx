"use client";

import { useState } from "react";
import type { WorkoutWithExercises } from "@/data/workouts";
import ExerciseCard from "./ExerciseCard";
import ExerciseSearchPanel from "./ExerciseSearchPanel";

type Props = {
  workout: WorkoutWithExercises;
  allExercises: { id: string; name: string }[];
};

export default function ExerciseLogger({ workout, allExercises }: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exercises</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-black text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-black/80 transition-colors"
          >
            Add Exercise
          </button>
        )}
      </div>

      {adding && (
        <ExerciseSearchPanel
          workoutId={workout.id}
          allExercises={allExercises}
          onDone={() => setAdding(false)}
        />
      )}

      {workout.exercises.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">
          No exercises logged yet. Add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              workoutExercise={ex}
              workoutId={workout.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
