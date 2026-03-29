import { db } from "@/db";
import { exercises, workoutExercises, sets, workouts } from "@/db/schema";
import { eq, and, sql, ilike, asc } from "drizzle-orm";

export async function getAllExercises(): Promise<{ id: string; name: string }[]> {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function searchExercises(
  query: string
): Promise<{ id: string; name: string }[]> {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .where(ilike(exercises.name, `%${query}%`))
    .limit(20)
    .orderBy(exercises.name);
}

export async function createExercise(
  name: string
): Promise<{ id: string; name: string }> {
  const [row] = await db
    .insert(exercises)
    .values({ name })
    .returning({ id: exercises.id, name: exercises.name });
  return row;
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string
): Promise<{ id: string }> {
  const [maxRow] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${workoutExercises.order}), 0)` })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  const order = (maxRow?.maxOrder ?? 0) + 1;

  const [row] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning({ id: workoutExercises.id });
  return row;
}

export async function removeExerciseFromWorkout(
  workoutExerciseId: string,
  userId: string
): Promise<void> {
  // Ownership check: only delete if the workout belongs to the user
  const [row] = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );
  if (!row) throw new Error("Not found or access denied");

  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  workoutExerciseId: string,
  weight: string | null,
  reps: number | null
): Promise<{ id: string }> {
  const [maxRow] = await db
    .select({ maxSet: sql<number>`coalesce(max(${sets.setNumber}), 0)` })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  const setNumber = (maxRow?.maxSet ?? 0) + 1;

  const [row] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, weight, reps })
    .returning({ id: sets.id });
  return row;
}

export async function deleteSet(
  setId: string,
  userId: string
): Promise<void> {
  // Ownership: sets → workout_exercises → workouts → userId
  const [row] = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));
  if (!row) throw new Error("Not found or access denied");

  await db.delete(sets).where(eq(sets.id, setId));
}
