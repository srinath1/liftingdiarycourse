import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { exercises } from "./schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const EXERCISES = [
  // Chest
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Fly",
  "Cable Fly",
  "Push-Up",
  "Dips",
  // Back
  "Pull-Up",
  "Chin-Up",
  "Barbell Row",
  "Dumbbell Row",
  "Seated Cable Row",
  "Lat Pulldown",
  "Deadlift",
  "Romanian Deadlift",
  // Shoulders
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Lateral Raise",
  "Front Raise",
  "Face Pull",
  "Upright Row",
  // Arms
  "Barbell Curl",
  "Dumbbell Curl",
  "Hammer Curl",
  "Preacher Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Overhead Tricep Extension",
  "Close-Grip Bench Press",
  // Legs
  "Squat",
  "Front Squat",
  "Leg Press",
  "Hack Squat",
  "Lunge",
  "Bulgarian Split Squat",
  "Leg Extension",
  "Leg Curl",
  "Calf Raise",
  "Hip Thrust",
  "Glute Bridge",
  // Core
  "Plank",
  "Crunch",
  "Hanging Leg Raise",
  "Ab Wheel Rollout",
  "Cable Crunch",
  "Russian Twist",
  // Cardio / Full Body
  "Barbell Clean",
  "Power Clean",
  "Kettlebell Swing",
  "Farmer's Walk",
];

async function seed() {
  console.log(`Seeding ${EXERCISES.length} exercises…`);
  await db
    .insert(exercises)
    .values(EXERCISES.map((name) => ({ name })));
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
