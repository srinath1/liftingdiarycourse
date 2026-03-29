import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export type WorkoutWithExercises = {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  exercises: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    sets: {
      id: string;
      setNumber: number;
      weight: string | null;
      reps: number | null;
    }[];
  }[];
};

export async function getWorkoutsForDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, dayStart),
        lt(workouts.startedAt, dayEnd)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order, sets.setNumber);

  // Group flat rows into nested structure
  const workoutMap = new Map<string, WorkoutWithExercises>();
  const exerciseMap = new Map<string, WorkoutWithExercises["exercises"][0]>();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }

    if (row.workoutExerciseId) {
      const exerciseKey = row.workoutExerciseId;
      if (!exerciseMap.has(exerciseKey)) {
        const exercise = {
          id: exerciseKey,
          exerciseId: row.exerciseId ?? "",
          exerciseName: row.exerciseName ?? "",
          sets: [],
        };
        exerciseMap.set(exerciseKey, exercise);
        workoutMap.get(row.workoutId)!.exercises.push(exercise);
      }

      if (row.setNumber !== null) {
        exerciseMap.get(exerciseKey)!.sets.push({
          id: row.setId ?? "",
          setNumber: row.setNumber,
          weight: row.weight ?? null,
          reps: row.reps ?? null,
        });
      }
    }
  }

  return Array.from(workoutMap.values());
}

export async function createWorkout(data: typeof workouts.$inferInsert) {
  const [row] = await db.insert(workouts).values(data).returning();
  return row;
}

export async function getWorkoutById(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
  return row ?? null;
}

export async function updateWorkout(
  id: string,
  userId: string,
  data: { name: string; startedAt: Date }
) {
  const [row] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
    .returning();
  return row ?? null;
}

export async function getWorkoutWithExercises(
  id: string,
  userId: string
): Promise<WorkoutWithExercises | null> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const exerciseMap = new Map<string, WorkoutWithExercises["exercises"][0]>();
  const result: WorkoutWithExercises = {
    id: rows[0].workoutId,
    name: rows[0].workoutName,
    startedAt: rows[0].startedAt,
    completedAt: rows[0].completedAt,
    exercises: [],
  };

  for (const row of rows) {
    if (row.workoutExerciseId) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        const exercise = {
          id: row.workoutExerciseId,
          exerciseId: row.exerciseId ?? "",
          exerciseName: row.exerciseName ?? "",
          sets: [],
        };
        exerciseMap.set(row.workoutExerciseId, exercise);
        result.exercises.push(exercise);
      }
      if (row.setNumber !== null) {
        exerciseMap.get(row.workoutExerciseId)!.sets.push({
          id: row.setId ?? "",
          setNumber: row.setNumber,
          weight: row.weight ?? null,
          reps: row.reps ?? null,
        });
      }
    }
  }

  return result;
}
