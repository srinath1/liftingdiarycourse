import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutWithExercises } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import EditWorkoutForm from "./EditWorkoutForm";
import ExerciseLogger from "./ExerciseLogger";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const [workout, allExercises] = await Promise.all([
    getWorkoutWithExercises(workoutId, userId),
    getAllExercises(),
  ]);
  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-6">Edit Workout</h1>
        <EditWorkoutForm workout={workout} />
      </div>
      <ExerciseLogger workout={workout} allExercises={allExercises} />
    </div>
  );
}
