import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">Lifting Diary</h1>
      <p className="text-lg text-gray-600">Track your workouts and monitor your progress.</p>
      <p className="text-sm text-gray-400">Sign in or sign up to get started.</p>
    </main>
  );
}
