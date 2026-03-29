"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import {
  searchExercises,
  createExercise,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  deleteSet,
} from "@/data/exercises";

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.string().datetime(),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(id: string, input: UpdateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = UpdateWorkoutSchema.parse(input);
  const updated = await updateWorkout(id, userId, {
    name: parsed.name,
    startedAt: new Date(parsed.startedAt),
  });

  if (!updated) throw new Error("Workout not found or access denied");
  revalidatePath(`/dashboard/workout/${id}`);
  return updated;
}

export async function searchExercisesAction(
  query: string
): Promise<{ id: string; name: string }[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return searchExercises(query);
}

const AddExerciseSchema = z.object({ exerciseId: z.string().uuid() });

export async function addExerciseToWorkoutAction(
  workoutId: string,
  input: { exerciseId: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const { exerciseId } = AddExerciseSchema.parse(input);
  const row = await addExerciseToWorkout(workoutId, exerciseId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
  return row;
}

const CreateExerciseSchema = z.object({ name: z.string().min(1).max(100) });

export async function createAndAddExerciseAction(
  workoutId: string,
  input: { name: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const { name } = CreateExerciseSchema.parse(input);
  const exercise = await createExercise(name);
  const row = await addExerciseToWorkout(workoutId, exercise.id);
  revalidatePath(`/dashboard/workout/${workoutId}`);
  return row;
}

export async function removeExerciseFromWorkoutAction(
  workoutId: string,
  workoutExerciseId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await removeExerciseFromWorkout(workoutExerciseId, userId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
}

const AddSetSchema = z.object({
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable(),
  reps: z.number().int().positive().nullable(),
});

export async function addSetAction(
  workoutExerciseId: string,
  workoutId: string,
  input: { weight: string | null; reps: number | null }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const { weight, reps } = AddSetSchema.parse(input);
  const row = await addSet(workoutExerciseId, weight, reps);
  revalidatePath(`/dashboard/workout/${workoutId}`);
  return row;
}

export async function deleteSetAction(setId: string, workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await deleteSet(setId, userId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
}
