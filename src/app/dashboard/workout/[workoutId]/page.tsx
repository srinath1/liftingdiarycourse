import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) notFound();

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
