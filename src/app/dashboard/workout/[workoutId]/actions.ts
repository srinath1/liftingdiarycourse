"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

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
  return updated;
}
