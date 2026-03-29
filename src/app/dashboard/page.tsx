import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForDate } from "@/data/workouts";
import WorkoutDiary from "./_components/WorkoutDiary";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const selectedDate = dateParam
    ? (() => {
        const [year, month, day] = dateParam.split("-").map(Number);
        return new Date(year, month - 1, day);
      })()
    : new Date();

  const workouts = await getWorkoutsForDate(userId, selectedDate);

  return <WorkoutDiary workouts={workouts} selectedDate={selectedDate} />;
}
