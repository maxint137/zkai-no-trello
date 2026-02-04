import { TrelloService, createTrelloService } from "../api/trello-service";
import { Card, StandardStepsType } from "../types/board";
import { toEmojiDigit } from "../utils/emoji";
import {
  getDateRangeFromISOWeek,
  getISOWeek,
} from "../utils/iso_week_calculator";

interface WeeklyTask {
  name: string;
  dayOffset: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  labels: string[]; // Array of label names or IDs
  steps?: StandardStepsType;
  estimatedHours: number;
}

const ToDoListName = "To Do 🌞";

const ProblemSteps: StandardStepsType = [
  {
    name: "Student",
    items: ["Solve", "Review"],
  },
  {
    name: "Teacher",
    items: ["Review", "Discuss Mistakes"],
  },
];

type WeeklyTaskList = WeeklyTask[];
type TasksTranche = WeeklyTaskList[];

// the initial parameters
const kickOffDate = new Date(2026, 2 - 1, 8); // month is 0-indexed
const startingClassNumber = 1;
const dryRun = false;

// prettier-ignore
const make_weekly_tasks_ex = (emoji: string, subject: string): WeeklyTaskList => [
  // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: `${emoji}? 第回1`, dayOffset: 0, labels: [subject, "Class"], estimatedHours: 2 },
  { name: `${emoji}? 基本問題2`, dayOffset: 1, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 1 },
  { name: `${emoji}? 練習問題3`, dayOffset: 2, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: `${emoji}? 反復問題(基本)4`, dayOffset: 3, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1 },
  { name: `${emoji}? 反復問題(練習)5`, dayOffset: 4, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 2 },
  { name: `${emoji}? トレーニング6`, dayOffset: 5, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: `${emoji}? 実戦演習7`, dayOffset: 6, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
];

// prettier-ignore
const make_summary_tasks_ex = (emoji: string, subject: string): WeeklyTaskList => [
  // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  { name: `${emoji}? 基本問題1`, dayOffset: 0, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 2 },
  { name: `${emoji}? 練習問題2`, dayOffset: 1, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 1 },
  { name: `${emoji}? ステップ🏃‍♂️`, dayOffset: 2, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1.5 },
  { name: `${emoji}? ステップ🙇‍♂️`, dayOffset: 3, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1 },
  { name: `${emoji}? 反ステップ🧗‍♂️`, dayOffset: 4, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 2 },
];

// prettier-ignore
const make_weekly_tasks = (
  emoji: string,
  subject: string
): WeeklyTaskList => [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    { name: `${emoji}? 第回1`, dayOffset: 0, labels: [subject, "Class"], estimatedHours: 2, },
    { name: `${emoji}? 要点チェック2`, dayOffset: 1, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${emoji}? まとめてみよう3`, dayOffset: 2, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1.5, },
    { name: `${emoji}? 基本問題4`, dayOffset: 3, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${emoji}? 練習問題5`, dayOffset: 4, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
    { name: `${emoji}? 発展問題6`, dayOffset: 5, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
  ];

// prettier-ignore
const make_summary_tasks = (
  emoji: string,
  subject: string
): WeeklyTaskList => [
    // dayOffset: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    { name: `${emoji}? 要点チェック1`, dayOffset: 0, labels: [subject, "Class"], estimatedHours: 2, },
    { name: `${emoji}? 練習問題2`, dayOffset: 1, labels: [subject, "Class"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${emoji}? 練習問題3`, dayOffset: 2, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1.5, },
    { name: `${emoji}? 応用問題4`, dayOffset: 3, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 1, },
    { name: `${emoji}? チャレンジ問題5`, dayOffset: 4, labels: [subject, "Ex"], steps: ProblemSteps, estimatedHours: 2, },
  ];

type WorkRecord = Record<
  string,
  { WEEKLY: WeeklyTaskList; SUMMARY: WeeklyTaskList }
>;

// what is the type here, if the subjects are dynamic?
const work: Record<string, WorkRecord> = {
  Ilya: {
    MATH: {
      WEEKLY: make_weekly_tasks_ex("🦈", "Math"),
      SUMMARY: make_summary_tasks_ex("🦈", "Math"),
    },
    JAPANESE: {
      WEEKLY: make_weekly_tasks_ex("🦤", "Jap"),
      SUMMARY: make_summary_tasks_ex("🦤", "Jap"),
    },
    SCIENCE: {
      WEEKLY: make_weekly_tasks("🐯", "Sci"),
      SUMMARY: make_summary_tasks("🐯", "Sci"),
    },
    SOCIAL: {
      WEEKLY: make_weekly_tasks("🦘", "Soc"),
      SUMMARY: make_summary_tasks("🦘", "Soc"),
    },
  },
  Adam: {
    MATH: {
      WEEKLY: make_weekly_tasks_ex("🐳", "Math"),
      SUMMARY: make_summary_tasks_ex("🐳", "Math"),
    },
    JAPANESE: {
      WEEKLY: make_weekly_tasks_ex("🦁", "Jap"),
      SUMMARY: make_summary_tasks_ex("🦁", "Jap"),
    },
    SCIENCE: {
      WEEKLY: make_weekly_tasks("🦒", "Sci"),
      SUMMARY: make_summary_tasks("🦒", "Sci"),
    },
    SOCIAL: {
      WEEKLY: make_weekly_tasks("🐘", "Soc"),
      SUMMARY: make_summary_tasks("🐘", "Soc"),
    },
  },
};

function generateTrancheSchedule({
  firstSaturday,
  classNumber,
  trancheLen,
}: {
  firstSaturday: Date;
  classNumber: number;
  trancheLen: number;
}): { dates: Date[]; classNumbers: number[] } {
  // Generate N weeks of dates starting from first Sunday
  const dates: Date[] = [];
  const classNumbers: number[] = [];

  for (let w = 0; w < trancheLen; w++) {
    const workStart = new Date(firstSaturday);
    workStart.setDate(firstSaturday.getDate() + w * 7);
    dates.push(
      ...Array.from({ length: 7 }, (_, j) => {
        const date = new Date(workStart);
        date.setDate(workStart.getDate() + j);
        return date;
      }),
    );
    classNumbers.push(classNumber + w);
  }

  return { dates, classNumbers };
}

async function createTrancheSchedule(
  userName: string,
  tasksTranche: TasksTranche,
  startingClassNumber: number,
  year: number,
  startingWeekNumber: number,
  trelloService: TrelloService,
  boardId: string,
  listId: string,
) {
  const trancheLen = tasksTranche.length;

  const firstWeek = getDateRangeFromISOWeek(year, startingWeekNumber);

  const { dates, classNumbers } = generateTrancheSchedule({
    firstSaturday: firstWeek.weekEnd,
    classNumber: startingClassNumber,
    trancheLen: trancheLen,
  });
  const labelMap = new Map<string, string>();

  // Get userId
  const userId = (await trelloService.api(`members/${userName}`))?.id;

  // Get all labels from the board
  const labels = await trelloService.api(`boards/${boardId}/labels`);
  labels.forEach((label: { name: string; id: string }) => {
    labelMap.set(label.name, label.id);
  });

  // Create cards for each week
  for (let week = 0; week < trancheLen; week++) {
    const weekDates = dates.slice(week * 7, (week + 1) * 7);
    const classNumber = classNumbers[week];

    // Create cards for each task this week
    for (const task of tasksTranche[week]) {
      const dueDate = new Date(weekDates[task.dayOffset]);
      dueDate.setHours(18, 0, 0, 0); // Set due time to 6 PM

      const startDate = new Date(dueDate);
      startDate.setHours(startDate.getHours() - task.estimatedHours);

      const labelIds = task.labels
        .map((labelName) => {
          const labelId = labelMap.get(labelName);
          if (!labelId) {
            console.warn(`Label "${labelName}" not found on board`);
          }
          return labelId;
        })
        .filter((id): id is string => id !== undefined);

      if (labelIds.length === 0) {
        console.warn(`No valid labels found for task "${task.name}"`);
        continue;
      }

      const card: Card = {
        subject: `${task.name.replace("?", toEmojiDigit(classNumber))}`,
        startDate: startDate,
        dueDate: dueDate,
        prototype: {
          subject: task.name,
          count: classNumber,
          rounds: 1,
          labels: task.labels,
          steps: task.steps,
        },
      };

      const createdCard = await trelloService.createCard(listId, card);
      await trelloService.addChecklist(createdCard.id, task.steps || []);
      await trelloService.addLabels(createdCard.id, labelIds);

      await trelloService.addMemberToCard(createdCard.id, userId);
    }
  }
}

async function findBoardId(
  trelloService: TrelloService,
  boardName: string,
): Promise<string> {
  const boards = await trelloService.api("members/me/boards");
  const board = boards.find(
    (b: { name: string; id: string }) =>
      b.name.toLowerCase() === boardName.toLowerCase(),
  );

  if (!board) {
    throw new Error(`Could not find board "${boardName}"`);
  }

  return board.id;
}

async function findListId(
  trelloService: TrelloService,
  boardId: string,
  listName: string,
): Promise<string> {
  const lists = await trelloService.api(`boards/${boardId}/lists`);
  const list = lists.find(
    (l: { name: string; id: string }) =>
      l.name.toLowerCase() === listName.toLowerCase(),
  );

  if (!list) {
    console.log(`Lists on board ${boardId}:`, lists);
    throw new Error(`Could not find list "${listName}" on board ${boardId}`);
  }

  return list.id;
}

async function main(userName: "Ilya" | "Adam") {
  const trelloService = createTrelloService(dryRun);

  // Look up board and list IDs by name
  const boardId = await findBoardId(trelloService, `${userName}'s ZK`);
  const listId = await findListId(trelloService, boardId, ToDoListName);

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();

  const tasks = work[userName];

  // create tranches array, walks through subjects listed in tasks, dynamically:
  const tranches: TasksTranche[] = [];

  for (const subjectKey of Object.keys(tasks) as (keyof WorkRecord)[]) {
    const subject = tasks[subjectKey];

    // Create arrays by repeating weekly tasks (similar to Python's list * n)
    tranches.push([...Array(4).fill(subject.WEEKLY), subject.SUMMARY]);
  }

  try {
    for (const tranche of tranches) {
      await createTrancheSchedule(
        userName == "Ilya" ? "ilyalevy" : "adamlevy74",
        tranche,
        startingClassNumber,
        currentYear,
        getISOWeek(kickOffDate).week,
        trelloService,
        boardId,
        listId,
      );
      console.log(
        tranche[0][0].name + "Monthly schedule created successfully ",
      );
    }
  } catch (error) {
    console.error("Error creating monthly schedule:", error);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const childName = args[0];

  if (childName !== "Ilya" && childName !== "Adam") {
    console.error("Invalid child name. Must be 'Ilya' or 'Adam'");
    process.exit(1);
  }

  main(childName);
}

export { createTrancheSchedule, WeeklyTask };
