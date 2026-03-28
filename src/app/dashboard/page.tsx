"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

type Set = {
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

type WorkoutExercise = {
  id: string;
  exerciseName: string;
  sets: Set[];
};

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  exercises: WorkoutExercise[];
};

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Morning Push",
    startedAt: new Date(2026, 2, 28, 7, 0),
    completedAt: new Date(2026, 2, 28, 8, 15),
    exercises: [
      {
        id: "e1",
        exerciseName: "Bench Press",
        sets: [
          { setNumber: 1, weight: "80", reps: 8 },
          { setNumber: 2, weight: "80", reps: 8 },
          { setNumber: 3, weight: "82.5", reps: 6 },
        ],
      },
      {
        id: "e2",
        exerciseName: "Overhead Press",
        sets: [
          { setNumber: 1, weight: "50", reps: 10 },
          { setNumber: 2, weight: "50", reps: 9 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Evening Accessory",
    startedAt: new Date(2026, 2, 28, 18, 30),
    completedAt: null,
    exercises: [
      {
        id: "e3",
        exerciseName: "Tricep Dips",
        sets: [
          { setNumber: 1, weight: null, reps: 15 },
          { setNumber: 2, weight: null, reps: 12 },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const workouts = MOCK_WORKOUTS;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Workout Diary</h1>

        {/* Date Picker */}
        <div className="mb-8">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? formatDate(selectedDate) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workout List */}
        {workouts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No workouts logged for {formatDate(selectedDate)}.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {workouts.length} workout{workouts.length !== 1 ? "s" : ""} on {formatDate(selectedDate)}
            </p>
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{workout.name}</CardTitle>
                    <Badge variant={workout.completedAt ? "default" : "secondary"}>
                      {workout.completedAt ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(workout.startedAt, "h:mm a")}
                    {workout.completedAt && ` – ${format(workout.completedAt, "h:mm a")}`}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.exercises.map((ex) => (
                      <div key={ex.id}>
                        <p className="text-sm font-medium mb-1">{ex.exerciseName}</p>
                        <div className="flex flex-wrap gap-2">
                          {ex.sets.map((set) => (
                            <span
                              key={set.setNumber}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                            >
                              Set {set.setNumber}
                              {set.weight && ` · ${set.weight} kg`}
                              {set.reps && ` × ${set.reps}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
