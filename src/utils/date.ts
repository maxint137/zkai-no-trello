import { Assignment, Card } from "../types/board";
import { toEmojiDigit } from "./emoji";

export function calculateTaskDates(
  startDate: Date,
  assignments: Assignment[],
  hasExam: boolean = false
): Card[] {
  const allTasks: Card[] = [];

  const daysInMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();

  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    daysInMonth
  );
  const totalDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const spinTasks = (
    assignment: Assignment,
    currentDate: Date,
    daysPerAssignment: number,
    round: number
  ) => {
    const roundChars = ["", "⓵", "⓶", "⓷", "⓸", "⓹", "⓺", "⓻", "⓼", "⓽", "⓾"];
    const roundChar = 1 === assignment.rounds ? "" : roundChars[round];
    if (roundChar === undefined) {
      throw new Error("roundChar should be defined");
    }

    for (let i = 0; i < assignment.count; i++) {
      const startDate = new Date(currentDate);
      currentDate = new Date(
        startDate.getTime() + daysPerAssignment * (1000 * 60 * 60 * 24)
      );

      const index =
        hasExam && i == assignment.count - 1 ? "🧐" : toEmojiDigit(i + 1);

      allTasks.push({
        subject: `${assignment.subject} ${roundChar}${index}`,
        startDate: startDate,
        dueDate: currentDate,
        prototype: assignment,
      });
    }

    return currentDate;
  };

  assignments.forEach((assignment) => {
    const daysPerAssignment = totalDays / assignment.count / assignment.rounds;
    let currentDate = new Date(startDate);

    currentDate = spinTasks(assignment, currentDate, daysPerAssignment, 1);

    for (let round = 2; round <= assignment.rounds; round++) {
      currentDate = spinTasks(
        assignment,
        currentDate,
        daysPerAssignment,
        round
      );
    }
  });

  // Sort all assignments by due date
  allTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return allTasks;
}
